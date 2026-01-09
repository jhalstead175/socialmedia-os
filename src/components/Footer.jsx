import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-slate-800 pt-8 pb-16 text-slate-400">
      <div className="flex justify-between items-center">
        <span>© 2025 SoshlOps</span>
        <div className="flex gap-6">
          <Link to={createPageUrl("LegalPrivacy")} className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link to={createPageUrl("LegalTerms")} className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
