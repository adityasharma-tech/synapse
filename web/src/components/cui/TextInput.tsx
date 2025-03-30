import { Ref } from 'react';
import { cn } from '../../lib/utils'

export default function TextInput({ className, contentClassName, ref, label, ...props }: { ref?: Ref<HTMLInputElement>, className?: string; contentClassName?: string; label: string; } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("flex flex-col gap-y-2 mt-4", contentClassName)}>
      <label style={{
        fontSize: "14px"
      }} className="font-medium dark:text-white">{label} {props.required ? <span className="text-red-600">*</span> : null}</label>
      <input
        {...props}
        ref={ref}
        className={cn("focus:outline-none p-2 w-full disabled:text-neutral-600 disabled:cursor-not-allowed text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm", className)} />
    </div>
  )
}
