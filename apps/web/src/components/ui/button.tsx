import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cn } from "../../lib/utils";

const colorClasses = {
    emerald:
        "from-emerald-700 to-emerald-900 hover:from-emerald-600 ring-emerald-800",
    neutral:
        "from-neutral-800 to-neutral-900 hover:from-neutral-700 ring-neutral-800",
};

interface ButtonPropT
    extends DetailedHTMLProps<
        ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > {
    bgClr: "emerald" | "neutral";
}

export default function PrimaryButton({
    bgClr,
    children,
    ...props
}: ButtonPropT) {
    return (
        <button
            {...props}
            className={cn(
                "flex items-center text-sm h-8 group rounded-lg ring cursor-pointer disabled:opacity-90 disabled:cursor-not-allowed px-4 bg-gradient-to-b transition-colors justify-center gap-x-2 font-medium text-neutral-100",
                colorClasses[bgClr],
                props.className
            )}
        >
            {children}
        </button>
    );
}
