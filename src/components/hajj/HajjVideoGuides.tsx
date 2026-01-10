import React, { useState } from 'react';
import { Play, Video, Clock, Eye, BookOpen, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface VideoGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: string;
  thumbnail: string;
  youtubeId: string;
  category: 'preparation' | 'ritual' | 'spiritual' | 'practical';
}

const videoGuides: VideoGuide[] = [
  {
    id: '1',
    title: 'Complete Hajj Guide 2025',
    description: 'Step-by-step visual guide to performing all Hajj rituals correctly.',
    duration: '45:00',
    views: '2.1M',
    thumbnail: 'https://img.youtube.com/vi/9q1yLVZwf1A/maxresdefault.jpg',
    youtubeId: '9q1yLVZwf1A',
    category: 'ritual',
  },
  {
    id: '2',
    title: 'How to Enter Ihram',
    description: 'Detailed guide on making intention and entering the state of Ihram.',
    duration: '12:30',
    views: '890K',
    thumbnail: 'https://img.youtube.com/vi/kOJ9lLe7-R8/maxresdefault.jpg',
    youtubeId: 'kOJ9lLe7-R8',
    category: 'ritual',
  },
  {
    id: '3',
    title: 'Day of Arafah Explained',
    description: 'Understanding the most important day of Hajj and how to maximize it.',
    duration: '18:45',
    views: '1.5M',
    thumbnail: 'https://img.youtube.com/vi/SnX8R0T__i0/maxresdefault.jpg',
    youtubeId: 'SnX8R0T__i0',
    category: 'spiritual',
  },
  {
    id: '4',
    title: 'Hajj Packing Guide',
    description: 'Essential items to pack and what to leave behind for your journey.',
    duration: '10:15',
    views: '650K',
    thumbnail: 'https://img.youtube.com/vi/C4cYh35fLXg/maxresdefault.jpg',
    youtubeId: 'C4cYh35fLXg',
    category: 'practical',
  },
  {
    id: '5',
    title: 'Stoning the Jamarat',
    description: 'How to perform the stoning ritual correctly and safely.',
    duration: '8:20',
    views: '780K',
    thumbnail: 'https://img.youtube.com/vi/C4cYh35fLXg/maxresdefault.jpg',
    youtubeId: 'C4cYh35fLXg',
    category: 'ritual',
  },
  {
    id: '6',
    title: 'Spiritual Preparation',
    description: 'Preparing your heart and mind for the journey of a lifetime.',
    duration: '22:00',
    views: '420K',
    thumbnail: 'https://img.youtube.com/vi/SnX8R0T__i0/maxresdefault.jpg',
    youtubeId: 'SnX8R0T__i0',
    category: 'spiritual',
  },
];

const categoryColors = {
  preparation: 'bg-blue-500/10 text-blue-600',
  ritual: 'bg-emerald-500/10 text-emerald-600',
  spiritual: 'bg-purple-500/10 text-purple-600',
  practical: 'bg-amber-500/10 text-amber-600',
};

const HajjVideoGuides: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoGuide | null>(null);

  return (
    <>
      <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gradient-gold">Video Guides</h2>
            <p className="text-xs text-primary-foreground/70">Learn visually</p>
          </div>
        </div>

        <div className="space-y-3">
          {videoGuides.map((video) => (
            <div 
              key={video.id}
              className="flex gap-3 p-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-primary-foreground line-clamp-1">
                  {video.title}
                </h4>
                <p className="text-xs text-primary-foreground/60 line-clamp-1 mt-0.5">
                  {video.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-[10px] py-0 ${categoryColors[video.category]}`}>
                    {video.category}
                  </Badge>
                  <span className="text-[10px] text-primary-foreground/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {video.duration}
                  </span>
                  <span className="text-[10px] text-primary-foreground/50 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {video.views}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-primary-foreground/40 self-center flex-shrink-0" />
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <a 
            href="https://youtube.com/results?search_query=hajj+guide"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center justify-center gap-1"
          >
            <BookOpen className="w-3 h-3" /> View more on YouTube
          </a>
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            {selectedVideo && (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
          <div className="p-4 pt-2">
            <p className="text-sm text-muted-foreground">{selectedVideo?.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HajjVideoGuides;
