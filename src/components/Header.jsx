import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <img
        src="/og-rezemai.png"
        alt="Rezemai"
        className="h-10 w-auto"
      />
      <Link
        to={createPageUrl("Signin")}
        className="text-slate-300 hover:text-white transition-colors"
      >
        Sign in
      </Link>
    </header>
  );
}
