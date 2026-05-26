import React, { useState, useMemo } from 'react';
import { Calculator, Users, Hotel, Plane, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface CalculatorInputs {
  travelers: number;
  departureCity: string;
  hotelTier: 'budget' | 'standard' | 'premium' | 'luxury';
  duration: number;
  includeUmrah: boolean;
}

const basePrices = {
  flight: {
    'North America': 1500,
    'Europe': 800,
    'Africa': 700,
    'Asia': 600,
    'Middle East': 300,
    'Oceania': 2000,
    'South America': 1800,
  },
  hotel: {
    budget: 80,
    standard: 150,
    premium: 300,
    luxury: 600,
  },
  services: {
    visa: 150,
    transport: 200,
    guidance: 300,
    meals: 50, // per day
    insurance: 100,
  },
  umrahAddon: 800,
};

const HajjCostCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    travelers: 1,
    departureCity: 'North America',
    hotelTier: 'standard',
    duration: 14,
    includeUmrah: false,
  });

  const [showBreakdown, setShowBreakdown] = useState(false);

  const estimate = useMemo(() => {
    const flightCost = basePrices.flight[inputs.departureCity as keyof typeof basePrices.flight] || 1000;
    const hotelCost = basePrices.hotel[inputs.hotelTier] * inputs.duration;
    const visaCost = basePrices.services.visa;
    const transportCost = basePrices.services.transport;
    const guidanceCost = basePrices.services.guidance;
    const mealsCost = basePrices.services.meals * inputs.duration;
    const insuranceCost = basePrices.services.insurance;
    const umrahCost = inputs.includeUmrah ? basePrices.umrahAddon : 0;

    const perPerson = flightCost + hotelCost + visaCost + transportCost + guidanceCost + mealsCost + insuranceCost + umrahCost;
    const total = perPerson * inputs.travelers;

    return {
      breakdown: {
        flight: flightCost,
        hotel: hotelCost,
        visa: visaCost,
        transport: transportCost,
        guidance: guidanceCost,
        meals: mealsCost,
        insurance: insuranceCost,
        umrah: umrahCost,
      },
      perPerson,
      total,
    };
  }, [inputs]);

  return (
    <div className="glass rounded-3xl p-5 border border-border shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gradient-gold">Cost Estimator</h2>
          <p className="text-xs text-foreground/70">Plan your budget</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Travelers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-foreground/80 flex items-center gap-2">
              <Users className="w-4 h-4" /> Travelers
            </label>
            <span className="text-sm font-semibold text-foreground">{inputs.travelers}</span>
          </div>
          <Slider
            value={[inputs.travelers]}
            onValueChange={(v) => setInputs(prev => ({ ...prev, travelers: v[0] }))}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        {/* Region */}
        <div>
          <label className="text-sm text-foreground/80 flex items-center gap-2 mb-2">
            <Plane className="w-4 h-4" /> Departing From
          </label>
          <Select 
            value={inputs.departureCity} 
            onValueChange={(v) => setInputs(prev => ({ ...prev, departureCity: v }))}
          >
            <SelectTrigger className="glass border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Africa">Africa</SelectItem>
              <SelectItem value="Asia">Asia</SelectItem>
              <SelectItem value="Middle East">Middle East</SelectItem>
              <SelectItem value="Oceania">Oceania</SelectItem>
              <SelectItem value="South America">South America</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hotel Tier */}
        <div>
          <label className="text-sm text-foreground/80 flex items-center gap-2 mb-2">
            <Hotel className="w-4 h-4" /> Accommodation
          </label>
          <Select 
            value={inputs.hotelTier} 
            onValueChange={(v: CalculatorInputs['hotelTier']) => setInputs(prev => ({ ...prev, hotelTier: v }))}
          >
            <SelectTrigger className="glass border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Budget (3-star)</SelectItem>
              <SelectItem value="standard">Standard (4-star)</SelectItem>
              <SelectItem value="premium">Premium (5-star)</SelectItem>
              <SelectItem value="luxury">Luxury (5-star+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-foreground/80 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Duration (days)
            </label>
            <span className="text-sm font-semibold text-foreground">{inputs.duration}</span>
          </div>
          <Slider
            value={[inputs.duration]}
            onValueChange={(v) => setInputs(prev => ({ ...prev, duration: v[0] }))}
            min={10}
            max={30}
            step={1}
            className="w-full"
          />
        </div>

        {/* Include Umrah Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inputs.includeUmrah}
            onChange={(e) => setInputs(prev => ({ ...prev, includeUmrah: e.target.checked }))}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground/80">Include Umrah (+${basePrices.umrahAddon})</span>
        </label>

        {/* Estimate Display */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/70">Per Person</span>
            <span className="text-lg font-bold text-foreground">
              ${estimate.perPerson.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-base text-foreground font-medium">Total ({inputs.travelers} travelers)</span>
            <span className="text-2xl font-bold text-gradient-gold">
              ${estimate.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Breakdown Toggle */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          {showBreakdown ? 'Hide' : 'Show'} Cost Breakdown
        </Button>

        {showBreakdown && (
          <div className="space-y-2 text-sm">
            {Object.entries(estimate.breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-foreground/70">
                <span className="capitalize">{key}</span>
                <span>${value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-foreground/50 text-center">
          * Estimates based on average 2024-2025 prices. Actual costs may vary.
        </p>
      </div>
    </div>
  );
};

export default HajjCostCalculator;
