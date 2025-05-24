import React, {
  createContext,
  useContext,
  useRef,
  useMemo,
  ReactNode,
  useCallback,
  KeyboardEventHandler,
  useEffect,
} from "react";

interface FocusManagerOptions {
  /** Whether focus should wrap around when it reaches the end of the scope. */
  wrap?: boolean;
  /** A callback that determines whether the given element should be focused. */
  accept?: (node: Element) => boolean;
}

interface FocusManager {
  /** Moves focus to the next focusable element in the scope. */
  focusNext(opts?: FocusManagerOptions): Element | null;
  /** Moves focus to the previous focusable element in the scope. */
  focusPrevious(opts?: FocusManagerOptions): Element | null;
  /** Moves focus to the first focusable element in the scope. */
  focusFirst(opts?: FocusManagerOptions): Element | null;
  /** Moves focus to the last focusable element in the scope. */
  focusLast(opts?: FocusManagerOptions): Element | null;
}

interface FocusScopeProps {
  /** The contents of the focus scope. */
  children: ReactNode;
  /** Whether to auto focus the first focusable element in the focus scope on mount. */
  autoFocus?: boolean;
}

const FocusContext = createContext<FocusManager | null>(null);

function isElementVisible(element: Element): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    !element.hasAttribute("hidden")
  );
}

function getFocusableElements(
  container: Element,
  accept?: (node: Element) => boolean,
): Element[] {
  return Array.from(container.querySelectorAll("[data-kb-focus]"))
    .filter(isElementVisible)
    .filter((element) => (accept ? accept(element) : true));
}

function createFocusManager(
  containerRef: React.RefObject<Element | null>,
): FocusManager {
  return {
    focusNext(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const currentIndex = elements.indexOf(document.activeElement as Element);
      let nextIndex = currentIndex + 1;

      if (nextIndex >= elements.length) {
        nextIndex = opts.wrap ? 0 : elements.length - 1;
      }

      const nextElement = elements[nextIndex];
      if (nextElement && nextElement !== document.activeElement) {
        (nextElement as HTMLElement).focus();
        return nextElement;
      }

      return null;
    },

    focusPrevious(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const currentIndex = elements.indexOf(document.activeElement as Element);
      let prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        prevIndex = opts.wrap ? elements.length - 1 : 0;
      }

      const prevElement = elements[prevIndex];
      if (prevElement && prevElement !== document.activeElement) {
        (prevElement as HTMLElement).focus();
        return prevElement;
      }

      return null;
    },

    focusFirst(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const firstElement = elements[0];
      if (firstElement) {
        (firstElement as HTMLElement).focus();
        return firstElement;
      }
      return null;
    },

    focusLast(opts: FocusManagerOptions = {}): Element | null {
      const container = containerRef.current;
      if (!container) return null;

      const elements = getFocusableElements(container, opts.accept);
      if (elements.length === 0) return null;

      const lastElement = elements[elements.length - 1];
      if (lastElement) {
        (lastElement as HTMLElement).focus();
        return lastElement;
      }
      return null;
    },
  };
}

export function FocusScope({children, autoFocus}: FocusScopeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusManager = useMemo(() => createFocusManager(containerRef), []);

  // Auto focus the first element on mount
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const elements = getFocusableElements(containerRef.current);
      const firstElement = elements[0];
      if (firstElement) {
        (firstElement as HTMLElement).focus();
      }
    }
  }, [autoFocus]);

  return (
    <FocusContext.Provider value={focusManager}>
      <div ref={containerRef} data-focus-scope>
        {children}
      </div>
    </FocusContext.Provider>
  );
}

/**
 * Hook to get the focus manager for the current focus scope.
 */
export function useFocusManager() {
  const focusManager = useContext(FocusContext);

  if (!focusManager) {
    throw new Error("useFocusManager must be used within a FocusScope");
  }

  return focusManager;
}

const listNavigationOptions: FocusManagerOptions = {
  wrap: true,
};

/**
 * Hook to handle list navigation within a focus scope.
 */
export function useListNavigation() {
  const focusManager = useFocusManager();

  const handleKeyDown: KeyboardEventHandler = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowDown":
        case "j":
          event.preventDefault();
          focusManager.focusNext(listNavigationOptions);
          break;
        case "ArrowUp":
        case "k":
          event.preventDefault();
          focusManager.focusPrevious(listNavigationOptions);
          break;
        case "Home":
        case "g":
          event.preventDefault();
          focusManager.focusFirst(listNavigationOptions);
          break;
        case "End":
        case "G":
          event.preventDefault();
          focusManager.focusLast(listNavigationOptions);
          break;
      }
    },
    [focusManager],
  );

  return {handleKeyDown};
}

export function useListNavigationListenerAttached() {
  const {handleKeyDown} = useListNavigation();

  useEffect(() => {
    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener,
    );
    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener,
      );
    };
  }, []);
}
