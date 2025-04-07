import { useNavigate } from "react-router";
import PrimaryButton from "../components/ui/button";

// not found page run whenever no route maches on react router
export function NotFound() {
  // navigator from react router to navigate between screens
  // you can navigate using anchor tags but it will reload the whole page and states
  // so you should use useNavigate
  const navigate = useNavigate();

  return (
    <div className="h-full items-center justify-center flex flex-col gap-y-4">
      <span className="text-4xl">Page not found!</span>
      <PrimaryButton onClick={() => navigate("/")} bgClr="emerald">
        Go back
      </PrimaryButton>
    </div>
  );
}
