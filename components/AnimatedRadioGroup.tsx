import { motion } from "framer-motion";
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

export function AnimatedRadioGroup({
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
            selectedOption === option.id ? "" : "hover:text-slate-900"
          } relative rounded-full px-3 py-1.5 w-24 text-center text-sm font-medium text-slate-800 outline-sky-400 transition focus-visible:outline-2`}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {selectedOption === option.id && (
            <motion.span
              layoutId="bubble"
              className="absolute inset-0 z-10 bg-white mix-blend-difference"
              style={{ borderRadius: 9999 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
