import React from "react";
import { Radio, RadioGroup } from "react-aria-components";
import { composeTailwindRenderProps, focusRing } from "./utils";
import { tv } from "tailwind-variants";

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

const styles = tv({
  extend: focusRing,
  base: "relative flex flex-col gap-4 p-4 rounded-xl border-2 bg-white dark:bg-zinc-800 transition-all h-full",
  variants: {
    isSelected: {
      false:
        "border-gray-300 dark:border-zinc-600 group-pressed:border-gray-400 dark:group-pressed:border-zinc-500",
      true: "border-gray-700 dark:border-slate-300 forced-colors:!border-[Highlight] group-pressed:border-gray-800 dark:group-pressed:border-slate-200",
    },
    isInvalid: {
      true: "border-red-700 dark:border-red-600 group-pressed:border-red-800 dark:group-pressed:border-red-700 forced-colors:!border-[Mark]",
    },
    isDisabled: {
      true: "border-gray-200 dark:border-zinc-700 forced-colors:!border-[GrayText]",
    },
  },
});

export const DetailedAnimatedRadioGroup = React.memo(
  function DetailedAnimatedRadioGroup({
    options,
    selectedOption,
    setSelectedOption,
    className,
    label,
  }: AnimatedRadioGroupProps) {
    return (
      <RadioGroup
        className={composeTailwindRenderProps(
          className,
          "grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto"
        )}
        aria-label={label || "Options"}
        value={selectedOption}
        onChange={setSelectedOption}
      >
        {options.map((option) => (
          <Radio
            key={option.id}
            value={option.id}
            className="group text-gray-800 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 forced-colors:disabled:text-[GrayText] transition"
          >
            {(renderProps) => (
              <div className={styles(renderProps)}>
                <div className="text-lg font-semibold mb-2 whitespace-pre leading-tight">
                  {option.label}
                </div>
                <pre className="text-start text-sm text-gray-600 dark:text-zinc-400">
                  {option.description}
                </pre>
                {renderProps.isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 absolute top-2 right-2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            )}
          </Radio>
        ))}
      </RadioGroup>
    );
  }
);
