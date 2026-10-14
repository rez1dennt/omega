/* A digit-based mask: formatting characters never trap Backspace or Delete. */
function attachPhoneMask(input) {
  const nationalDigits = value => {
    const digits = value.replace(/\D/g, '');
    if (value.trim().startsWith('+7')) {
      const national = digits.slice(1);
      return (national.length > 10 && /^[78]/.test(national) ? national.slice(1) : national).slice(0, 10);
    }
    if (digits.length > 10 && /^[78]/.test(digits)) return digits.slice(1, 11);
    return digits.slice(0, 10);
  };
  const format = digits => {
    if (!digits) return '+7 (';
    let value = `+7 (${digits.slice(0, 3)}`;
    if (digits.length >= 3) value += ') ';
    if (digits.length > 3) value += digits.slice(3, 6);
    if (digits.length >= 6) value += '-';
    if (digits.length > 6) value += digits.slice(6, 8);
    if (digits.length >= 8) value += '-';
    if (digits.length > 8) value += digits.slice(8, 10);
    return value;
  };
  const positions = value => [...value].flatMap((char, index) => /\d/.test(char) ? [index] : []).slice(1);
  const render = (digits, cursorIndex) => {
    input.value = format(digits);
    const digitPositions = positions(input.value);
    const caret = cursorIndex >= digits.length ? input.value.length : cursorIndex ? digitPositions[cursorIndex - 1] + 1 : 4;
    input.setSelectionRange(caret, caret);
  };
  input.addEventListener('focus', () => { if (!input.value) input.value = format(''); });
  input.addEventListener('beforeinput', event => {
    if (!['deleteContentBackward', 'deleteContentForward', 'deleteByCut'].includes(event.inputType)) return;
    const digits = nationalDigits(input.value);
    const digitPositions = positions(input.value);
    const start = input.selectionStart;
    const end = input.selectionEnd;
    let indexes = digitPositions.flatMap((position, index) => position >= start && position < end ? [index] : []);
    if (start === end) {
      const index = event.inputType === 'deleteContentBackward'
        ? digitPositions.findLastIndex(position => position < start)
        : digitPositions.findIndex(position => position >= start);
      indexes = index >= 0 ? [index] : [];
    }
    event.preventDefault();
    const remaining = [...digits].filter((_, index) => !indexes.includes(index)).join('');
    render(remaining, indexes[0] ?? digitPositions.filter(position => position < start).length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  input.addEventListener('input', () => {
    const raw = input.value;
    let cursorIndex = raw.slice(0, input.selectionStart).replace(/\D/g, '').length;
    if (raw.trim().startsWith('+7') || (raw.replace(/\D/g, '').length > 10 && /^[78]/.test(raw.replace(/\D/g, '')))) cursorIndex--;
    render(nationalDigits(raw), Math.max(0, cursorIndex));
  });
  input.addEventListener('blur', () => { if (!nationalDigits(input.value)) input.value = ''; });
}
