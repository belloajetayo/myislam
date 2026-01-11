import React from 'react';
import { Plane, Hotel, Shield, CreditCard, FileText, HeartPulse, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingLink {
  id: string;
  category: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  links: {
    name: string;
    url: string;
    affiliate?: boolean;
  }[];
  gradient: string;
}

const bookingCategories: BookingLink[] = [
  {
    id: 'official',
    category: 'Official',
    icon: <Shield className="w-5 h-5 text-white" />,
    title: 'Official Resources',
    description: 'Government & authorized portals',
    gradient: 'from-emerald-400 to-teal-500',
    links: [
      { name: 'Nusuk Hajj Portal', url: 'https://hajj.nusuk.sa/' },
      { name: 'Saudi eVisa', url: 'https://visa.visitsaudi.com/' },
      { name: 'Saudi Ministry of Hajj', url: 'https://www.haj.gov.sa/en' },
    ],
  },
  {
    id: 'flights',
    category: 'Flights',
    icon: <Plane className="w-5 h-5 text-white" />,
    title: 'Flight Booking',
    description: 'Compare & book flights to Jeddah',
    gradient: 'from-blue-400 to-indigo-500',
    links: [
      { name: 'Skyscanner', url: 'https://www.skyscanner.com/flights/search?destination=JED', affiliate: true },
      { name: 'Google Flights', url: 'https://www.google.com/flights?q=flights+to+jeddah', affiliate: true },
      { name: 'Expedia', url: 'https://www.expedia.com/Flights?destination=Jeddah', affiliate: true },
      { name: 'Saudia Airlines', url: 'https://www.saudia.com/' },
    ],
  },
  {
    id: 'hotels',
    category: 'Hotels',
    icon: <Hotel className="w-5 h-5 text-white" />,
    title: 'Accommodation',
    description: 'Hotels near Haram in Makkah & Madinah',
    gradient: 'from-purple-400 to-violet-500',
    links: [
      { name: 'Booking.com - Makkah', url: 'https://www.booking.com/city/sa/mecca.html', affiliate: true },
      { name: 'Agoda - Makkah', url: 'https://www.agoda.com/city/mecca-sa.html', affiliate: true },
      { name: 'Hotels.com', url: 'https://www.hotels.com/search/mecca-saudi-arabia/', affiliate: true },
      { name: 'Marriott Saudi Arabia', url: 'https://www.marriott.com/search/findHotels.mi' },
    ],
  },
  {
    id: 'insurance',
    category: 'Insurance',
    icon: <HeartPulse className="w-5 h-5 text-white" />,
    title: 'Travel Insurance',
    description: 'Medical & trip protection',
    gradient: 'from-rose-400 to-pink-500',
    links: [
      { name: 'World Nomads', url: 'https://www.worldnomads.com/', affiliate: true },
      { name: 'Allianz Travel', url: 'https://www.allianztravelinsurance.com/', affiliate: true },
      { name: 'Travel Guard', url: 'https://www.travelguard.com/', affiliate: true },
    ],
  },
  {
    id: 'essentials',
    category: 'Essentials',
    icon: <CreditCard className="w-5 h-5 text-white" />,
    title: 'Travel Essentials',
    description: 'Everything you need for your journey',
    gradient: 'from-amber-400 to-orange-500',
    links: [
      { name: 'Amazon Hajj Supplies', url: 'https://www.amazon.com/s?k=hajj+travel+essentials', affiliate: true },
      { name: 'Ihram Sets', url: 'https://www.amazon.com/s?k=ihram+for+hajj', affiliate: true },
      { name: 'Travel Adapters', url: 'https://www.amazon.com/s?k=saudi+arabia+travel+adapter', affiliate: true },
    ],
  },
];

const HajjBookingLinks: React.FC = () => {
  const handleLinkClick = (url: string, affiliate?: boolean) => {
    // Track affiliate clicks here if needed
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {bookingCategories.map((category) => (
        <div 
          key={category.id}
          className="glass rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
              {category.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{category.title}</h3>
              <p className="text-xs text-foreground/60">{category.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {category.links.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto py-2 px-3 justify-between text-left hover:bg-primary/5"
                onClick={() => handleLinkClick(link.url, link.affiliate)}
              >
                <span className="text-xs truncate">{link.name}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 ml-1 text-foreground/40" />
              </Button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-foreground/40 text-center">
        * Some links may be affiliate partnerships that help support this app
      </p>
    </div>
  );
};

export default HajjBookingLinks;
