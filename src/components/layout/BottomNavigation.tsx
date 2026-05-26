import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Clock, Compass, Moon, Play } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const isTabActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-md mx-auto">
      <div className="relative w-full h-[88px]">
        {/* Curved Nav Background (SVG) - Deep Navy-Purple Theme */}
        <div className="absolute inset-x-0 bottom-0 h-[88px] w-full pointer-events-none">
          <svg
            viewBox="0 0 100 52"
            preserveAspectRatio="none"
            className="w-full h-full text-[#110e24] dark:text-[#060411] fill-current drop-shadow-[0_-8px_24px_rgba(0,0,0,0.15)] transition-colors duration-300"
          >
            <path
              d="M 0 15 
                 A 5 5 0 0 1 5 10 
                 L 35 10 
                 C 40 10, 42 0, 50 0 
                 C 58 0, 60 10, 65 10 
                 L 95 10 
                 A 5 5 0 0 1 100 15 
                 L 100 52 
                 L 0 52 
                 Z"
            />
            <path
              d="M 0 15 
                 A 5 5 0 0 1 5 10 
                 L 35 10 
                 C 40 10, 42 0, 50 0 
                 C 58 0, 60 10, 65 10 
                 L 95 10 
                 A 5 5 0 0 1 100 15"
              fill="none"
              stroke="currentColor"
              className="text-white/10 dark:text-white/5"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Floating Center Button (Quran / Play) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <Link
            to="/quran"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300 bg-gradient-to-br ${
              isTabActive("/quran")
                ? "from-amber-500 via-orange-500 to-red-500 shadow-glow ring-4 ring-amber-500/20"
                : "from-amber-500/95 to-orange-600/95 hover:from-amber-400 hover:to-orange-500"
            }`}
            title="Holy Qur'an"
          >
            <Play
              className={`w-6 h-6 transition-transform duration-300 text-white ${
                isTabActive("/quran") ? "scale-110 fill-white" : "scale-100 fill-white/80"
              } ml-0.5`}
            />
          </Link>
        </div>

        {/* Navigation Links Grid */}
        <div className="relative h-[88px] flex items-center px-4 z-10">
          <div className="w-full flex items-center justify-between mt-3">

            {/* Left Side Links */}
            <div className="flex items-center justify-around w-[40%]">
              <Link
                to="/"
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                  isTabActive("/") ? "text-amber-400" : "text-white/60 hover:text-white"
                }`}
              >
                <Home className="w-5 h-5 stroke-[2.5]" />
                <span className="text-[9px] font-semibold tracking-wide">Home</span>
              </Link>

              <Link
                to="/prayer"
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                  isTabActive("/prayer") ? "text-amber-400" : "text-white/60 hover:text-white"
                }`}
              >
                <Clock className="w-5 h-5 stroke-[2.5]" />
                <span className="text-[9px] font-semibold tracking-wide">Prayer</span>
              </Link>
            </div>

            {/* Spacer for Center Hump — shows Qur'an label at bottom */}
            <div className="w-[20%] flex flex-col items-center justify-end pb-0.5">
              <span className={`text-[9px] font-semibold tracking-wide ${isTabActive("/quran") ? "text-amber-400" : "text-white/60"}`}>
                Qur'an
              </span>
            </div>

            {/* Right Side Links */}
            <div className="flex items-center justify-around w-[40%]">
              <Link
                to="/qiblah"
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                  isTabActive("/qiblah") ? "text-amber-400" : "text-white/60 hover:text-white"
                }`}
              >
                <Compass className="w-5 h-5 stroke-[2.5]" />
                <span className="text-[9px] font-semibold tracking-wide">Qiblah</span>
              </Link>

              <Link
                to="/fasting"
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                  isTabActive("/fasting") ? "text-amber-400" : "text-white/60 hover:text-white"
                }`}
              >
                <Moon className="w-5 h-5 stroke-[2.5]" />
                <span className="text-[9px] font-semibold tracking-wide">Sawm</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
