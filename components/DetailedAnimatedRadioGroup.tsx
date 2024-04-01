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
}

export function DetailedAnimatedRadioGroup({
  options,
  selectedOption,
  setSelectedOption,
  className,
}: AnimatedRadioGroupProps) {
  return (
    <RadioGroup
      className={composeTailwindRenderProps(
        className,
        "flex gap-2 mx-auto w-max"
      )}
      aria-label="Options"
      value={selectedOption}
      onChange={setSelectedOption}
    >
      {options.map((option) => (
        <Radio
          key={option.id}
          value={option.id}
          className={`${
            selectedOption === option.id
              ? "bg-white text-slate-900 dark:text-black"
              : "hover:text-slate-900 dark:hover:text-slate-100"
          } relative px-3 py-1.5 text-center text-sm font-medium text-slate-800 dark:text-white ring-slate-800 dark:ring-white dark:ring-offset-black transition focus-visible:ring-2 ring-offset-2 rounded-md`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="text-lg font-semibold mb-2">{option.label}</div>
          <pre className="text-start">{option.description}</pre>
        </Radio>
      ))}
    </RadioGroup>
  );
}
