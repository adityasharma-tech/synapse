import { cn } from '../../lib/utils'

export default function TextInput({ className, label, ...props }: { className?: string; label: string; } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-y-2 mt-4">
      <label style={{
        fontSize: "14px"
      }} className="font-medium dark:text-white">{label} {props.required ? <span className="text-red-600">*</span> : null}</label>
      <input
        {...props}
        className={cn("focus:outline-none p-2 w-full text-neutral-100 border border-neutral-700 bg-neutral-800 focus:ring-2 ring-sky-400 rounded-sm", className)} />
    </div>
  )
}
