import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Logo from "./brand/Logo";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <Logo variant="monolith" size="md" animated />
        <span className="text-xl font-semibold tracking-tight text-white">
          SoshlOps
        </span>
      </div>
      <Link
        to={createPageUrl("Signin")}
        className="text-slate-300 hover:text-white transition-colors"
      >
        Sign in
      </Link>
    </header>
  );
}
