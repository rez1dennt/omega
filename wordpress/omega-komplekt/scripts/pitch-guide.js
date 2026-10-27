import {rodRanges,lookupRod,recommendPipe,parseDimension,bahcoSource,bahcoDiameters,bahcoWalls,bahcoPitches,lenoxSource,commonPipeDiameters} from 'omega-pitch-data';
const fallbackUI = {"eyebrow_1":"ПОДБОР ШАГА ЗУБА","heading_1":"Шаг зуба.","heading_2":"Под вашу заготовку.","paragraph_1":"Укажите размер прутка или трубы.","paragraph_2":"TPI — количество зубьев на дюйм.","label_1":"Пруток","label_2":"Труба","heading_3":"Пруток","label_3":"Диаметр прутка, мм","label_4":"Найти шаг зуба","paragraph_3":"ВАШ ШАГ ЗУБА","paragraph_4":"Укажите размеры — покажем значения из таблицы.","paragraph_5":"Выбранный шаг можно добавить в заявку.","paragraph_6":"Диапазоны в таблице пересекаются: одному диаметру могут соответствовать несколько вариантов шага. Уточним выбор по вашему материалу и станку.","label_5":"Вся таблица для прутка","heading_4":"Труба","label_6":"Наружный диаметр, мм","label_7":"Толщина стенки, мм","label_8":"Несколько труб в пакете","label_9":"Найти шаг зуба","paragraph_7":"РЕКОМЕНДУЕМЫЙ ШАГ","paragraph_8":"Укажите диаметр и стенку — покажем рекомендуемый шаг.","paragraph_9":"Биметаллическое полотно · стенка от {min_wall} до {max_wall} мм. Шаг по диаграмме {source}.","paragraph_10":"Для пакета {source} рекомендует шаг на одну группу крупнее. Справочные таблицы ниже относятся к другим методикам и могут давать другие рекомендации.","label_10":"Справочная таблица «Омега Комплект»","paragraph_11":"Столбцы — наружный диаметр в мм. Значения в ячейках — шаг зуба в TPI. Таблицу можно прокручивать по горизонтали.","label_11":"Перед первым резом","label_12":"Обкатка биметаллического полотна","paragraph_12":"При обкатке новой пилы подача пильной рамы и скорость вращения полотна должны составлять 50% — половину рекомендуемых параметров для разрезаемого материала.","tablist_label":"Тип заготовки","rod_group_label":"Размеры прутка","pipe_group_label":"Размеры трубы","rod_placeholder":"Например, 60","diameter_placeholder":"Например, 100","wall_placeholder":"Например, 4","rod_caption":"Шаг зуба для прутка","diameter_column":"Диаметр, мм","pitch_column":"Шаг зуба, TPI","pipe_region_label":"Таблица шага зуба для труб, горизонтальная прокрутка","pipe_caption":"Труба: наружный диаметр и толщина стенки в миллиметрах","wall_column":"Стенка, мм","no_data":"Нет данных","empty_cell":"—","dimension_wall":"толщину стенки","dimension_diameter":"наружный диаметр","dimension_rod":"диаметр прутка","example_wall":"4 или 2,5","example_diameter":"89 или 108","example_rod":"60","invalid_dimension":"Введите {dimension} больше нуля, например {example} мм.","missing_dimension":"Укажите {dimension} в миллиметрах.","add_aria":"Добавить {pitch} TPI в заявку","pitch_unit":"TPI","add_action":"В заявку","parameter_pitch":"{parameters}; шаг {pitch} TPI","transfer_success":"Шаг {pitch} TPI добавлен в форму заявки.","transfer_error":"Подбор не добавлен: сократите комментарий в форме и попробуйте ещё раз. Прежние данные сохранены.","check_dimensions":"Проверьте размеры: подсказка указана под полем.","rod_status":"Пруток Ø {diameter} мм: {result}","rod_multiple":"в таблице несколько вариантов шага.","rod_single":"шаг по таблице.","rod_no_match":"Для этого диаметра в таблице нет рекомендации. Опишите задачу в заявке.","rod_choice_caption":"Диаметр {range} мм","rod_parameters":"Пруток Ø {diameter} мм","rod_multiple_note":"Выберите вариант для заявки — уточним подбор по материалу и станку.","rod_single_note":"Добавьте шаг и размеры в форму заявки.","pipe_description":"Труба Ø {diameter} мм, стенка {wall} мм","bundle_status":"Для пакета — на одну группу крупнее.","source_label":"Диаграмма {source}, стр. {page}","pipe_choice_caption":"Стенка {wall} мм · {arrangement}","bundle_label":"пакет","single_pipe_label":"одна труба","pipe_parameters":"{description}; диаграмма {source}, стр. {page}{bundle}","bundle_parameters":"; пакет, на одну группу крупнее","boundary_note":"При чтении печатной диаграммы толщина попадает в зону перехода. Показаны соседние варианты для уточнения по материалу, станку и серии полотна.","multiple_note":"Диаграмма допускает оба варианта шага. Добавьте нужный в заявку — уточним по материалу и станку.","recommendation_note":"Рекомендация для биметаллического полотна. Добавьте шаг в заявку — проверим по вашему материалу и станку.","geometry_error":"Толщина стенки должна быть меньше половины наружного диаметра. Иначе это сплошной пруток.","wall_range_error":"Для этой диаграммы укажите толщину стенки от {min_wall} до {max_wall} мм.","check_wall":"Проверьте толщину стенки — подсказка под полем.","bundle_outside":"Для такого пакета диаграмма не задаёт следующий более крупный шаг.","outside_note":"Укажите параметры в заявке — специалист подберёт полотно для этой задачи.","common_title":"Частые диаметры","method":"Ориентировочный подбор для биметаллических полотен по печатной диаграмме {source}. Шаг зависит от толщины стенки; наружный диаметр нужен для проверки размеров трубы. Стенка — от {min_wall} до {max_wall} мм.","diameter_button":"{diameter} мм","common_note":"Наружный диаметр, не условный проход. После выбора укажите стенку и нажмите «{find_label}».","bahco_summary":"Дополнительная таблица {source}","bahco_note":"Отдельный справочник {source}. Автоматический подбор выше использует диаграмму {primary_source}; рекомендации разных производителей могут отличаться. Диаметры и стенки — в мм, шаг — в TPI.","bahco_source":"Источник: каталог {source}, стр. {page}","bahco_region":"Справочник {source}, горизонтальная прокрутка","bahco_caption":"Рекомендации {source} для труб, каталог стр. {page}"};
const configuredUI=window.OmegaTheme?.ui?.pitch||{};
const text=(key,values={})=>String(typeof configuredUI[key]==='string'?configuredUI[key]:fallbackUI[key]??'').replace(/\{([a-z_]+)\}/g,(match,name)=>Object.hasOwn(values,name)?String(values[name]):match);
const pitchSection=document.querySelector('#pitch-guide');
// The live card may already be inside the selection dialog while this module loads.
const pitchCard=document.querySelector('.pitch-card');
const pitchTabs=[...pitchCard.querySelectorAll('[role="tab"]')];
const pitchPanels=[...pitchCard.querySelectorAll('.pitch-panel')];
const numberLabel=value=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:8}).format(value);
const methodValues=()=>({source:lenoxSource.name,min_wall:numberLabel(lenoxSource.minWall),max_wall:numberLabel(lenoxSource.maxWall)});
const sourceValues=source=>({source:source.name,page:source.page});
function icon(fallback) {
  const choice=window.OmegaTheme?.iconChoices?.[fallback]||{};
  if(choice.mode==='image'&&typeof choice.image==='string') {
    try {
      const url=new URL(choice.image);
      if(['https:','http:'].includes(url.protocol)) {
        const image=document.createElement('img');image.className='icon is-custom-icon';image.src=url.href;image.alt='';image.setAttribute('aria-hidden','true');return image;
      }
    } catch { /* A malformed media URL retains the built-in icon. */ }
  }
  const allowed=['arrow','chevron','phone','mail','shield','check','play','lock','pin','close','menu'];
  const symbol=allowed.includes(choice.symbol)?choice.symbol:fallback;
  const viewboxes={shield:'0 0 32 36',play:'0 0 36 36',lock:'0 0 24 28',pin:'0 0 24 32'};
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','icon');svg.setAttribute('viewBox',viewboxes[symbol]||'0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-'+symbol);svg.append(use);return svg;
}
function sourceURL(source) {
  try {const url=new URL(source.url);if(!['https:','http:'].includes(url.protocol))return '#';url.hash='page='+Math.max(1,Number(source.page)||1);return url.href;} catch{return '#';}
}
function activatePitchTab(index,focus=false) {
  pitchTabs.forEach((tab,item)=>{tab.setAttribute('aria-selected',String(item===index));tab.tabIndex=item===index?0:-1;pitchPanels[item].hidden=item!==index;});
  if(focus)pitchTabs[index].focus({preventScroll:true});
}
pitchTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activatePitchTab(index));
  tab.addEventListener('keydown',event=>{const positions={ArrowRight:(index+1)%2,ArrowLeft:(index+1)%2,Home:0,End:1};if(!(event.key in positions))return;event.preventDefault();activatePitchTab(positions[event.key],true);});
});
function clearPitchResult(panel) {
  panel.querySelector('.pitch-choices').replaceChildren();
  const pipe=panel.id==='pitch-panel-pipe';
  panel.querySelector('.pitch-status').textContent=text(pipe?'paragraph_8':'paragraph_4',methodValues());
  panel.querySelector('.pitch-result-note').textContent=text(pipe?'paragraph_9':'paragraph_5',methodValues());
  panel.querySelectorAll('.is-match').forEach(cell=>cell.classList.remove('is-match'));
  panel.querySelectorAll('input[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
  panel.querySelectorAll('.pitch-field-error').forEach(error=>{error.hidden=true;error.textContent='';});
}
function readPitchField(input) {
  const value=parseDimension(input.value);
  if(Number.isNaN(value)) {
    const fields={'pitch-pipe-wall':['dimension_wall','example_wall'],'pitch-pipe-diameter':['dimension_diameter','example_diameter'],'pitch-rod-diameter':['dimension_rod','example_rod']};
    const [dimension,example]=fields[input.id];input.setAttribute('aria-invalid','true');
    const error=document.getElementById(input.id+'-error');
    error.textContent=text(input.value.trim()?'invalid_dimension':'missing_dimension',{dimension:text(dimension),example:text(example)});error.hidden=false;
  }
  return value;
}
function addPitchChoice(panel,pitch,description,parameters) {
  const button=document.createElement('button');button.type='button';button.className='pitch-choice';button.setAttribute('aria-label',text('add_aria',{pitch}));
  const value=document.createElement('strong');value.textContent=pitch;
  const unit=document.createElement('span');unit.className='pitch-choice-unit';unit.textContent=text('pitch_unit');
  const caption=document.createElement('small');caption.textContent=description;
  const action=document.createElement('span');action.className='pitch-choice-action';action.textContent=text('add_action');
  action.append(icon('arrow'));button.append(value,unit,caption,action);
  button.addEventListener('click',()=>{
    const transferred=document.dispatchEvent(new CustomEvent('site:pitch-select',{cancelable:true,detail:{opener:button,tpi:pitch+' TPI',parameters:text('parameter_pitch',{parameters,pitch})}}));
    panel.querySelector('.pitch-status').textContent=text(transferred?'transfer_success':'transfer_error',{pitch});
  });
  panel.querySelector('.pitch-choices').append(button);
}
function appendReferenceTable(panel) {
  const reference=document.createElement('details');reference.className='pitch-reference pitch-bahco-reference';
  const summary=document.createElement('summary');summary.textContent=text('bahco_summary',sourceValues(bahcoSource));summary.append(icon('chevron'));
  const note=document.createElement('p');note.className='pitch-scroll-hint';note.textContent=text('bahco_note',{source:bahcoSource.name,primary_source:lenoxSource.name}).trimEnd()+' ';
  const link=document.createElement('a');link.href=sourceURL(bahcoSource);link.target='_blank';link.rel='noopener noreferrer';link.textContent=text('bahco_source',sourceValues(bahcoSource));note.append(link);
  const scroll=document.createElement('div');scroll.className='pitch-table-wrap pitch-pipe-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',text('bahco_region',sourceValues(bahcoSource)));
  const table=document.createElement('table');table.className='pitch-pipe-table pitch-bahco-table';
  const caption=document.createElement('caption');caption.className='visually-hidden';caption.textContent=text('bahco_caption',sourceValues(bahcoSource));
  const head=document.createElement('thead'),headRow=document.createElement('tr');
  function heading(value,scope){const th=document.createElement('th');th.scope=scope;th.textContent=value;return th;}
  headRow.append(heading(text('wall_column'),'col'));bahcoDiameters.forEach(diameter=>headRow.append(heading(numberLabel(diameter),'col')));head.append(headRow);
  const body=document.createElement('tbody');bahcoWalls.forEach((wall,row)=>{
    const tr=document.createElement('tr');tr.append(heading(numberLabel(wall),'row'));
    bahcoPitches[row].forEach((pitch,column)=>{const td=document.createElement('td');td.dataset.bahcoRow=String(row);td.dataset.bahcoColumn=String(column);td.textContent=pitch||text('empty_cell');if(!pitch)td.setAttribute('aria-label',text('no_data'));tr.append(td);});body.append(tr);
  });
  table.append(caption,head,body);scroll.append(table);reference.append(summary,note,scroll);panel.append(reference);
}
pitchPanels.forEach((panel,index)=>{
  panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',pitchTabs[index].id);panel.querySelector('.pitch-workbench').hidden=false;
  const inputs=[...panel.querySelectorAll('.pitch-controls input')];
  function findPitch() {
    clearPitchResult(panel);const diameter=readPitchField(inputs[0]),wall=index===1?readPitchField(inputs[1]):null;
    if(Number.isNaN(diameter)||(index===1&&Number.isNaN(wall))){panel.querySelector('.pitch-status').textContent=text('check_dimensions');panel.querySelector('[aria-invalid="true"]').focus();return;}
    if(index===0) {
      const matches=lookupRod(diameter);
      panel.querySelector('.pitch-status').textContent=matches.length?text('rod_status',{diameter:numberLabel(diameter),result:text(matches.length>1?'rod_multiple':'rod_single')}):text('rod_no_match');
      matches.forEach(row=>{panel.querySelector('[data-rod-index="'+rodRanges.indexOf(row)+'"]')?.classList.add('is-match');addPitchChoice(panel,row.pitch,text('rod_choice_caption',{range:row.label}),text('rod_parameters',{diameter:numberLabel(diameter)}));});
      panel.querySelector('.pitch-result-note').textContent=text(matches.length>1?'rod_multiple_note':matches.length?'rod_single_note':'outside_note');
    } else {
      const adjacent=inputs[2].checked,result=recommendPipe(diameter,wall,adjacent);
      const description=text('pipe_description',{diameter:numberLabel(diameter),wall:numberLabel(wall)});
      if(result.state==='recommendation') {
        const status=panel.querySelector('.pitch-status');status.textContent=[description+'.',adjacent?text('bundle_status').trim():''].filter(Boolean).join(' ')+' ';
        const link=document.createElement('a');link.href=sourceURL(lenoxSource);link.target='_blank';link.rel='noopener noreferrer';link.textContent=text('source_label',sourceValues(lenoxSource));status.append(link);
        result.pitches.forEach(pitch=>addPitchChoice(panel,pitch,text('pipe_choice_caption',{wall:numberLabel(wall),arrangement:text(adjacent?'bundle_label':'single_pipe_label')}),text('pipe_parameters',{description,...sourceValues(lenoxSource),bundle:adjacent?text('bundle_parameters'):''})));
        panel.querySelector('.pitch-result-note').textContent=text(result.nearBoundary?'boundary_note':result.pitches.length>1?'multiple_note':'recommendation_note');
      } else {
        if(result.reason==='geometry'||result.reason==='wall-range') {
          const error=document.getElementById(inputs[1].id+'-error');error.textContent=text(result.reason==='geometry'?'geometry_error':'wall_range_error',methodValues());error.hidden=false;inputs[1].setAttribute('aria-invalid','true');inputs[1].focus();panel.querySelector('.pitch-status').textContent=text('check_wall');
        } else panel.querySelector('.pitch-status').textContent=text('bundle_outside');
        panel.querySelector('.pitch-result-note').textContent=text('outside_note');
      }
    }
  }
  panel.querySelector('.pitch-find').addEventListener('click',findPitch);
  inputs.forEach(input=>{input.addEventListener('input',()=>clearPitchResult(panel));input.addEventListener('keydown',event=>{if(event.key==='Enter'&&input.type!=='checkbox'){event.preventDefault();findPitch();}});});
  if(index===1) {
    const common=document.createElement('details');common.className='pitch-common-diameters';
    const summary=document.createElement('summary');summary.textContent=text('common_title');
    const buttons=document.createElement('div');buttons.className='pitch-diameter-buttons';
    panel.querySelector('.pitch-result-label').textContent=text('paragraph_7');panel.querySelector('.pitch-adjacent span').textContent=text('label_8');
    const method=document.createElement('p');method.className='pitch-method';method.textContent=text('method',methodValues());panel.querySelector('.pitch-workbench').before(method);
    panel.querySelector('.pitch-overlap').textContent=text('paragraph_10',methodValues());
    commonPipeDiameters.forEach(diameter=>{const button=document.createElement('button');button.type='button';button.textContent=text('diameter_button',{diameter:numberLabel(diameter)});button.addEventListener('click',()=>{inputs[0].value=String(diameter);clearPitchResult(panel);inputs[0].focus({preventScroll:true});});buttons.append(button);});
    const note=document.createElement('p');note.textContent=text('common_note',{find_label:text('label_9')});common.append(summary,buttons,note);inputs[0].closest('.pitch-field').append(common);
    appendReferenceTable(panel);
  }
  clearPitchResult(panel);
});
pitchCard.querySelector('.pitch-tabs').hidden=false;activatePitchTab(0);pitchSection.classList.add('is-ready');
