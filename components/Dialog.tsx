import React, { ReactNode } from "react";
import {
  DialogProps,
  Heading,
  Dialog as RACDialog,
  Button as RACButton,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

function DialogWrapper(props: DialogProps) {
  return (
    <RACDialog
      {...props}
      className={twMerge(
        "outline outline-0 p-6 [[data-placement]>&]:p-4 max-h-[inherit] overflow-auto relative",
        props.className
      )}
    />
  );
}

interface AlertDialogProps extends Omit<DialogProps, "children"> {
  title: string;
  children: ReactNode;
  cancelLabel?: string;
  onAction?: () => void;
}

export function Dialog({
  title,
  cancelLabel,
  onAction,
  children,
  ...props
}: AlertDialogProps) {
  return (
    <DialogWrapper {...props}>
      {({ close }) => (
        <>
          <div className="flex justify-center items-center gap-2 relative">
            <Heading
              slot="title"
              className="text-xl font-semibold leading-6 my-0"
            >
              {title}
            </Heading>
            <RACButton
              aria-label="Close settings"
              onPress={close}
              className="absolute right-0 rounded-full p-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2 ring-offset-2 ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </RACButton>
          </div>
          <div className="mt-3 text-slate-500 dark:text-zinc-400">
            {children}
          </div>
        </>
      )}
    </DialogWrapper>
  );
}
