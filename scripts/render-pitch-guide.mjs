import {readFile,writeFile} from 'node:fs/promises';
import {rodRanges,pipeDiameters,pipeWalls,pipePitches,bahcoPitches,lenoxPitchBands} from '../dist/scripts/pitch-data.js';
const arrow='<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
const chevron='<svg class="icon" aria-hidden="true"><use href="#i-chevron"/></svg>';
const field=(id,label,placeholder)=>`<div class="pitch-field"><label for="${id}">${label}</label><input id="${id}" type="text" inputmode="decimal" maxlength="9" autocomplete="off" placeholder="${placeholder}" aria-describedby="${id}-error"><p id="${id}-error" class="pitch-field-error" hidden></p></div>`;
const workbench=(kind,fields)=>`<div class="pitch-workbench" hidden><div class="pitch-controls" role="group" aria-label="Размеры ${kind==='rod'?'прутка':'трубы'}">${fields}<button class="button pitch-find" type="button">Найти шаг зуба${arrow}</button></div><div class="pitch-result"><p class="pitch-result-label">ВАШ ШАГ ЗУБА</p><p class="pitch-status" role="status" aria-live="polite">Укажите размеры — покажем значения из таблицы.</p><div class="pitch-choices"></div><p class="pitch-result-note">Выбранный шаг можно добавить в форму ниже.</p></div></div>`;
const guide=`<!-- PITCH_GUIDE_START -->
    <section class="pitch-section" id="pitch-guide" aria-labelledby="pitch-title" tabindex="-1"><div class="container">
      <div class="section-heading pitch-heading"><div><p class="eyebrow">ПОДБОР ШАГА ЗУБА</p><h2 id="pitch-title">Шаг зуба.<br>Под вашу заготовку.</h2></div><p>Укажите размер прутка или трубы.<br>TPI — количество зубьев на дюйм.</p></div>
      <div class="pitch-card"><div class="pitch-tabs" role="tablist" aria-label="Тип заготовки" hidden><button id="pitch-tab-rod" type="button" role="tab" aria-controls="pitch-panel-rod" aria-selected="true">Пруток</button><button id="pitch-tab-pipe" type="button" role="tab" aria-controls="pitch-panel-pipe" aria-selected="false" tabindex="-1">Труба</button></div>
      <div id="pitch-panel-rod" class="pitch-panel" aria-labelledby="pitch-rod-heading"><h3 id="pitch-rod-heading" class="pitch-panel-heading">Пруток</h3>
        ${workbench('rod',field('pitch-rod-diameter','Диаметр прутка, мм','Например, 60'))}
        <p class="pitch-overlap">Диапазоны в таблице пересекаются: одному диаметру могут соответствовать несколько вариантов шага. Уточним выбор по вашему материалу и станку.</p>
        <details class="pitch-reference"><summary>Вся таблица для прутка${chevron}</summary><div class="pitch-table-wrap"><table class="pitch-rod-table"><caption class="visually-hidden">Шаг зуба для прутка</caption><thead><tr><th scope="col">Диаметр, мм</th><th scope="col">Шаг зуба, TPI</th></tr></thead><tbody>${rodRanges.map((row,index)=>`<tr data-rod-index="${index}"><th scope="row">${row.label}</th><td>${row.pitch}</td></tr>`).join('')}</tbody></table></div></details>
      </div>
      <div id="pitch-panel-pipe" class="pitch-panel" aria-labelledby="pitch-pipe-heading"><h3 id="pitch-pipe-heading" class="pitch-panel-heading">Труба</h3>
        ${workbench('pipe',field('pitch-pipe-diameter','Наружный диаметр, мм','Например, 100')+field('pitch-pipe-wall','Толщина стенки, мм','Например, 4')+'<label class="pitch-adjacent"><input id="pitch-pipe-adjacent" type="checkbox"><span>Трубы лежат рядом при распиловке</span></label>')}
        <p class="pitch-overlap">При распиловке труб, лежащих рядом, используйте значения с удвоенной толщиной стенки. Пустая клетка — значение не указано.</p>
        <details class="pitch-reference"><summary>Вся таблица для труб${chevron}</summary><p class="pitch-scroll-hint">Столбцы — наружный диаметр в мм. Значения в ячейках — шаг зуба в TPI. Таблицу можно прокручивать по горизонтали.</p><div class="pitch-table-wrap pitch-pipe-scroll" role="region" tabindex="0" aria-label="Таблица шага зуба для труб, горизонтальная прокрутка"><table class="pitch-pipe-table"><caption class="visually-hidden">Труба: наружный диаметр и толщина стенки в миллиметрах</caption><thead><tr><th scope="col">Стенка,<br>мм</th>${pipeDiameters.map(value=>`<th scope="col">${value}</th>`).join('')}</tr></thead><tbody>${pipeWalls.map((wall,row)=>`<tr><th scope="row">${wall}</th>${pipePitches[row].map((pitch,column)=>`<td data-pipe-row="${row}" data-pipe-column="${column}"${pitch?'':' aria-label="Нет данных"'}>${pitch||'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>
      </div></div>
      <details class="pitch-break-in"><summary><span>Перед первым резом</span>Обкатка биметаллического полотна${chevron}</summary><p>При обкатке новой пилы подача пильной рамы и скорость вращения полотна должны составлять 50% — половину рекомендуемых параметров для разрезаемого материала.</p></details>
    </div></section>
    <!-- PITCH_GUIDE_END -->`;
let html=await readFile('dist/index.html','utf8');
if(html.includes('<!-- PITCH_GUIDE_START -->'))html=html.replace(/<!-- PITCH_GUIDE_START -->[\s\S]*?<!-- PITCH_GUIDE_END -->/,guide);
else html=html.replace('    <section class="order-section dark-section"',`${guide}\n\n    <section class="order-section dark-section"`);
if(!html.includes('id="pitch-guide"'))throw new Error('Pitch guide insertion point not found');
const pitches=[...new Set(['3/4','4/6','6/10',...rodRanges.map(row=>row.pitch),...pipePitches.flat().filter(Boolean),...bahcoPitches.flat().filter(Boolean),...lenoxPitchBands.flatMap(band=>band.pitches)])];
const options=['',...pitches.map(value=>`${value} TPI`),'Нужна помощь с подбором'];
html=html.replace(/(<ul class="tpi-options"[^>]*>)[\s\S]*?(<\/ul>)/,(_,start,end)=>start+options.map((value,index)=>`<li id="tpi-${index}" role="option" aria-selected="${index===0}" data-value="${value}">${value||'Шаг зуба / TPI'}</li>`).join('')+end);
await writeFile('dist/index.html',html);
console.log('Rendered: 11 rod ranges, 120 pipe cells, full TPI choices and no-JS tables.');
