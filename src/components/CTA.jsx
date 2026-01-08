import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CTA({ label = "Get Early Access" }) {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  const onClick = () => {
    if (!isLoaded) return;

    if (isSignedIn) {
      navigate(createPageUrl("Dashboard"));
    } else {
      navigate(createPageUrl("Signin"));
    }
  };

  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors"
      disabled={!isLoaded}
    >
      {label}
    </button>
  );
}
