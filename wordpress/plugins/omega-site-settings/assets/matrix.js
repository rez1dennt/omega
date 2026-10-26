/* Structured table controls; every value remains a regular, individually validated ACF input. */
(() => {
  'use strict';
  function readMatrix(root) {
    const table=root.querySelector('table');
    return {
      diameters:[...table.tHead.rows[0].querySelectorAll('input')].map(input=>input.value),
      walls:[...table.tBodies[0].rows].map(row=>row.querySelector('th input').value),
      cells:[...table.tBodies[0].rows].map(row=>[...row.querySelectorAll('td input')].map(input=>input.value))
    };
  }
  function input(name,value,label,axis=false) {
    const element=document.createElement('input');element.type='text';element.name=name;element.value=value??'';
    element.className=axis?'omega-axis':'omega-pitch';element.setAttribute('aria-label',label);
    if(axis)element.inputMode='decimal';else element.maxLength=24;
    return element;
  }
  function removeButton(axis,index) {
    const button=document.createElement('button');button.type='button';button.className='omega-matrix-remove';button.textContent='×';
    button.setAttribute(`data-remove-${axis}`,String(index));button.setAttribute('aria-label',`Удалить ${axis==='row'?'строку':'столбец'} ${index+1}`);return button;
  }
  function renderMatrix(root,data) {
    const table=root.querySelector('table'),name=root.dataset.name;
    const heading=document.createElement('tr'),corner=document.createElement('th');corner.scope='col';corner.textContent='Толщина стенки, мм';heading.append(corner);
    data.diameters.forEach((diameter,column)=>{
      const th=document.createElement('th');th.scope='col';th.append(input(`${name}[diameters][${column}]`,diameter,`Наружный диаметр, мм, столбец ${column+1}`,true),removeButton('column',column));heading.append(th);
    });
    table.tHead.replaceChildren(heading);
    const rows=data.walls.map((wall,row)=>{
      const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';
      th.append(input(`${name}[walls][${row}]`,wall,`Толщина стенки, мм, строка ${row+1}`,true),removeButton('row',row));tr.append(th);
      data.diameters.forEach((diameter,column)=>{const td=document.createElement('td');td.append(input(`${name}[cells][${row}][${column}]`,data.cells[row][column],`TPI: стенка ${wall} мм, диаметр ${diameter} мм`));tr.append(td);});return tr;
    });
    table.tBodies[0].replaceChildren(...rows);
    root.querySelector('.omega-matrix-count').textContent=`${data.walls.length} строк × ${data.diameters.length} столбцов`;
    root.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function initialise(root) {
    if(root.dataset.omegaReady)return;root.dataset.omegaReady='1';
    root.addEventListener('click',event=>{
      const action=event.target.closest('[data-add-row],[data-add-column],[data-remove-row],[data-remove-column]');if(!action)return;
      const data=readMatrix(root),status=root.querySelector('.omega-matrix-status');status.textContent='';
      if(action.hasAttribute('data-add-row')||action.hasAttribute('data-add-column')) {
        const addRow=action.hasAttribute('data-add-row'),rows=data.walls.length+(addRow?1:0),columns=data.diameters.length+(addRow?0:1);
        if(rows>Number(root.dataset.maxRows)||columns>Number(root.dataset.maxColumns)||rows*columns>Number(root.dataset.maxCells)) {status.textContent='Достигнут предел размера таблицы. Удалите ненужную строку или столбец перед добавлением.';return;}
        if(addRow){const last=Number(String(data.walls.at(-1)).replace(',','.'))||0;data.walls.push(String(last+1));data.cells.push(data.diameters.map(()=>''));}
        else{const last=Number(String(data.diameters.at(-1)).replace(',','.'))||0;data.diameters.push(String(last+20));data.cells.forEach(row=>row.push(''));}
        renderMatrix(root,data);const inputs=root.querySelectorAll(addRow?'tbody tr:last-child th input':'thead th:last-child input');inputs[0]?.focus();inputs[0]?.select();return;
      }
      const removeRow=action.hasAttribute('data-remove-row'),index=Number(action.dataset[removeRow?'removeRow':'removeColumn']);
      if((removeRow?data.walls:data.diameters).length===1){status.textContent='Оставьте хотя бы одну строку и один столбец.';return;}
      if(removeRow){data.walls.splice(index,1);data.cells.splice(index,1);}else{data.diameters.splice(index,1);data.cells.forEach(row=>row.splice(index,1));}
      renderMatrix(root,data);root.querySelector(removeRow?'[data-add-row]':'[data-add-column]').focus();
    });
  }
  function scan(context=document){if(context.matches?.('.omega-matrix'))initialise(context);context.querySelectorAll('.omega-matrix').forEach(initialise);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan());else scan();
  if(window.acf){window.acf.addAction('append',element=>scan(element[0]||element));window.acf.addAction('ready',()=>scan());}
})();
