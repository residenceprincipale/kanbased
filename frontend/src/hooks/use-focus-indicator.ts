import {useEffect, useRef,useState} from "react";

export function useDelayedFocusIndicator() {
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shownIndicatorRef = useRef(false);

  const showIndicator = () => {
    if (shownIndicatorRef.current) return;
    shownIndicatorRef.current = true;
    setIsFocused(true);
  };

  const showIndicatorDelayed = () => {
    if (shownIndicatorRef.current) return;

    timeoutRef.current = setTimeout(() => {
      showIndicator();
    }, 3000);
  };

  const autoHideIndicator = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 5000);
  };

  const hideIndicator = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsFocused(false);
  };

  useEffect(() => {
    if (isFocused) {
      autoHideIndicator();
    }
  }, [isFocused]);

  return {isFocused, showIndicatorDelayed, hideIndicator};
}
