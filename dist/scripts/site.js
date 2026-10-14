/* Только интерфейс демонстрации. Данные формы не отправляются и не сохраняются. */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

function setMenu(open, returnFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', open);
  if (returnFocus) menuButton.focus({ preventScroll: true });
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false, true);
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) setMenu(false);
});
window.matchMedia('(min-width: 1024px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

const orderForm = document.querySelector('#order-form');
const comment = orderForm.elements.comment;
const status = orderForm.querySelector('.form-status');
document.querySelectorAll('[data-machine]').forEach(link => {
  link.addEventListener('click', () => {
    const text = comment.value.replace(/^Станок: [^\n]*(\n|$)/, '');
    comment.value = `Станок: ${link.dataset.machine}${text ? `\n${text}` : ''}`;
    document.querySelectorAll('[data-machine]').forEach(machine => {
      machine.removeAttribute('aria-current');
    });
    link.setAttribute('aria-current', 'true');
    status.hidden = true;
  });
});
orderForm.addEventListener('submit', event => {
  event.preventDefault();
  status.textContent = 'Это демонстрационная форма. Заявка не отправлена. Рабочий прием заказов подключим после утверждения сайта.';
  status.hidden = false;
});
