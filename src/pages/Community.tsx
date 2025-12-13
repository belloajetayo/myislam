import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Play, Radio, Users, ExternalLink, Heart, Eye, Clock } from 'lucide-react';

const channels = [
  {
    name: 'Mufti Menk',
    handle: '@muaboronhani',
    subscribers: '4.2M',
    avatar: '🎙️',
    live: false,
  },
  {
    name: 'Omar Suleiman',
    handle: '@yikiama',
    subscribers: '2.8M',
    avatar: '📖',
    live: true,
  },
  {
    name: 'Nouman Ali Khan',
    handle: '@baikinitv',
    subscribers: '3.5M',
    avatar: '🕌',
    live: false,
  },
  {
    name: 'Yasir Qadhi',
    handle: '@yasirqadhi',
    subscribers: '1.9M',
    avatar: '📚',
    live: false,
  },
];

const livestreams = [
  {
    title: 'Friday Khutbah - The Power of Dua',
    channel: 'Islamic Center NYC',
    viewers: '12.5K',
    thumbnail: '🕋',
  },
  {
    title: 'Tafsir Al-Quran - Surah Ar-Rahman',
    channel: 'Bayyinah Institute',
    viewers: '8.2K',
    thumbnail: '📖',
  },
];

const videos = [
  {
    title: 'The Story of Prophet Yusuf (AS)',
    channel: 'FreeQuranEducation',
    views: '2.3M',
    duration: '45:23',
    thumbnail: '🎬',
  },
  {
    title: 'How to Improve Your Salah',
    channel: 'Islamic Guidance',
    views: '1.8M',
    duration: '18:45',
    thumbnail: '🙏',
  },
  {
    title: 'Understanding Surah Al-Fatiha',
    channel: 'Nouman Ali Khan',
    views: '3.1M',
    duration: '52:10',
    thumbnail: '📚',
  },
];

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'videos' | 'channels'>('live');

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="text-center py-2 animate-fade-in">
          <h1 className="text-xl font-bold text-gradient-gold">Community</h1>
          <p className="text-xs text-gradient-gold opacity-80">Islamic Content & Livestreams</p>
        </header>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex border border-primary/10 animate-slide-up">
          {[
            { id: 'live', label: 'Live', icon: Radio },
            { id: 'videos', label: 'Videos', icon: Play },
            { id: 'channels', label: 'Channels', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === tab.id 
                  ? 'gradient-primary text-primary-foreground shadow-soft' 
                  : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'live' && (
          <div className="space-y-4">
            {/* Live Now Banner */}
            <div className="gradient-accent rounded-3xl p-4 shadow-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <span className="text-gradient-gold font-medium text-sm">Live Now</span>
              </div>
              <h3 className="text-lg font-bold text-gradient-gold mb-1">Friday Jummah Prayer</h3>
              <p className="text-gradient-gold opacity-80 text-sm mb-3">Masjid Al-Haram, Makkah</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary-foreground/70" />
                  <span className="text-primary-foreground/70 text-sm">156K watching</span>
                </div>
                <button className="flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 px-4 py-2 rounded-xl transition-colors">
                  <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
                  <span className="text-primary-foreground text-sm font-medium">Watch</span>
                </button>
              </div>
            </div>

            {/* Other Livestreams - Facebook Feed Style */}
            <h3 className="text-sm font-semibold text-gradient-gold">Other Streams</h3>
            {livestreams.map((stream, index) => (
              <div
                key={index}
                className="glass rounded-3xl overflow-hidden border border-primary/10 animate-slide-up"
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                {/* Video Thumbnail - Full Width */}
                <div className="w-full aspect-video gradient-primary flex items-center justify-center relative">
                  <span className="text-6xl">{stream.thumbnail}</span>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/30 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground ml-1" />
                    </div>
                  </div>
                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive px-2 py-1 rounded-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white">LIVE</span>
                  </div>
                  {/* Viewers */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Eye className="w-3 h-3 text-white" />
                    <span className="text-xs text-white">{stream.viewers}</span>
                  </div>
                </div>
                {/* Stream Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-foreground text-base">{stream.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{stream.channel}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gradient-gold">Popular Videos</h3>
            {videos.map((video, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-4 border border-primary/10 flex gap-4 animate-slide-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="relative w-24 h-16 gradient-accent rounded-xl flex items-center justify-center text-2xl shadow-soft overflow-hidden">
                  {video.thumbnail}
                  <div className="absolute bottom-1 right-1 bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium text-foreground">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{video.views}</span>
                    </div>
                  </div>
                </div>
                <button className="self-center text-muted-foreground hover:text-destructive transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gradient-gold">Popular Scholars</h3>
            {channels.map((channel, index) => (
              <div
                key={index}
                className="glass rounded-2xl p-4 border border-primary/10 flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="relative">
                  <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-xl shadow-soft">
                    {channel.avatar}
                  </div>
                  {channel.live && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center border-2 border-card">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{channel.name}</h4>
                    {channel.live && (
                      <span className="text-[10px] bg-destructive text-primary-foreground px-1.5 py-0.5 rounded-full">LIVE</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{channel.handle}</p>
                  <p className="text-xs text-muted-foreground">{channel.subscribers} subscribers</p>
                </div>
                
                <button className="px-4 py-2 gradient-accent text-primary-foreground text-sm font-medium rounded-xl shadow-soft hover:scale-105 transition-transform">
                  Follow
                </button>
              </div>
            ))}

            {/* Discover More */}
            <button className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center justify-center gap-2 text-primary hover:shadow-soft transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <span className="font-medium">Discover More Channels</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Community;
