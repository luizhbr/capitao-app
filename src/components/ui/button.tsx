import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",{
  variants:{variant:{default:"bg-[var(--capitao-primary-700)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--capitao-primary-900)]",secondary:"bg-[var(--capitao-primary-100)] text-[var(--capitao-primary-900)]",ghost:"bg-transparent text-[var(--foreground)]"},size:{default:"h-13",sm:"min-h-10 px-4 text-xs",icon:"size-12 p-0"}},
  defaultVariants:{variant:"default",size:"default"}
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof buttonVariants>{}
export function Button({className,variant,size,...props}:ButtonProps){return <button className={cn(buttonVariants({variant,size}),className)} {...props}/>}
