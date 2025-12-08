import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;
  const ref = useRef();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose && onClose();
        return;
      }
      if (e.key === 'Tab') {
        // trap focus within modal
        const focusable = ref.current.querySelectorAll('a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
        const f = Array.prototype.slice.call(focusable);
        if (f.length === 0) {
          e.preventDefault();
          return;
        }
        const first = f[0];
        const last = f[f.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || active === ref.current) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (active === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // focus first focusable element or modal container
    setTimeout(() => {
      const focusable = ref.current.querySelectorAll('a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]');
      const f = Array.prototype.slice.call(focusable);
      if (f.length > 0) {
        f[0].focus();
      } else {
        ref.current?.focus();
      }
    }, 0);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"> 
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-2xl z-10 max-w-[95%] sm:max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={ref}>
        {title && <h3 id="modal-title" className="text-xl font-semibold mb-3">{title}</h3>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-3 flex-wrap">{actions}</div>
      </div>
    </div>, document.body
  );
};

export default Modal;
