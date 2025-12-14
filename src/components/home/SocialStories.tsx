import React from 'react';
import { Plus, Instagram, Youtube, Twitter, Facebook } from 'lucide-react';

const stories = [
  { id: 1, name: 'Add Story', isAdd: true },
  { id: 2, name: 'Mufti Menk', avatar: 'https://i.pravatar.cc/100?img=1', platform: 'instagram' },
  { id: 3, name: 'Omar Suleiman', avatar: 'https://i.pravatar.cc/100?img=2', platform: 'youtube' },
  { id: 4, name: 'Nouman Ali', avatar: 'https://i.pravatar.cc/100?img=3', platform: 'instagram' },
  { id: 5, name: 'Yasir Qadhi', avatar: 'https://i.pravatar.cc/100?img=4', platform: 'youtube' },
  { id: 6, name: 'NAK', avatar: 'https://i.pravatar.cc/100?img=5', platform: 'twitter' },
];

const posts = [
  {
    id: 1,
    author: 'Mufti Menk',
    avatar: 'https://i.pravatar.cc/100?img=1',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&h=400&fit=crop',
    caption: 'Never lose hope in Allah\'s mercy. He is the Most Merciful, the Most Forgiving.',
    likes: 12500,
    comments: 432,
    time: '2h ago',
  },
  {
    id: 2,
    author: 'Omar Suleiman',
    avatar: 'https://i.pravatar.cc/100?img=2',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&h=400&fit=crop',
    caption: 'The Quran was revealed in Ramadan, but its guidance is for every day of our lives.',
    likes: 8900,
    comments: 256,
    time: '4h ago',
  },
];

const SocialStories: React.FC = () => {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Stories Row */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-16 h-16 rounded-2xl ${
                story.isAdd 
                  ? 'glass border-2 border-dashed border-primary-foreground/30 flex items-center justify-center' 
                  : 'p-0.5 bg-gradient-to-br from-islamic-gold to-purple-500'
              }`}>
                {story.isAdd ? (
                  <Plus className="w-6 h-6 text-primary-foreground/60" />
                ) : (
                  <div className="w-full h-full rounded-[14px] overflow-hidden">
                    <img 
                      src={story.avatar} 
                      alt={story.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-primary-foreground/70 text-center w-16 truncate">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="glass rounded-3xl overflow-hidden border border-primary-foreground/10 shadow-card">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-islamic-gold/50">
                <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary-foreground">{post.author}</p>
                <p className="text-xs text-primary-foreground/60">{post.time}</p>
              </div>
              <Instagram className="w-4 h-4 text-primary-foreground/60" />
            </div>

            {/* Post Image */}
            <div className="aspect-square">
              <img 
                src={post.image} 
                alt="Post"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Footer */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-primary-foreground/80 hover:text-islamic-gold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-xs">{(post.likes / 1000).toFixed(1)}k</span>
                </button>
                <button className="flex items-center gap-1 text-primary-foreground/80 hover:text-islamic-gold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 text-primary-foreground/80 hover:text-islamic-gold transition-colors ml-auto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-primary-foreground/90">
                <span className="font-semibold">{post.author}</span> {post.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialStories;
