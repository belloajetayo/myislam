import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Clock, Compass, BookOpen, Headphones } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/prayer", label: "Prayer", Icon: Clock },
  { to: "/qiblah", label: "Qiblah", Icon: Compass },
  { to: "/quran", label: "Quran", Icon: BookOpen },
  { to: "/podcasts", label: "Podcasts", Icon: Headphones },
];

const BottomNavigation: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-50 w-full max-w-md mx-auto px-3">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-800/80 px-2 py-2 flex items-center justify-between">
        {items.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-2xl transition-all duration-200 ${
                active
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
