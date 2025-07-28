import React, { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

interface AnimatedHeightProps {
  children: ReactNode;
  isOpen: boolean;
  duration?: number; // in milliseconds
  maxHeight?: number; // in pixels
  className?: string;
  easing?: "ease-in-out" | "ease-in" | "ease-out" | "ease" | "linear";
  onEscapePress?: () => void; // Callback when ESC is pressed
  enableEscapeClose?: boolean; // Whether to enable ESC to close
  absolute?: boolean; // Whether to use absolute positioning
  fadeContent?: boolean; // Whether to fade content on close
}

export function AnimatedHeight({
  children,
  isOpen,
  duration = 300,
  maxHeight = 400,
  className = "",
  easing = "ease-in-out",
  onEscapePress,
  enableEscapeClose = true,
  absolute = false,
  fadeContent = false
}: AnimatedHeightProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Function to recalculate height
  const recalculateHeight = () => {
    if (contentRef.current && isOpen) {
      // Find the actual content height, looking inside scroll areas if present
      const scrollArea = contentRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      const actualContent = scrollArea || contentRef.current;
      
      // For scroll areas, we want to measure the content inside the viewport
      const contentToMeasure = scrollArea ? scrollArea.firstElementChild as HTMLElement : actualContent;
      
      if (contentToMeasure) {
        const height = Math.min(contentToMeasure.scrollHeight, maxHeight);
        setContentHeight(height);
      } else {
        // Fallback to original measurement
        const height = Math.min(contentRef.current.scrollHeight, maxHeight);
        setContentHeight(height);
      }
    }
  };

  // Handle ESC key press
  useEffect(() => {
    if (!enableEscapeClose || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapePress?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onEscapePress, enableEscapeClose]);

  // Update height when open state or children change
  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setIsClosing(false);
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          if (contentRef.current) {
            // Find the actual content height, looking inside scroll areas if present
            const scrollArea = contentRef.current.querySelector('[data-slot="scroll-area-viewport"]');
            const actualContent = scrollArea || contentRef.current;
            
            // For scroll areas, we want to measure the content inside the viewport
            const contentToMeasure = scrollArea ? scrollArea.firstElementChild as HTMLElement : actualContent;
            
            if (contentToMeasure) {
              const height = Math.min(contentToMeasure.scrollHeight, maxHeight);
              setContentHeight(height);
            } else {
              // Fallback to original measurement
              const height = Math.min(contentRef.current.scrollHeight, maxHeight);
              setContentHeight(height);
            }
          }
        });
      } else {
        if (fadeContent && contentHeight > 0) {
          // Start fade-out animation
          setIsClosing(true);
          // Wait for fade duration before collapsing height
          setTimeout(() => {
            setContentHeight(0);
            setIsClosing(false);
          }, duration * 0.3); // Fade for 30% of total duration
        } else {
          setContentHeight(0);
          setIsClosing(false);
        }
      }
    }
  }, [isOpen, children, maxHeight, fadeContent, duration, contentHeight]);

  // Set up ResizeObserver to watch for content size changes
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;

    // Clean up existing observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // Create new observer
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === contentRef.current && isOpen) {
          // Find the actual content height, looking inside scroll areas if present
          const scrollArea = contentRef.current!.querySelector('[data-slot="scroll-area-viewport"]');
          const actualContent = scrollArea || contentRef.current;
          
          // For scroll areas, we want to measure the content inside the viewport
          const contentToMeasure = scrollArea ? scrollArea.firstElementChild as HTMLElement : actualContent;
          
          if (contentToMeasure) {
            const height = Math.min(contentToMeasure.scrollHeight, maxHeight);
            setContentHeight(height);
          } else {
            // Fallback to original measurement
            const height = Math.min(entry.target.scrollHeight, maxHeight);
            setContentHeight(height);
          }
        }
      }
    });

    resizeObserverRef.current.observe(contentRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isOpen, maxHeight]);

  // Also add a mutation observer to watch for DOM changes
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;

    const mutationObserver = new MutationObserver(() => {
      // Delay slightly to allow DOM changes to complete
      setTimeout(recalculateHeight, 10);
    });

    mutationObserver.observe(contentRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    return () => mutationObserver.disconnect();
  }, [isOpen]);

  // Create dynamic transition class
  const transitionClass = `transition-all duration-${duration} ${easing} overflow-hidden`;
  const positionClass = absolute ? 'absolute top-full left-0 right-0 z-50' : '';
  const fadeClass = fadeContent ? 'transition-opacity' : '';
  const opacityClass = fadeContent ? (isClosing ? 'opacity-0' : 'opacity-100') : '';

  return (
    <div
      className={`${transitionClass} ${positionClass} ${className}`}
      style={{
        height: isOpen ? `${contentHeight}px` : '0px',
      }}
    >
      <div 
        ref={contentRef} 
        className={`w-full ${fadeClass} ${opacityClass}`}
        style={{
          transitionDuration: fadeContent ? `${duration * 0.3}ms` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Alternative version with more animation options
interface AnimatedCollapseProps extends AnimatedHeightProps {
  animateOpacity?: boolean;
  animateScale?: boolean;
  staggerChildren?: boolean;
}

export function AnimatedCollapse({
  children,
  isOpen,
  duration = 300,
  maxHeight = 400,
  className = "",
  easing = "ease-in-out",
  onEscapePress,
  enableEscapeClose = true,
  animateOpacity = false,
  animateScale = false,
  staggerChildren = false
}: AnimatedCollapseProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Function to recalculate height
  const recalculateHeight = () => {
    if (contentRef.current && isOpen) {
      const height = Math.min(contentRef.current.scrollHeight, maxHeight);
      setContentHeight(height);
    }
  };

  // Handle ESC key press
  useEffect(() => {
    if (!enableEscapeClose || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapePress?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onEscapePress, enableEscapeClose]);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        requestAnimationFrame(() => {
          if (contentRef.current) {
            const height = Math.min(contentRef.current.scrollHeight, maxHeight);
            setContentHeight(height);
          }
        });
      } else {
        setContentHeight(0);
      }
    }
  }, [isOpen, children, maxHeight]);

  // Set up ResizeObserver to watch for content size changes
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === contentRef.current && isOpen) {
          const height = Math.min(entry.target.scrollHeight, maxHeight);
          setContentHeight(height);
        }
      }
    });

    resizeObserverRef.current.observe(contentRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isOpen, maxHeight]);

  // Mutation observer for DOM changes
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;

    const mutationObserver = new MutationObserver(() => {
      setTimeout(recalculateHeight, 10);
    });

    mutationObserver.observe(contentRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    return () => mutationObserver.disconnect();
  }, [isOpen]);

  const baseClasses = `transition-all duration-${duration} ${easing} overflow-hidden`;
  const opacityClasses = animateOpacity ? (isOpen ? 'opacity-100' : 'opacity-0') : '';
  const scaleClasses = animateScale ? (isOpen ? 'scale-100' : 'scale-95') : '';
  const staggerClasses = staggerChildren ? '[&>*]:transition-all [&>*]:duration-200 [&>*]:ease-out' : '';

  return (
    <div
      className={`${baseClasses} ${opacityClasses} ${scaleClasses} ${className}`}
      style={{
        height: isOpen ? `${contentHeight}px` : '0px',
      }}
    >
      <div ref={contentRef} className={`w-full ${staggerClasses}`}>
        {children}
      </div>
    </div>
  );
}

