import { Switch } from "react-aria-components";

interface SettingsSwitchProps {
  label: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
}

// Inspired by https://buildui.com/recipes/ios-animated-switch
export function SettingsSwitch({
  label,
  isSelected,
  onChange,
}: SettingsSwitchProps) {
  return (
    <Switch
      isSelected={isSelected}
      onChange={onChange}
      className="group inline-flex touch-none items-center gap-2 text-black dark:text-white font-semibold text-lg"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {label}
      <span className="group-data-[selected]:bg-green-500 group-data-[focus-visible]:ring-2 h-6 w-9 rounded-full border-2 border-transparent bg-slate-400 ring-offset-2 ring-offset-white dark:ring-offset-black transition duration-200">
        <span className="group-data-[selected]:ml-3 group-data-[selected]:group-data-[pressed]:ml-2 group-data-[pressed]:w-6 block h-5 w-5 origin-right rounded-full bg-white shadow transition-all duration-200" />
      </span>
    </Switch>
  );
}
