import { useNavigate } from "react-router";
import PrimaryButton from "../components/ui/button";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="h-full items-center justify-center flex flex-col gap-y-4">
      <span className="text-4xl">Page not found!</span>
      <PrimaryButton onClick={()=>navigate('/')} bgClr="emerald">Go back</PrimaryButton>
    </div>
  )
}