// Hook version for more control
export function useAnimatedHeight(isOpen: boolean, maxHeight = 400, onEscapePress?: () => void, enableEscapeClose = true) {
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Function to recalculate height
  const recalculateHeight = () => {
    if (contentRef.current && isOpen) {
      const height = Math.min(contentRef.current.scrollHeight, maxHeight);
      setContentHeight(height);
    }
  };

  // Handle ESC key press
  useEffect(() => {
    if (!enableEscapeClose || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapePress?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onEscapePress, enableEscapeClose]);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        requestAnimationFrame(() => {
          if (contentRef.current) {
            const height = Math.min(contentRef.current.scrollHeight, maxHeight);
            setContentHeight(height);
          }
        });
      } else {
        setContentHeight(0);
      }
    }
  }, [isOpen, maxHeight]);

  // Set up ResizeObserver
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === contentRef.current && isOpen) {
          const height = Math.min(entry.target.scrollHeight, maxHeight);
          setContentHeight(height);
        }
      }
    });

    resizeObserverRef.current.observe(contentRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isOpen, maxHeight]);

  // Mutation observer for DOM changes
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;

    const mutationObserver = new MutationObserver(() => {
      setTimeout(recalculateHeight, 10);
    });

    mutationObserver.observe(contentRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    return () => mutationObserver.disconnect();
  }, [isOpen]);

  const getContainerProps = (duration = 300, easing = "ease-in-out") => ({
    className: `transition-all duration-${duration} ${easing} overflow-hidden`,
    style: {
      height: isOpen ? `${contentHeight}px` : '0px',
    }
  });

  const getContentProps = () => ({
    ref: contentRef,
    className: "w-full"
  });

  return {
    contentHeight,
    getContainerProps,
    getContentProps,
    isAnimating: contentHeight > 0 && !isOpen
  };
}
