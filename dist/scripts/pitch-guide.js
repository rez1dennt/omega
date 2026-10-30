import {rodRanges,lookupRod,recommendPipe,parseDimension,commonPipeDiameters} from './pitch-data.js';
const omegaUI={"eyebrow_1":"ПОДБОР ШАГА ЗУБА","heading_1":"Шаг зуба.","heading_2":"Под вашу заготовку.","paragraph_1":"Укажите размер прутка или трубы.","paragraph_2":"TPI — количество зубьев на дюйм.","label_1":"Пруток","label_2":"Труба","heading_3":"Пруток","label_3":"Диаметр прутка, мм","label_4":"Найти шаг зуба","paragraph_3":"ВАШ ШАГ ЗУБА","paragraph_4":"Укажите размеры — покажем значения из таблицы.","paragraph_5":"Выбранный шаг можно добавить в заявку.","paragraph_6":"Диапазоны в таблице пересекаются: одному диаметру могут соответствовать несколько вариантов шага. Уточним выбор по вашему материалу и станку.","label_5":"Вся таблица для прутка","heading_4":"Труба","label_6":"Наружный диаметр, мм","label_7":"Толщина стенки, мм","label_8":"Несколько труб в пакете","label_9":"Найти шаг зуба","paragraph_7":"РЕКОМЕНДУЕМЫЙ ШАГ","paragraph_8":"Укажите диаметр и стенку — покажем рекомендуемый шаг.","paragraph_9":"Биметаллическое полотно · стенка от {min_wall} до {max_wall} мм. Шаг по диаграмме {source}.","paragraph_10":"Для пакета {source} рекомендует шаг на одну группу крупнее. Справочные таблицы ниже относятся к другим методикам и могут давать другие рекомендации.","label_10":"Справочная таблица «Омега Комплект»","paragraph_11":"Столбцы — наружный диаметр в мм. Значения в ячейках — шаг зуба в TPI. Таблицу можно прокручивать по горизонтали.","label_11":"Перед первым резом","label_12":"Обкатка биметаллического полотна","paragraph_12":"При обкатке новой пилы подача пильной рамы и скорость вращения полотна должны составлять 50% — половину рекомендуемых параметров для разрезаемого материала.","tablist_label":"Тип заготовки","rod_group_label":"Размеры прутка","pipe_group_label":"Размеры трубы","rod_placeholder":"Например, 60","diameter_placeholder":"Например, 100","wall_placeholder":"Например, 4","rod_caption":"Шаг зуба для прутка","diameter_column":"Диаметр, мм","pitch_column":"Шаг зуба, TPI","pipe_region_label":"Таблица шага зуба для труб, горизонтальная прокрутка","pipe_caption":"Труба: наружный диаметр и толщина стенки в миллиметрах","wall_column":"Стенка, мм","no_data":"Нет данных","empty_cell":"—","dimension_wall":"толщину стенки","dimension_diameter":"наружный диаметр","dimension_rod":"диаметр прутка","example_wall":"4 или 2,5","example_diameter":"89 или 108","example_rod":"60","invalid_dimension":"Введите {dimension} больше нуля, например {example} мм.","missing_dimension":"Укажите {dimension} в миллиметрах.","add_aria":"Добавить {pitch} TPI в заявку","pitch_unit":"TPI","add_action":"В заявку","parameter_pitch":"{parameters}; шаг {pitch} TPI","transfer_success":"Шаг {pitch} TPI добавлен в форму заявки.","transfer_error":"Подбор не добавлен: сократите комментарий в форме и попробуйте ещё раз. Прежние данные сохранены.","check_dimensions":"Проверьте размеры: подсказка указана под полем.","rod_status":"Пруток Ø {diameter} мм: {result}","rod_multiple":"в таблице несколько вариантов шага.","rod_single":"шаг по таблице.","rod_no_match":"Для этого диаметра в таблице нет рекомендации. Опишите задачу в заявке.","rod_choice_caption":"Диаметр {range} мм","rod_parameters":"Пруток Ø {diameter} мм","rod_multiple_note":"Выберите вариант для заявки — уточним подбор по материалу и станку.","rod_single_note":"Добавьте шаг и размеры в форму заявки.","pipe_description":"Труба Ø {diameter} мм, стенка {wall} мм","bundle_status":"Для пакета — на одну группу крупнее.","source_label":"Диаграмма {source}, стр. {page}","pipe_choice_caption":"Стенка {wall} мм · {arrangement}","bundle_label":"пакет","single_pipe_label":"одна труба","pipe_parameters":"{description}; диаграмма {source}, стр. {page}{bundle}","bundle_parameters":"; пакет, на одну группу крупнее","boundary_note":"При чтении печатной диаграммы толщина попадает в зону перехода. Показаны соседние варианты для уточнения по материалу, станку и серии полотна.","multiple_note":"Диаграмма допускает оба варианта шага. Добавьте нужный в заявку — уточним по материалу и станку.","recommendation_note":"Рекомендация для биметаллического полотна. Добавьте шаг в заявку — проверим по вашему материалу и станку.","geometry_error":"Толщина стенки должна быть меньше половины наружного диаметра. Иначе это сплошной пруток.","wall_range_error":"Для этой диаграммы укажите толщину стенки от {min_wall} до {max_wall} мм.","check_wall":"Проверьте толщину стенки — подсказка под полем.","bundle_outside":"Для такого пакета диаграмма не задаёт следующий более крупный шаг.","outside_note":"Укажите параметры в заявке — специалист подберёт полотно для этой задачи.","common_title":"Частые диаметры","method":"Ориентировочный подбор для биметаллических полотен по печатной диаграмме {source}. Шаг зависит от толщины стенки; наружный диаметр нужен для проверки размеров трубы. Стенка — от {min_wall} до {max_wall} мм.","diameter_button":"{diameter} мм","common_note":"Наружный диаметр, не условный проход. После выбора укажите стенку и нажмите «{find_label}».","bahco_summary":"Дополнительная таблица {source}","bahco_note":"Отдельный справочник {source}. Автоматический подбор выше использует диаграмму {primary_source}; рекомендации разных производителей могут отличаться. Диаметры и стенки — в мм, шаг — в TPI.","bahco_source":"Источник: каталог {source}, стр. {page}","bahco_region":"Справочник {source}, горизонтальная прокрутка","bahco_caption":"Рекомендации {source} для труб, каталог стр. {page}","omega_method":"Подбор по таблице «Омега Комплект» с учётом наружного диаметра и толщины стенки.","omega_default_note":"Для точного размера покажем значение таблицы, для промежуточного — соседние ячейки.","omega_bundle_note":"Для труб в пакете используем удвоенную толщину стенки по примечанию к таблице.","omega_exact":"Значение по таблице «Омега Комплект».","omega_nearby":"В таблице нет точной ячейки: показаны соседние размеры и значения. Это ориентир, окончательный шаг уточнит специалист.","omega_missing":"В этой ячейке таблицы значение не указано. Обратитесь за консультацией.","omega_outside":"Для этих размеров таблица не содержит соседних значений. Обратитесь за консультацией.","omega_consult":"Получить консультацию","omega_caption":"Диаметр {diameter} мм · стенка {wall} мм","omega_status":"{description}. {bundle}","omega_bundle_status":"Для пакета учитываем стенку {effective_wall} мм.","omega_geometry":"Толщина стенки должна быть меньше половины наружного диаметра.","omega_missing_cell":"В таблице не указано","omega_table":"Таблица «Омега Комплект»","omega_exact_note":"Добавьте шаг в заявку или уточните подбор у специалиста.","omega_result_label":"ШАГ ПО ТАБЛИЦЕ"};
const text=(key,values={})=>String(omegaUI[key]??'').replace(/\{([a-z_]+)\}/g,(m,n)=>Object.hasOwn(values,n)?String(values[n]):m);
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
  panel.querySelector('.pitch-choices').replaceChildren();panel.querySelector('.pitch-consult')?.remove();
  panel.querySelector('.pitch-status').textContent=panel.id==='pitch-panel-pipe'?'Укажите диаметр и стенку — покажем рекомендуемый шаг.':'Укажите размеры — покажем значения из таблицы.';
  panel.querySelector('.pitch-result-note').textContent=panel.id==='pitch-panel-pipe'?text('omega_default_note'):'Выбранный шаг можно добавить в заявку.';
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
    const transferred=document.dispatchEvent(new CustomEvent('site:pitch-select',{cancelable:true,detail:{opener:button,tpi:`${pitch} TPI`,parameters:`${parameters}; шаг ${pitch} TPI`}}));
    panel.querySelector('.pitch-status').textContent=transferred?`Шаг ${pitch} TPI добавлен в форму заявки.`:'Подбор не добавлен: сократите комментарий в форме и попробуйте ещё раз. Прежние данные сохранены.';
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
      const adjacent=inputs[2].checked,result=recommendPipe(diameter,wall,adjacent);
      const description=`Труба Ø ${numberLabel(diameter)} мм, стенка ${numberLabel(wall)} мм`;
      const status=panel.querySelector('.pitch-status'),note=panel.querySelector('.pitch-result-note');
      if(result.reason==='geometry') {
        const error=document.getElementById(inputs[1].id+'-error');error.textContent=text('omega_geometry');error.hidden=false;inputs[1].setAttribute('aria-invalid','true');inputs[1].focus();status.textContent=text('omega_geometry');
      } else if(result.state==='outside'||result.state==='missing') {
        status.textContent=description+'.';note.textContent=text(result.state==='missing'?'omega_missing':'omega_outside');
      } else {
        status.textContent=text('omega_status',{description,bundle:adjacent?text('omega_bundle_status',{effective_wall:numberLabel(result.effectiveWall)}):''});
        result.choices.forEach(choice=>{
          const caption=text('omega_caption',{diameter:numberLabel(choice.diameter),wall:numberLabel(choice.wall)});
          panel.querySelector(`[data-pipe-row="${choice.row}"][data-pipe-column="${choice.column}"]`)?.classList.add('is-match');
          if(choice.pitch) addPitchChoice(panel,choice.pitch,caption,description+'; '+caption);
          else { const blank=document.createElement('p');blank.className='pitch-choice pitch-empty';blank.textContent=caption+' — '+text('omega_missing_cell');panel.querySelector('.pitch-choices').append(blank); }
        });
        note.textContent=text(result.state==='match'?'omega_exact_note':'omega_nearby');
      }
      if(result.state!=='invalid') {
        const consult=document.createElement('button');consult.type='button';consult.className='pitch-consult';consult.dataset.dialog='request-dialog';consult.textContent=text('omega_consult');note.after(consult);
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
    panel.querySelector('.pitch-result-label').textContent=text('omega_result_label');
    panel.querySelector('.pitch-adjacent span').textContent='Несколько труб в пакете';
    const method=document.createElement('p');method.className='pitch-method';method.textContent=text('omega_method');
    panel.querySelector('.pitch-workbench').before(method);
    panel.querySelector('.pitch-overlap').textContent=text('omega_bundle_note');
    panel.querySelector('.pitch-reference summary').firstChild.textContent=text('omega_table');
    commonPipeDiameters.forEach(diameter=>{
      const button=document.createElement('button');button.type='button';button.textContent=`${numberLabel(diameter)} мм`;
      button.addEventListener('click',()=>{inputs[0].value=String(diameter);clearPitchResult(panel);inputs[0].focus({preventScroll:true});});
      buttons.append(button);
    });
    const note=document.createElement('p');note.textContent='Наружный диаметр, не условный проход. После выбора укажите стенку и нажмите «Найти шаг зуба».';
    common.append(summary,buttons,note);inputs[0].closest('.pitch-field').append(common);
    clearPitchResult(panel);
  }
});
pitchCard.querySelector('.pitch-tabs').hidden=false;
activatePitchTab(0);
pitchSection.classList.add('is-ready');
