(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const elements = [...document.querySelectorAll('.section-heading,.advantage,.production-copy,.production-media,.order-copy,.order-form,.machines-copy,.machines-panel,.delivery-copy,.delivery-offer,.delivery-route')];
  const revealAll = () => elements.forEach(element => element.classList.add('is-visible'));
  elements.forEach(element => {
    element.classList.add('motion-reveal');
    const step = element.classList.contains('advantage') ? [...element.parentElement.children].indexOf(element) : 0;
    element.style.setProperty('--reveal-delay', `${step * 65}ms`);
  });
  if (reduced.matches || !('IntersectionObserver' in window)) { revealAll(); return; }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -20px 0px' });
  elements.forEach(element => observer.observe(element));
  reduced.addEventListener('change', event => { if (event.matches) { observer.disconnect(); revealAll(); } });
})();
