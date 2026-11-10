import { useEffect, useRef, useState, type ReactNode } from "react";

type SheetState = { title: string; wide: boolean; node: ReactNode } | null;
type ModalState = { title: string; body: string; ok: string; onOk: () => void } | null;

type Api = {
  setSheet: (sheet: SheetState) => void;
  setModal: (modal: ModalState) => void;
  toast: (message: string) => void;
};

let api: Api | null = null;

export function openSheet(title: string, node: ReactNode, wide = false) {
  api?.setSheet({ title, wide, node });
}

export function closeSheet() {
  api?.setSheet(null);
}

export function confirmBox(opts: { title: string; body: string; ok: string; onOk: () => void }) {
  api?.setModal(opts);
}

export function closeModal() {
  api?.setModal(null);
}

export function toast(message: string) {
  api?.toast(message);
}

export function Overlays({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetState>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    api = {
      setSheet,
      setModal,
      toast: (next) => {
        setMessage(next);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setMessage(null), 2600);
      },
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setModal(null);
      setSheet(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      api = null;
      document.removeEventListener("keydown", onKey);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (sheet) closeRef.current?.focus();
  }, [sheet?.title, sheet?.wide]);

  useEffect(() => {
    if (modal) okRef.current?.focus();
  }, [modal]);

  return (
    <>
      {children}
      <div
        className={"sheet-bg" + (sheet ? " open" : "") + (sheet?.wide ? " wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sTitle"
        hidden={!sheet}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSheet();
        }}
      >
        <div className="sheet">
          <div className="sheet-h">
            <h3 id="sTitle">{sheet?.title}</h3>
            <button ref={closeRef} type="button" onClick={closeSheet}>
              Close
            </button>
          </div>
          <div>{sheet?.node}</div>
        </div>
      </div>
      <div
        className={"modal-bg" + (modal ? " open" : "")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mTitle"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal">
          <h3 id="mTitle">{modal?.title}</h3>
          <p>{modal?.body}</p>
          <div className="row-b">
            <button className="btn btn-line" type="button" onClick={closeModal}>
              Cancel
            </button>
            <button
              ref={okRef}
              className="btn btn-dark"
              type="button"
              onClick={() => {
                const fn = modal?.onOk;
                closeModal();
                fn?.();
              }}
            >
              {modal?.ok ?? "Confirm"}
            </button>
          </div>
        </div>
      </div>
      <div className={"toast" + (message ? " show" : "")} role="status" aria-live="polite">
        {message}
      </div>
    </>
  );
}
