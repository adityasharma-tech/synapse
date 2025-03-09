import PrimaryButton from "./ui/button";

export default function Header() {
  return (
    <header className="px-5 flex justify-between py-4">
      <img
        alt="Synapse"
        src="/T&W@2x.png"
        className="object-contain h-10"
      />
      <div className="flex gap-x-4 items-center">
        <PrimaryButton bgClr="emerald">
          Sign Up{" "}
          <svg className="size-2 rotate-90" viewBox="0 0 24 24">
            <path className="fill-neutral-100" d="M21 21H3l9-18z" />
          </svg>
        </PrimaryButton>
      </div>
    </header>
  );
}
