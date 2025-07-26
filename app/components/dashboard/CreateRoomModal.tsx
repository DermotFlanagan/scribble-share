import { X } from "lucide-react";
import {
  cloneElement,
  createContext,
  useContext,
  useState,
  ReactNode,
  ReactElement,
} from "react";
import { createPortal } from "react-dom";

interface ModalContextType {
  openName: string;
  close: () => void;
  open: (name: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

interface OpenProps {
  children: ReactElement;
  opens: string;
}

function Open({ children, opens: windowToOpen }: OpenProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error("Open must be used within a Modal");

  const { open } = context;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cloneElement(children, { onClick: () => open(windowToOpen) } as any);
}

interface WindowProps {
  children: ReactElement;
  name: string;
}

function Window({ children, name }: WindowProps) {
  const context = useContext(ModalContext);
  if (!context) throw new Error("Window must be used within a Modal");

  const { openName, close } = context;
  if (name !== openName) return null;

  return createPortal(
    <div
      onClick={close}
      className="fixed inset-0 bg-black/20 flex, justify-center, items-center, z-1000"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-2 rounded-xl relative max-w-500 w-90 shadow-lg"
      >
        <button
          aria-label="Close modal"
          onClick={close}
          className="absolute top-1 right-1 border-none bg-none cursor-pointer p-0.5 text-gray-500"
        >
          <X size={24} />
        </button>

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div>{cloneElement(children, { onCloseModal: close } as any)}</div>
      </div>
    </div>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
