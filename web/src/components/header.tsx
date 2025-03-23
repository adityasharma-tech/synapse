import { Link } from "react-router";
import PrimaryButton from "./ui/button";
import { PropsWithChildren } from "react";

// This need to be updated whenever ui update is going on
export default function Header({ children }: PropsWithChildren) {
  return (
    <header className="px-5 flex justify-between py-4">
      <Link to="/">
      <img
        alt="Synapse"
        src="/T&W@2x.png"
        className="object-contain h-10"
        />
        </Link>
      <div className="flex gap-x-4 items-center">
        {children ?? <Link to="/auth/signup">
          <PrimaryButton bgClr="emerald">
            Sign Up{" "}
            <svg className="size-2 rotate-90" viewBox="0 0 24 24">
              <path className="fill-neutral-100" d="M21 21H3l9-18z" />
            </svg>
          </PrimaryButton>
        </Link>}
      </div>
    </header>
  );
}
