import React, { ReactNode } from "react";
import { chain } from "react-aria";
import {
  DialogProps,
  Heading,
  Dialog as RACDialog,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";

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
          <div className="flex justify-between gap-2">
            <Heading
              slot="title"
              className="text-xl font-semibold leading-6 my-0"
            >
              {title}
            </Heading>
            <Button onPress={close} className="rounded-full p-2 bg-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </Button>
          </div>
          <p className="mt-3 text-slate-500 dark:text-zinc-400">{children}</p>
        </>
      )}
    </DialogWrapper>
  );
}
