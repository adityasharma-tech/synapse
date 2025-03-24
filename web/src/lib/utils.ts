import { ClassValue, clsx } from "clsx";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const useDebounce = () => {
  // here debounceSeed is defined to keep track of the setTimout function
  const debounceSeed = useRef<any | null>(null);
  // a fucntion is created via useRef which
  // takes a function and a delay (in milliseconds) as an argument
  // which has a defalut value set to 200 , can be specified as per need
  const debounceFunction = useRef((func: Function, timeout = 200) => {
    // checks if previosus timeout is present then it will clrear it
    if (debounceSeed.current) {
      clearTimeout(debounceSeed.current);
      debounceSeed.current = null;
    }
    // creates a timeout function witht he new fucntion call
    debounceSeed.current = setTimeout(() => {
      func();
    }, timeout);
  });
  // a debounce function is returned
  return debounceFunction.current;
};

const useThrottle = () => {
  const throttleSeed = useRef<any>(null);

  const throttleFunction = useRef((func: Function, delay = 200) => {
    if (!throttleSeed.current) {
      // Call the callback immediately for the first time only
      func();
      throttleSeed.current = setTimeout(() => {
        throttleSeed.current = null;
      }, delay);
    }
  });

  return throttleFunction.current;
};

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export { useThrottle, useDebounce, loadScript };
