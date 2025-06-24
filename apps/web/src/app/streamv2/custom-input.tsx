import React from "react";

interface SuperInputPropT {
    onChange: (value: string) => void;
    value: string;
    onEnterPress?: () => void;
}

const SuperInput = React.forwardRef<HTMLDivElement, SuperInputPropT>(
    ({ onChange, value, onEnterPress }, ref) => {
        return (
            <div className="flex-1 min-h-8 p-1 relative">
                <div
                    ref={ref}
                    role="textarea"
                    contentEditable
                    aria-multiline
                    tabIndex={0}
                    spellCheck
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key == "Enter")
                            if (onEnterPress) {
                                e.preventDefault();
                                onEnterPress();
                            }
                    }}
                    aria-placeholder="Enter message here..."
                    suppressContentEditableWarning
                    onInput={(e) =>
                        onChange((e.target as any).innerText as string)
                    }
                    className="focus:outline-none flex flex-wrap overflow-y-auto"
                ></div>
                {value.trim().length <= 0 ? (
                    <span className="absolute pointer-events-none top-1 text-neutral-400 font-normal">
                        Enter message here...
                    </span>
                ) : null}
            </div>
        );
    }
);

export { SuperInput };
