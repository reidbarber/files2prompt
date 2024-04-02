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

export function DetailedAnimatedRadioGroup({
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
        "flex flex-col w-full sm:flex-row sm:w-max gap-2 mx-auto"
      )}
      aria-label={label || "Options"}
      value={selectedOption}
      onChange={setSelectedOption}
    >
      {options.map((option) => (
        <Radio
          key={option.id}
          value={option.id}
          className={`${
            selectedOption === option.id
              ? "dark:bg-white text-white dark:text-slate-900 dark:selected:text-slate-900 bg-slate-800"
              : "hover:text-slate-900 dark:hover:text-slate-100"
          } relative px-3 min-w-32 py-1.5 text-center text-sm font-medium text-slate-800 dark:text-white ring-slate-800 dark:ring-white dark:ring-offset-black transition focus-visible:ring-2 ring-offset-2 rounded-md`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="text-lg font-semibold mb-2 whitespace-pre leading-tight">
            {option.label}
          </div>
          <pre className="text-start">{option.description}</pre>
        </Radio>
      ))}
    </RadioGroup>
  );
}
