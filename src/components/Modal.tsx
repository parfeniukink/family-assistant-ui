import { createPortal } from "react-dom";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  blur?: boolean;
  style?: React.CSSProperties;
};

export function Modal({ children, onClose, blur, style }: ModalProps) {
  const overlayClass = blur
    ? "modal-overlay modal-overlay--blur"
    : "modal-overlay";

  return createPortal(
    <div className={overlayClass} onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={style}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
