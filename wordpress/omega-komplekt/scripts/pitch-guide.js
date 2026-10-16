import {rodRanges,lookupRod,lookupPipe,parseDimension} from 'omega-pitch-data';
const pitchSection=document.querySelector('#pitch-guide');
const pitchTabs=[...pitchSection.querySelectorAll('[role="tab"]')];
const pitchPanels=[...pitchSection.querySelectorAll('.pitch-panel')];
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
  panel.querySelector('.pitch-status').textContent='Укажите размеры — покажем значения из таблицы.';
  panel.querySelector('.pitch-result-note').textContent='Выбранный шаг можно добавить в форму ниже.';
  panel.querySelectorAll('.is-match').forEach(cell=>cell.classList.remove('is-match'));
  panel.querySelectorAll('input[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
  panel.querySelectorAll('.pitch-field-error').forEach(error=>{error.hidden=true;error.textContent='';});
}
function readPitchField(input) {
  const value=parseDimension(input.value);
  if(Number.isNaN(value)) {
    input.setAttribute('aria-invalid','true');
    const error=document.getElementById(`${input.id}-error`);error.textContent='Укажите размер больше нуля, например 40 или 2,5.';error.hidden=false;
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
      const result=lookupPipe(diameter,wall,adjacent);
      const description=`Труба Ø ${numberLabel(diameter)} мм, стенка ${numberLabel(wall)} мм`;
      if(result.state==='match') {
        panel.querySelector('.pitch-status').textContent=adjacent?`Для труб, лежащих рядом, используем строку стенки ${numberLabel(result.effectiveWall)} мм (${numberLabel(wall)} × 2).`:`${description}: шаг по таблице.`;
        panel.querySelector(`[data-pipe-row="${result.row}"][data-pipe-column="${result.column}"]`).classList.add('is-match');
        addPitchChoice(panel,result.pitch,`Ø ${numberLabel(diameter)} мм · стенка ${numberLabel(wall)} мм`,description+(adjacent?`; трубы рядом, строка ${numberLabel(result.effectiveWall)} мм`:''));
        panel.querySelector('.pitch-result-note').textContent='Добавьте шаг и размеры в форму заявки.';
      } else {
        panel.querySelector('.pitch-status').textContent='Для этих размеров в таблице нет значения.';
        panel.querySelector('.pitch-result-note').textContent='Откройте полную таблицу или опишите размеры в заявке — поможем с подбором. Ближайшие размеры автоматически не подставляем.';
      }
    }
  }
  panel.querySelector('.pitch-find').addEventListener('click',findPitch);
  inputs.forEach(input=>{
    input.addEventListener('input',()=>clearPitchResult(panel));
    input.addEventListener('keydown',event=>{if(event.key==='Enter'&&input.type!=='checkbox'){event.preventDefault();findPitch();}});
  });
});
pitchSection.querySelector('.pitch-tabs').hidden=false;
activatePitchTab(0);
pitchSection.classList.add('is-ready');
