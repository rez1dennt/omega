import {rodRanges,lookupRod,recommendPipe,parseDimension,bahcoSource,bahcoDiameters,bahcoWalls,bahcoPitches,lenoxSource,commonPipeDiameters} from './pitch-data.js';
const pitchSection=document.querySelector('#pitch-guide');
// The live card can already be inside the selection dialog on a slow connection.
const pitchCard=document.querySelector('.pitch-card');
const pitchTabs=[...pitchCard.querySelectorAll('[role="tab"]')];
const pitchPanels=[...pitchCard.querySelectorAll('.pitch-panel')];
const numberLabel=value=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:8}).format(value);
function activatePitchTab(index,focus=false) {
  pitchTabs.forEach((tab,item)=>{
    tab.setAttribute('aria-selected',String(item===index));tab.tabIndex=item===index?0:-1;
    pitchPanels[item].hidden=item!==index;
  });
  if(focus)pitchTabs[index].focus({preventScroll:true});
}
pitchTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activatePitchTab(index));
  tab.addEventListener('keydown',event=>{
    const positions={ArrowRight:(index+1)%2,ArrowLeft:(index+1)%2,Home:0,End:1};
    if(!(event.key in positions))return;
    event.preventDefault();activatePitchTab(positions[event.key],true);
  });
});
function clearPitchResult(panel) {
  panel.querySelector('.pitch-choices').replaceChildren();
  panel.querySelector('.pitch-status').textContent=panel.id==='pitch-panel-pipe'?'Укажите диаметр и стенку — покажем рекомендуемый шаг.':'Укажите размеры — покажем значения из таблицы.';
  panel.querySelector('.pitch-result-note').textContent=panel.id==='pitch-panel-pipe'?'Биметаллическое полотно · стенка от 1,25 до 50 мм. Шаг по диаграмме LENOX.':'Выбранный шаг можно добавить в форму ниже.';
  panel.querySelectorAll('.is-match').forEach(cell=>cell.classList.remove('is-match'));
  panel.querySelectorAll('input[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
  panel.querySelectorAll('.pitch-field-error').forEach(error=>{error.hidden=true;error.textContent='';});
}
function readPitchField(input) {
  const value=parseDimension(input.value);
  if(Number.isNaN(value)) {
    const fields={
      'pitch-pipe-wall':['толщину стенки','4 или 2,5'],
      'pitch-pipe-diameter':['наружный диаметр','89 или 108'],
      'pitch-rod-diameter':['диаметр прутка','60']
    };
    const [dimension,example]=fields[input.id];
    input.setAttribute('aria-invalid','true');
    const error=document.getElementById(`${input.id}-error`);
    error.textContent=input.value.trim()?`Введите ${dimension} больше нуля, например ${example} мм.`:`Укажите ${dimension} в миллиметрах.`;
    error.hidden=false;
  }
  return value;
}
function addPitchChoice(panel,pitch,description,parameters) {
  const button=document.createElement('button');button.type='button';button.className='pitch-choice';
  button.setAttribute('aria-label',`Добавить ${pitch} TPI в заявку`);
  const value=document.createElement('strong');value.textContent=pitch;
  const unit=document.createElement('span');unit.className='pitch-choice-unit';unit.textContent='TPI';
  const caption=document.createElement('small');caption.textContent=description;
  const action=document.createElement('span');action.className='pitch-choice-action';action.textContent='В заявку';
  const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('class','icon');arrow.setAttribute('aria-hidden','true');
  const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-arrow');arrow.append(use);action.append(arrow);
  button.append(value,unit,caption,action);
  button.addEventListener('click',()=>{
    const transferred=document.dispatchEvent(new CustomEvent('site:pitch-select',{cancelable:true,detail:{tpi:`${pitch} TPI`,parameters:`${parameters}; шаг ${pitch} TPI`}}));
    panel.querySelector('.pitch-status').textContent=transferred?`Шаг ${pitch} TPI добавлен в форму заявки ниже.`:'Подбор не добавлен: сократите комментарий в форме и попробуйте ещё раз. Прежние данные сохранены.';
  });
  panel.querySelector('.pitch-choices').append(button);
}
pitchPanels.forEach((panel,index)=>{
  panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',pitchTabs[index].id);
  panel.querySelector('.pitch-workbench').hidden=false;
  const inputs=[...panel.querySelectorAll('.pitch-controls input')];
  function findPitch() {
    clearPitchResult(panel);
    const diameter=readPitchField(inputs[0]);
    const wall=index===1?readPitchField(inputs[1]):null;
    if(Number.isNaN(diameter)||(index===1&&Number.isNaN(wall))) {
      panel.querySelector('.pitch-status').textContent='Проверьте размеры: подсказка указана под полем.';
      panel.querySelector('[aria-invalid="true"]').focus();return;
    }
    if(index===0) {
      const matches=lookupRod(diameter);
      panel.querySelector('.pitch-status').textContent=`Пруток Ø ${numberLabel(diameter)} мм: ${matches.length>1?'в таблице несколько вариантов шага.':'шаг по таблице.'}`;
      matches.forEach(row=>{
        panel.querySelector(`[data-rod-index="${rodRanges.indexOf(row)}"]`).classList.add('is-match');
        addPitchChoice(panel,row.pitch,`Диаметр ${row.label} мм`,`Пруток Ø ${numberLabel(diameter)} мм`);
      });
      panel.querySelector('.pitch-result-note').textContent=matches.length>1?'Выберите вариант для заявки — уточним подбор по материалу и станку.':'Добавьте шаг и размеры в форму заявки.';
    } else {
      const adjacent=inputs[2].checked;
      const result=recommendPipe(diameter,wall,adjacent);
      const description=`Труба Ø ${numberLabel(diameter)} мм, стенка ${numberLabel(wall)} мм`;
      if(result.state==='recommendation') {
        const status=panel.querySelector('.pitch-status');status.textContent=`${description}. ${adjacent?'Для пакета — на одну группу крупнее. ':''}`;
        const link=document.createElement('a');link.href=lenoxSource.url+'#page=10';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Диаграмма LENOX, стр. 10';status.append(link);
        result.pitches.forEach(pitch=>addPitchChoice(panel,pitch,`Стенка ${numberLabel(wall)} мм · ${adjacent?'пакет':'одна труба'}`,`${description}; диаграмма LENOX, стр. 10${adjacent?'; пакет, на одну группу крупнее':''}`));
        panel.querySelector('.pitch-result-note').textContent=result.nearBoundary?'При чтении печатной диаграммы толщина попадает в зону перехода. Показаны соседние варианты для уточнения по материалу, станку и серии полотна.':result.pitches.length>1?'Диаграмма допускает оба варианта шага. Добавьте нужный в заявку — уточним по материалу и станку.':'Рекомендация для биметаллического полотна. Добавьте шаг в заявку — проверим по вашему материалу и станку.';
      } else {
        if(result.reason==='geometry'||result.reason==='wall-range') {
          const error=document.getElementById(`${inputs[1].id}-error`);
          error.textContent=result.reason==='geometry'?'Толщина стенки должна быть меньше половины наружного диаметра. Иначе это сплошной пруток.':'Для этой диаграммы укажите толщину стенки от 1,25 до 50 мм.';
          error.hidden=false;inputs[1].setAttribute('aria-invalid','true');inputs[1].focus();
          panel.querySelector('.pitch-status').textContent='Проверьте толщину стенки — подсказка под полем.';
        } else {
          panel.querySelector('.pitch-status').textContent='Для такого пакета диаграмма не задаёт следующий более крупный шаг.';
        }
        panel.querySelector('.pitch-result-note').textContent='Укажите параметры в заявке — специалист подберёт полотно для этой задачи.';
      }
    }
  }
  panel.querySelector('.pitch-find').addEventListener('click',findPitch);
  inputs.forEach(input=>{
    input.addEventListener('input',()=>clearPitchResult(panel));
    input.addEventListener('keydown',event=>{if(event.key==='Enter'&&input.type!=='checkbox'){event.preventDefault();findPitch();}});
  });
  if(index===1) {
    const common=document.createElement('details');common.className='pitch-common-diameters';
    const summary=document.createElement('summary');summary.textContent='Частые диаметры';
    const buttons=document.createElement('div');buttons.className='pitch-diameter-buttons';
    panel.querySelector('.pitch-result-label').textContent='РЕКОМЕНДУЕМЫЙ ШАГ';
    panel.querySelector('.pitch-adjacent span').textContent='Несколько труб в пакете';
    const method=document.createElement('p');method.className='pitch-method';method.textContent='Ориентировочный подбор для биметаллических полотен по печатной диаграмме LENOX. Шаг зависит от толщины стенки; наружный диаметр нужен для проверки размеров трубы. Стенка — от 1,25 до 50 мм.';
    panel.querySelector('.pitch-workbench').before(method);
    panel.querySelector('.pitch-overlap').textContent='Для пакета LENOX рекомендует шаг на одну группу крупнее. Справочные таблицы ниже относятся к другим методикам и могут давать другие рекомендации.';
    panel.querySelector('.pitch-reference summary').firstChild.textContent='Справочная таблица «Омега Комплект»';
    commonPipeDiameters.forEach(diameter=>{
      const button=document.createElement('button');button.type='button';button.textContent=`${numberLabel(diameter)} мм`;
      button.addEventListener('click',()=>{inputs[0].value=String(diameter);clearPitchResult(panel);inputs[0].focus({preventScroll:true});});
      buttons.append(button);
    });
    const note=document.createElement('p');note.textContent='Наружный диаметр, не условный проход. После выбора укажите стенку и нажмите «Найти шаг зуба».';
    common.append(summary,buttons,note);inputs[0].closest('.pitch-field').append(common);
    const reference=document.createElement('details');reference.className='pitch-reference pitch-bahco-reference';
    const referenceSummary=document.createElement('summary');referenceSummary.textContent='Дополнительная таблица BAHCO';
    const referenceNote=document.createElement('p');referenceNote.className='pitch-scroll-hint';referenceNote.textContent='Отдельный справочник BAHCO. Автоматический подбор выше использует диаграмму LENOX; рекомендации разных производителей могут отличаться. Диаметры и стенки — в мм, шаг — в TPI. ';
    const sourceLink=document.createElement('a');sourceLink.href=bahcoSource.url+'#page=35';sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';sourceLink.textContent='Источник: каталог BAHCO, стр. 35';referenceNote.append(sourceLink);
    const scroll=document.createElement('div');scroll.className='pitch-table-wrap pitch-pipe-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Справочник BAHCO, горизонтальная прокрутка');
    const table=document.createElement('table');table.className='pitch-pipe-table pitch-bahco-table';
    table.innerHTML=`<caption class="visually-hidden">Рекомендации BAHCO для труб, каталог стр. 35</caption><thead><tr><th scope="col">Стенка,<br>мм</th>${bahcoDiameters.map(value=>`<th scope="col">${numberLabel(value)}</th>`).join('')}</tr></thead><tbody>${bahcoWalls.map((wall,row)=>`<tr><th scope="row">${wall}</th>${bahcoPitches[row].map((pitch,column)=>`<td data-bahco-row="${row}" data-bahco-column="${column}"${pitch?'':' aria-label="Нет данных"'}>${pitch||'—'}</td>`).join('')}</tr>`).join('')}</tbody>`;
    scroll.append(table);reference.append(referenceSummary,referenceNote,scroll);panel.append(reference);
    clearPitchResult(panel);
  }
});
pitchCard.querySelector('.pitch-tabs').hidden=false;
activatePitchTab(0);
pitchSection.classList.add('is-ready');
