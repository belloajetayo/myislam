import React from 'react';
import { Star, Users, Clock, Plane, Hotel, Bus, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface HajjPackage {
  id: string;
  name: string;
  provider: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: string;
  rating: number;
  reviews: number;
  tier: 'economy' | 'standard' | 'premium' | 'vip';
  features: string[];
  hotelMakkah: string;
  hotelMadinah: string;
  flightIncluded: boolean;
  visaIncluded: boolean;
  mealsIncluded: boolean;
  guidanceIncluded: boolean;
  affiliateUrl: string;
  image?: string;
  popular?: boolean;
}

interface HajjPackageCardProps {
  package: HajjPackage;
  onSelect: (pkg: HajjPackage) => void;
}

const tierColors = {
  economy: 'from-slate-400 to-slate-500',
  standard: 'from-blue-400 to-blue-500',
  premium: 'from-purple-400 to-violet-500',
  vip: 'from-amber-400 to-yellow-500',
};

const tierLabels = {
  economy: 'Economy',
  standard: 'Standard',
  premium: 'Premium',
  vip: 'VIP Luxury',
};

const HajjPackageCard: React.FC<HajjPackageCardProps> = ({ package: pkg, onSelect }) => {
  const discount = pkg.originalPrice 
    ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
    : 0;

  return (
    <div className="glass rounded-2xl border border-primary-foreground/10 overflow-hidden hover:shadow-elevated transition-all duration-300 relative">
      {pkg.popular && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 animate-pulse-soft">
            🔥 Most Popular
          </Badge>
        </div>
      )}
      
      {/* Tier Banner */}
      <div className={`bg-gradient-to-r ${tierColors[pkg.tier]} py-2 px-4`}>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-semibold">{tierLabels[pkg.tier]}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-white text-xs">{pkg.rating} ({pkg.reviews})</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Provider & Name */}
        <div>
          <p className="text-xs text-primary-foreground/60">{pkg.provider}</p>
          <h3 className="text-base font-bold text-primary-foreground">{pkg.name}</h3>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-gradient-gold">
            ${pkg.price.toLocaleString()}
          </span>
          {pkg.originalPrice && (
            <>
              <span className="text-sm text-primary-foreground/40 line-through">
                ${pkg.originalPrice.toLocaleString()}
              </span>
              <Badge variant="destructive" className="text-xs">
                {discount}% OFF
              </Badge>
            </>
          )}
        </div>
        <p className="text-xs text-primary-foreground/60">per person • {pkg.duration}</p>

        {/* Quick Features */}
        <div className="grid grid-cols-4 gap-2 py-2">
          <div className={`flex flex-col items-center gap-1 ${pkg.flightIncluded ? 'text-emerald-500' : 'text-primary-foreground/30'}`}>
            <Plane className="w-4 h-4" />
            <span className="text-[10px]">Flight</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${pkg.visaIncluded ? 'text-emerald-500' : 'text-primary-foreground/30'}`}>
            <CheckCircle className="w-4 h-4" />
            <span className="text-[10px]">Visa</span>
          </div>
          <div className={`flex flex-col items-center gap-1 text-emerald-500`}>
            <Hotel className="w-4 h-4" />
            <span className="text-[10px]">Hotel</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${pkg.guidanceIncluded ? 'text-emerald-500' : 'text-primary-foreground/30'}`}>
            <Users className="w-4 h-4" />
            <span className="text-[10px]">Guide</span>
          </div>
        </div>

        {/* Hotels */}
        <div className="space-y-1 text-xs text-primary-foreground/80">
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground/50">Makkah:</span>
            <span className="font-medium">{pkg.hotelMakkah}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground/50">Madinah:</span>
            <span className="font-medium">{pkg.hotelMadinah}</span>
          </div>
        </div>

        {/* Features Preview */}
        <div className="flex flex-wrap gap-1">
          {pkg.features.slice(0, 3).map((feature, i) => (
            <Badge key={i} variant="outline" className="text-[10px] py-0">
              {feature}
            </Badge>
          ))}
          {pkg.features.length > 3 && (
            <Badge variant="outline" className="text-[10px] py-0">
              +{pkg.features.length - 3} more
            </Badge>
          )}
        </div>

        {/* CTA */}
        <Button 
          className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
          onClick={() => onSelect(pkg)}
        >
          View Package
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default HajjPackageCard;
