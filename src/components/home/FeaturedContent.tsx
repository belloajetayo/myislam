import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollText, Users, Radio, ChevronRight, Play, Sparkles } from 'lucide-react';

const FeaturedContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gradient-gold">Featured Content</h2>
        <Sparkles className="w-4 h-4 text-amber-500" />
      </div>

      {/* Hadith of the Day Card */}
      <button 
        onClick={() => navigate('/quran')}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-5 shadow-xl text-left group hover:scale-[1.02] transition-transform"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <ScrollText className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">Hadith of the Day</span>
          </div>
          <p className="font-arabic text-xl text-white text-right leading-loose mb-3">
            إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
          </p>
          <p className="text-white text-sm font-medium mb-1">"Actions are judged by intentions."</p>
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-xs">— Sahih Bukhari</p>
            <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>

      {/* Stories of the Prophets Card */}
      <button 
        onClick={() => navigate('/quran')}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-5 shadow-xl text-left group hover:scale-[1.02] transition-transform"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 text-7xl opacity-20">🌙</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">Stories of the Prophets</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">قصص الأنبياء</h3>
          <p className="text-white/90 text-sm mb-2">Learn from the lives of Allah's chosen messengers</p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 bg-purple-400/30 rounded-full flex items-center justify-center text-sm border-2 border-purple-500">🌍</span>
              <span className="w-8 h-8 bg-indigo-400/30 rounded-full flex items-center justify-center text-sm border-2 border-indigo-500">🕋</span>
              <span className="w-8 h-8 bg-blue-400/30 rounded-full flex items-center justify-center text-sm border-2 border-blue-500">📜</span>
            </div>
            <span className="text-white/70 text-xs">7+ Prophet Stories</span>
            <ChevronRight className="w-4 h-4 text-white/70 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>

      {/* Livestream Card */}
      <button 
        onClick={() => navigate('/community')}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-5 shadow-xl text-left group hover:scale-[1.02] transition-transform"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">Live & Community</span>
            <span className="px-2 py-0.5 bg-red-500 rounded-full text-[10px] text-white font-bold animate-pulse ml-auto">
              LIVE
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Islamic Lectures & Reminders</h3>
          <p className="text-white/90 text-sm mb-3">Watch live lectures from renowned scholars</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="text-white text-xs font-medium">Watch Now</p>
              <p className="text-white/60 text-[10px]">Join the community</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/70 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>
    </div>
  );
};

export default FeaturedContent;
