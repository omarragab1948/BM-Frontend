import { useState, useCallback } from 'react';

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export function useDisclosure(initialState = false): UseDisclosureReturn {
  const [isOpen, setIsOpenState] = useState<boolean>(initialState);

  const open = useCallback(() => setIsOpenState(true), []);
  const close = useCallback(() => setIsOpenState(false), []);
  const toggle = useCallback(() => setIsOpenState((prev) => !prev), []);
  const setIsOpen = useCallback((value: boolean) => setIsOpenState(value), []);

  return { isOpen, open, close, toggle, setIsOpen };
}
