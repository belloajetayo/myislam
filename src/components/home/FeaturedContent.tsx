import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollText, Users, Radio, ChevronRight, Play, Star } from 'lucide-react';

const FeaturedContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.35s' }}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-primary fill-primary" />
        <h2 className="text-base font-bold text-foreground">Featured Content</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>

      {/* Hadith of the Day Card */}
      <button 
        onClick={() => navigate('/quran')}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 shadow-elevated text-left group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ScrollText className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">Hadith of the Day</span>
          </div>
          <p className="font-arabic text-2xl text-white text-right leading-loose mb-3 drop-shadow-sm">
            إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
          </p>
          <p className="text-white text-sm font-semibold mb-1">"Actions are judged by intentions."</p>
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-xs font-medium">— Sahih Bukhari</p>
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </button>

      {/* Stories of the Prophets Card */}
      <button 
        onClick={() => navigate('/quran')}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 shadow-elevated text-left group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">Stories of the Prophets</span>
          </div>
          <h3 className="font-arabic text-2xl font-bold text-white mb-1 drop-shadow-sm">قصص الأنبياء</h3>
          <p className="text-white/90 text-sm mb-4">Learn from the lives of Allah's chosen messengers</p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 bg-gradient-to-br from-purple-400/40 to-purple-600/40 backdrop-blur-sm rounded-full flex items-center justify-center text-sm border-2 border-white/30">🌍</span>
              <span className="w-8 h-8 bg-gradient-to-br from-indigo-400/40 to-indigo-600/40 backdrop-blur-sm rounded-full flex items-center justify-center text-sm border-2 border-white/30">🕋</span>
              <span className="w-8 h-8 bg-gradient-to-br from-blue-400/40 to-blue-600/40 backdrop-blur-sm rounded-full flex items-center justify-center text-sm border-2 border-white/30">📜</span>
            </div>
            <span className="text-white/80 text-xs font-medium">7+ Prophet Stories</span>
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ml-auto group-hover:bg-white/30 transition-colors">
              <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </button>

      {/* Livestream Card */}
      <button 
        onClick={() => navigate('/community')}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-5 shadow-elevated text-left group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">Live & Community</span>
            <span className="px-2 py-0.5 bg-red-500 rounded-full text-[10px] text-white font-bold animate-pulse ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              LIVE
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Islamic Lectures & Reminders</h3>
          <p className="text-white/90 text-sm mb-4">Watch live lectures from renowned scholars</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Watch Now</p>
              <p className="text-white/70 text-xs">Join the community</p>
            </div>
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ml-auto group-hover:bg-white/30 transition-colors">
              <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default FeaturedContent;
