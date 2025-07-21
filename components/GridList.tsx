import React from "react";
import {
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  Button,
  GridListItemProps,
  GridListProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { composeTailwindRenderProps, focusRing } from "./utils";
import "./GridList.css";

export const GridList = React.memo(function GridList<T extends object>({
  children,
  ...props
}: GridListProps<T>) {
  return (
    <AriaGridList
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        "overflow-auto relative border dark:border-zinc-600 rounded-lg"
      )}
    >
      {children}
    </AriaGridList>
  );
}) as <T extends object>(props: GridListProps<T>) => React.ReactElement;

const itemStyles = tv({
  extend: focusRing,
  base: "relative flex gap-3 cursor-default select-none py-2 px-3 text-sm text-gray-900 dark:text-zinc-200 border-y dark:border-y-zinc-700 border-transparent first:border-t-0 last:border-b-0 first:rounded-t-md last:rounded-b-md -mb-px last:mb-0 -outline-offset-2 justify-center",
  variants: {
    isSelected: {
      false: "hover:bg-gray-100 dark:hover:bg-zinc-700/60",
      true: "bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 dark:hover:bg-blue-700/40 border-y-blue-200 dark:border-y-blue-900 z-20",
    },
    isDisabled: {
      true: "text-slate-300 dark:text-zinc-600 forced-colors:text-[GrayText] z-10",
    },
  },
});

export const GridListItem = React.memo(function GridListItem({
  children,
  onRemove,
  ...props
}: GridListItemProps & { onRemove?: () => void }) {
  let textValue = typeof children === "string" ? children : undefined;
  return (
    <AriaGridListItem textValue={textValue} {...props} className={itemStyles}>
      {({ allowsDragging }) => (
        <>
          {allowsDragging && (
            <Button
              slot="drag"
              className="rounded-full cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2 ring-offset-1 ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out"
            >
              ≡
            </Button>
          )}
          {children}
          {onRemove && (
            <Button
              aria-label="Remove file"
              onPress={onRemove}
              className="rounded-full p-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2 ring-offset-1 ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
              </svg>
            </Button>
          )}
        </>
      )}
    </AriaGridListItem>
  );
});
