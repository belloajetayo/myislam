import React from 'react';
import { Building2, Star, Shield, Globe, ExternalLink, Phone, Mail, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HajjAgency {
  id: string;
  name: string;
  logo?: string;
  country: string;
  rating: number;
  reviews: number;
  verified: boolean;
  accreditation: string[];
  yearsInBusiness: number;
  website: string;
  phone?: string;
  email?: string;
  description: string;
  specialties: string[];
  priceRange: string;
}

const agencies: HajjAgency[] = [
  {
    id: '1',
    name: 'Al-Huda Travel',
    country: 'USA',
    rating: 4.9,
    reviews: 1250,
    verified: true,
    accreditation: ['IATA', 'ASTA', 'Nusuk Certified'],
    yearsInBusiness: 25,
    website: 'https://alhudatravel.com',
    description: 'Leading Hajj & Umrah operator with 25+ years of experience serving pilgrims from North America.',
    specialties: ['VIP Packages', 'Family Groups', 'Accessible Travel'],
    priceRange: '$6,000 - $15,000',
  },
  {
    id: '2',
    name: 'Dar El Salam Travel',
    country: 'USA',
    rating: 4.8,
    reviews: 980,
    verified: true,
    accreditation: ['IATA', 'Nusuk Certified'],
    yearsInBusiness: 30,
    website: 'https://darelsalam.com',
    description: 'Trusted by Muslims worldwide for over 30 years. Premium Hajj experiences with scholar guidance.',
    specialties: ['Scholar Led', 'Premium Hotels', 'Large Groups'],
    priceRange: '$7,000 - $18,000',
  },
  {
    id: '3',
    name: 'Islamic Travel',
    country: 'UK',
    rating: 4.7,
    reviews: 2100,
    verified: true,
    accreditation: ['ATOL', 'IATA', 'Nusuk Certified'],
    yearsInBusiness: 20,
    website: 'https://islamictravel.co.uk',
    description: 'UK\'s most trusted Hajj operator with comprehensive packages and local support.',
    specialties: ['Budget Options', 'UK Departures', '24/7 Support'],
    priceRange: '£4,500 - £12,000',
  },
  {
    id: '4',
    name: 'Zamzam Tours',
    country: 'Canada',
    rating: 4.8,
    reviews: 750,
    verified: true,
    accreditation: ['TICO', 'IATA', 'Nusuk Certified'],
    yearsInBusiness: 18,
    website: 'https://zamzamtours.ca',
    description: 'Canadian-based Hajj specialists with personalized service and multilingual guides.',
    specialties: ['Multilingual', 'Small Groups', 'First-Timers'],
    priceRange: 'CAD $8,000 - $20,000',
  },
  {
    id: '5',
    name: 'Safar Travel',
    country: 'UAE',
    rating: 4.9,
    reviews: 3200,
    verified: true,
    accreditation: ['DET Licensed', 'Nusuk Certified'],
    yearsInBusiness: 15,
    website: 'https://safartravel.ae',
    description: 'Premium Hajj packages with 5-star accommodations and exclusive services.',
    specialties: ['Luxury', 'Private Transport', 'Close to Haram'],
    priceRange: 'AED 25,000 - 80,000',
  },
];

const HajjAgencies: React.FC = () => {
  return (
    <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gradient-gold">Trusted Agencies</h2>
          <p className="text-xs text-primary-foreground/70">Verified & Accredited</p>
        </div>
      </div>

      <div className="space-y-4">
        {agencies.map((agency) => (
          <div 
            key={agency.id}
            className="bg-primary/5 rounded-2xl p-4 space-y-3 hover:bg-primary/10 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary-foreground">{agency.name}</h3>
                  {agency.verified && (
                    <Shield className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-primary-foreground/60 mt-1">
                  <Globe className="w-3 h-3" />
                  <span>{agency.country}</span>
                  <span>•</span>
                  <Award className="w-3 h-3" />
                  <span>{agency.yearsInBusiness}+ years</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold text-amber-600">{agency.rating}</span>
                <span className="text-[10px] text-primary-foreground/50">({agency.reviews})</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-primary-foreground/70 line-clamp-2">{agency.description}</p>

            {/* Accreditation */}
            <div className="flex flex-wrap gap-1">
              {agency.accreditation.map((acc, i) => (
                <Badge key={i} variant="outline" className="text-[10px] py-0 bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
                  {acc}
                </Badge>
              ))}
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1">
              {agency.specialties.map((spec, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] py-0">
                  {spec}
                </Badge>
              ))}
            </div>

            {/* Price Range & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-primary-foreground/10">
              <span className="text-xs text-primary-foreground/60">
                {agency.priceRange}
              </span>
              <Button 
                size="sm" 
                className="h-8 bg-gradient-to-r from-primary to-secondary text-white"
                onClick={() => window.open(agency.website, '_blank')}
              >
                Visit Site <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-primary-foreground/50 text-center mt-4">
        ✓ All agencies verified • ✓ Nusuk certified • ✓ Licensed operators
      </p>
    </div>
  );
};

export default HajjAgencies;
