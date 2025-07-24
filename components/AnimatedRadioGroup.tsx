import React, { useLayoutEffect, useRef, useState } from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { composeTailwindRenderProps } from "./utils";

interface Option {
  id: string;
  label: string;
  description: string;
}

interface AnimatedRadioGroupProps {
  options: Option[];
  selectedOption: string;
  setSelectedOption: (selectedOption: string) => void;
  className?: string;
  label?: string;
}

// Inspired by https://react-spectrum.adobe.com/react-aria/examples/swipeable-tabs.html
export const AnimatedRadioGroup = React.memo(function AnimatedRadioGroup({
  options,
  selectedOption,
  setSelectedOption,
  className,
  label,
}: AnimatedRadioGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<string, HTMLElement>());
  const [bubbleStyles, setBubbleStyles] = useState<React.CSSProperties>();

  const updateBubble = React.useCallback(() => {
    const container = groupRef.current;
    const option = optionRefs.current.get(selectedOption);
    if (container && option) {
      const containerRect = container.getBoundingClientRect();
      const rect = option.getBoundingClientRect();
      setBubbleStyles({
        transform: `translate(${rect.left - containerRect.left}px, ${
          rect.top - containerRect.top
        }px)`,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [selectedOption]);

  useLayoutEffect(() => {
    updateBubble();
    window.addEventListener("resize", updateBubble);
    return () => window.removeEventListener("resize", updateBubble);
  }, [updateBubble]);

  return (
    <RadioGroup
      ref={groupRef}
      className={composeTailwindRenderProps(
        className,
        "relative flex gap-2 mx-auto w-max"
      )}
      aria-label={label || "Options"}
      value={selectedOption}
      onChange={setSelectedOption}
    >
      <span
        className="absolute z-10 bg-white mix-blend-difference pointer-events-none"
        style={{
          borderRadius: 9999,
          transition:
            "transform 0.6s cubic-bezier(0.22,1,0.36,1), width 0.6s, height 0.6s",
          ...bubbleStyles,
        }}
      />
      {options.map((option) => (
        <Radio
          key={option.id}
          value={option.id}
          ref={(el: HTMLElement | null) => {
            if (el) optionRefs.current.set(option.id, el);
          }}
          className={`${
            selectedOption === option.id
              ? ""
              : "hover:text-slate-900 dark:hover:text-slate-100"
          } relative rounded-full px-3 py-1.5 w-24 text-center text-sm font-medium text-slate-800 dark:text-white ring-slate-800 dark:ring-white dark:ring-offset-black transition focus-visible:ring-2 ring-offset-2`}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
});
