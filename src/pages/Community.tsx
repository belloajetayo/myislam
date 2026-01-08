import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Play, Radio, Users, ExternalLink, Heart, Eye, ArrowLeft, User, Settings, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  location_city: string | null;
  location_country: string | null;
}

const channels = [
  {
    name: 'Mufti Menk',
    handle: '@muftimenkofficial',
    subscribers: '4.2M',
    avatar: '🎙️',
    live: false,
  },
  {
    name: 'Omar Suleiman',
    handle: '@omarsuleiman',
    subscribers: '2.8M',
    avatar: '📖',
    live: true,
  },
  {
    name: 'Nouman Ali Khan',
    handle: '@noumanali',
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'live' | 'videos' | 'channels' | 'profile'>('live');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: editName || null,
          location_city: editCity || null,
          location_country: editCountry || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setShowEditProfile(false);
      fetchProfile(user.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const openEditProfile = () => {
    setEditName(profile?.full_name || '');
    setEditCity(profile?.location_city || '');
    setEditCountry(profile?.location_country || '');
    setShowEditProfile(true);
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-center gap-4 py-2 animate-fade-in">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gradient-gold">Community</h1>
            <p className="text-xs text-muted-foreground">Islamic Content & Livestreams</p>
          </div>
          {user && (
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-10 h-10 rounded-2xl overflow-hidden border-2 transition-all ${
                activeTab === 'profile' ? 'border-islamic-gold' : 'border-transparent'
              }`}
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-islamic-gold to-islamic-gold/70 text-white text-sm font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          )}
        </header>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex border border-primary/10 animate-slide-up">
          {[
            { id: 'live', label: 'Live', icon: Radio },
            { id: 'videos', label: 'Videos', icon: Play },
            { id: 'channels', label: 'Channels', icon: Users },
            ...(user ? [{ id: 'profile', label: 'Profile', icon: User }] : []),
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
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-slide-up">
            {user ? (
              <>
                {/* Profile Card */}
                <div className="glass rounded-3xl p-6 border border-primary/10 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24 border-4 border-islamic-gold/30">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-islamic-gold to-islamic-gold/70 text-white text-2xl font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-islamic-gold rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-bold text-foreground">
                    {profile?.full_name || 'Muslim User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  
                  {(profile?.location_city || profile?.location_country) && (
                    <p className="text-sm text-islamic-gold mt-1">
                      📍 {[profile?.location_city, profile?.location_country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={openEditProfile}
                      className="flex-1 gradient-warm text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="flex-1"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-2xl p-4 text-center border border-primary/10">
                    <p className="text-2xl font-bold text-islamic-gold">12</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                  <div className="glass rounded-2xl p-4 text-center border border-primary/10">
                    <p className="text-2xl font-bold text-islamic-green">45</p>
                    <p className="text-xs text-muted-foreground">Prayers</p>
                  </div>
                  <div className="glass rounded-2xl p-4 text-center border border-primary/10">
                    <p className="text-2xl font-bold text-primary">7</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass rounded-3xl p-8 border border-primary/10 text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Join the Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to save your progress, follow scholars, and connect with other Muslims.
                </p>
                <Button onClick={() => navigate('/auth')} className="gradient-primary text-white">
                  Sign In / Sign Up
                </Button>
              </div>
            )}
          </div>
        )}

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

            {/* Other Livestreams */}
            <h3 className="text-sm font-semibold text-foreground">Other Streams</h3>
            {livestreams.map((stream, index) => (
              <div
                key={index}
                className="glass rounded-3xl overflow-hidden border border-primary/10 animate-slide-up"
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <div className="w-full aspect-video gradient-primary flex items-center justify-center relative">
                  <span className="text-6xl">{stream.thumbnail}</span>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/30 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive px-2 py-1 rounded-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white">LIVE</span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Eye className="w-3 h-3 text-white" />
                    <span className="text-xs text-white">{stream.viewers}</span>
                  </div>
                </div>
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
            <h3 className="text-sm font-semibold text-foreground">Popular Videos</h3>
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
            <h3 className="text-sm font-semibold text-foreground">Popular Scholars</h3>
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

            <button className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center justify-center gap-2 text-primary hover:shadow-soft transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <span className="font-medium">Discover More Channels</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">City</label>
              <Input
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="Your city"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Country</label>
              <Input
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                placeholder="Your country"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleSaveProfile} 
              className="w-full gradient-primary text-white"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Community;
