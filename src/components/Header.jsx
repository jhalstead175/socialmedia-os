import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="text-lg font-extrabold tracking-widest text-white">REZEMAI</div>
      <Link
        to={createPageUrl("Signin")}
        className="text-slate-300 hover:text-white transition-colors"
      >
        Sign in
      </Link>
    </header>
  );
}
