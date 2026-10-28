/**
 * Site Security & DevTools Protection:
 * - Disables inspect shortcuts (F12, Ctrl+Shift+I, Cmd+Option+I, Ctrl+Shift+J, Cmd+Option+J, Ctrl+Shift+C, Cmd+Option+C, Ctrl+U, Cmd+Option+U, Cmd+Shift+C)
 * - Disables right-click context menu (Inspect Element) except inside editable text inputs
 * - Keeps console and internal dev tools hidden and clean
 */

export function initSecurity() {
  if (typeof window === 'undefined') return;

  // 1. Disable keyboard shortcuts that trigger DevTools or View Source
  window.addEventListener(
    'keydown',
    (e) => {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform || '');
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key ? e.key.toUpperCase() : '';
      const code = e.code || '';
      const keyCode = e.keyCode || e.which;

      // F12 (Windows / Mac / Linux)
      if (key === 'F12' || code === 'F12' || keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I (Windows/Linux) or Cmd + Option + I / Cmd + Shift + I (Mac) - DevTools Elements/Inspect
      if (
        (e.ctrlKey && e.shiftKey && (key === 'I' || code === 'KeyI' || keyCode === 73)) ||
        (e.metaKey && e.altKey && (key === 'I' || code === 'KeyI' || keyCode === 73)) ||
        (e.metaKey && e.shiftKey && (key === 'I' || code === 'KeyI' || keyCode === 73))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + J (Windows/Linux) or Cmd + Option + J (Mac) - DevTools Console
      if (
        (e.ctrlKey && e.shiftKey && (key === 'J' || code === 'KeyJ' || keyCode === 74)) ||
        (e.metaKey && e.altKey && (key === 'J' || code === 'KeyJ' || keyCode === 74))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + C (Windows/Linux) or Cmd + Option + C / Cmd + Shift + C (Mac) - Element Inspector
      if (
        (e.ctrlKey && e.shiftKey && (key === 'C' || code === 'KeyC' || keyCode === 67)) ||
        (e.metaKey && e.altKey && (key === 'C' || code === 'KeyC' || keyCode === 67)) ||
        (e.metaKey && e.shiftKey && (key === 'C' || code === 'KeyC' || keyCode === 67))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (Windows/Linux) or Cmd + Option + U / Cmd + U (Mac) - View Page Source
      if (
        (e.ctrlKey && (key === 'U' || code === 'KeyU' || keyCode === 85)) ||
        (e.metaKey && e.altKey && (key === 'U' || code === 'KeyU' || keyCode === 85)) ||
        (e.metaKey && (key === 'U' || code === 'KeyU' || keyCode === 85))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S (Save Page)
      if (isCmdOrCtrl && (key === 'S' || code === 'KeyS' || keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true
  );

  // 2. Disable right-click context menu (prevents right-click -> "Inspect")
  window.addEventListener(
    'contextmenu',
    (e) => {
      const target = e.target;
      const tagName = (target && target.tagName) || '';
      const isEditable = target && (target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA');
      
      // Allow normal copy/paste inside input and textarea fields
      if (!isEditable) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true
  );

  // 3. Keep console and devtool outputs hidden
  const noop = () => {};

  try {
    console.clear();
  } catch (err) {}

  // Override console methods to prevent logs/information leaking
  try {
    window.console.log = noop;
    window.console.info = noop;
    window.console.warn = noop;
    window.console.debug = noop;
    window.console.table = noop;
    window.console.dir = noop;
    window.console.dirxml = noop;
    window.console.trace = noop;
    window.console.group = noop;
    window.console.groupCollapsed = noop;
    window.console.groupEnd = noop;
  } catch (err) {}

  // Periodic console clear to ensure DevTools console remains wiped clean
  setInterval(() => {
    try {
      console.clear();
    } catch (err) {}
  }, 1500);
}
