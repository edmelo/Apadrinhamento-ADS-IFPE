import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ModalConfig } from '../types';

interface ModalContextValue {
  modal: ModalConfig | null;
  openModal: (kind: ModalConfig['kind'], onConfirm?: () => void) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const openModal = (kind: ModalConfig['kind'], onConfirm?: () => void) =>
    setModal({ kind, onConfirm });
  const closeModal = () => setModal(null);

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal deve ser usado dentro de ModalProvider');
  return ctx;
}