import { Switch } from "react-aria-components";

interface SettingsSwitchProps {
  label: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
}

export function SettingsSwitch({
  label,
  isSelected,
  onChange,
}: SettingsSwitchProps) {
  return (
    <Switch
      isSelected={isSelected}
      onChange={onChange}
      className="group flex gap-2 items-center text-black font-semibold text-lg"
    >
      {label}
      <div className="flex h-[26px] w-[44px] shrink-0 cursor-default rounded-full shadow-inner bg-clip-padding border border-solid border-white/30 p-[3px] box-border transition duration-200 ease-in-out bg-slate-400 group-pressed:bg-slate-500 group-selected:bg-green-500 group-selected:group-pressed:bg-green-600 outline-none group-focus-visible:outline-blue-500 outline-2">
        <span className="h-[18px] w-[18px] transform rounded-full bg-white shadow transition duration-200 ease-in-out translate-x-0 group-selected:translate-x-[100%]" />
      </div>
    </Switch>
  );
}
