import { Radio } from "react-aria-components";

interface FormatOptionProps {
  value: string;
  title: string;
  description: string;
}

export function FormatOption({ value, title, description }: FormatOptionProps) {
  return (
    <Radio
      value={value}
      className={({ isFocusVisible, isSelected, isPressed }) => `
        h-40 w-40 text-sm group relative flex flex-col cursor-default rounded-lg p-2 shadow-lg outline-none bg-clip-padding border border-solid
        ${isFocusVisible ? "outline-2 outline-blue-600 outline-offset-1" : ""}
        ${
          isSelected
            ? "bg-blue-600 border-white/30 text-white"
            : "border-transparent"
        }
        ${isPressed && !isSelected ? "bg-blue-50" : ""}
        ${!isSelected && !isPressed ? "bg-white" : ""}
      `}
    >
      <div className="text-xl text-center font-semibold text-gray-900 group-selected:text-white">
        {title}
      </div>
      <div className="text-xs whitespace-pre w-full not-sr-only">
        <code>{description}</code>
      </div>
    </Radio>
  );
}
