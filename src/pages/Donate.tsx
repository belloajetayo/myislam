import React, { useState } from 'react';
import { ArrowLeft, Heart, Globe, Users, Building2, Star, CheckCircle2, Moon, BookOpen, Compass, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import donateHero from '@/assets/donate-hero.jpg';

const AMOUNTS = [10, 25, 50, 100, 250];

const IMPACT_ITEMS = [
  { icon: Building2, amount: '$10', desc: 'Powers daily server access for hundreds of users' },
  { icon: Users, amount: '$50', desc: 'Helps promote to new communities before Ramadan' },
  { icon: Globe, amount: '$100', desc: 'Contributes to mobile app development for easier use' },
  { icon: Star, amount: '$250+', desc: 'Funds major features like Arabic/Urdu support or global outreach' },
  { icon: Heart, amount: 'Every gift', desc: 'Creates lasting barakah as the ummah grows stronger in worship' },
];

const SHOWCASE_ITEMS = [
  { icon: Moon, label: 'Ramadan Countdown' },
  { icon: BookOpen, label: 'Daily Wisdom & Quran' },
  { icon: Clock, label: 'Prayer Times & Streaks' },
  { icon: Compass, label: 'Qiblah Compass' },
  { icon: Star, label: 'Fasting Tracker' },
  { icon: Globe, label: 'Mecca Live Stream' },
];

const Donate: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [isZakat, setIsZakat] = useState(false);

  const finalAmount = selectedAmount ?? (customAmount ? Number(customAmount) : 0);

  const handleDonate = () => {
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Please select or enter a donation amount');
      return;
    }
    toast.success(`JazakAllah Khair! Processing your ${isMonthly ? 'monthly ' : ''}${isZakat ? 'Zakat' : 'Sadaqah'} of $${finalAmount}...`);
    // TODO: integrate actual payment
  };

  const scrollToDonate = () => {
    document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <img src={donateHero} alt="Crescent moon over mosque at dusk" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />

        <div className="relative z-10 max-w-2xl mx-auto px-5 pt-6 pb-16 text-center">
          <button onClick={() => navigate(-1)} className="absolute top-5 left-4 w-10 h-10 glass rounded-full flex items-center justify-center border border-white/20 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="pt-14 space-y-5">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
              Support MyIslam — Empower Every Muslim's Daily Connection to <span className="text-gradient-gold">Allah</span>
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-lg mx-auto">
              A free companion app for prayer, Quran, live Mecca, fasting prep, and iman boosts. Help bring <em>sakinah</em> and consistency to families, individuals, and communities worldwide — especially as <strong>Ramadan 1447</strong> approaches (inshaAllah starting ~Feb 18).
            </p>
            <Button
              onClick={scrollToDonate}
              size="lg"
              className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground font-semibold text-base px-8 py-6 rounded-2xl shadow-glow animate-glow-pulse"
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate Now — Build Sadaqah Jariyah
            </Button>
            <p className="text-xs text-white/60 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Secure • Zakat-eligible • Transparent updates
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-5 space-y-10 pb-16">
        {/* Story Section */}
        <section className="space-y-4 pt-8">
          <h2 className="text-xl font-bold text-foreground">Assalamu Alaikum wa Rahmatullahi wa Barakatuh</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              In our fast-paced world, staying consistent in worship — salat, Quran recitation, dua, fasting — brings true peace and closeness to Allah. <strong className="text-foreground">MyIslam</strong> makes it easier for every Muslim: accurate prayer times anywhere, Qiblah compass, live stream from Masjid al-Haram, daily verses/Hadith/AI wisdom, progress tracking, Ramadan countdown & fasting tools, and more.
            </p>
            <p>
              It's <strong className="text-foreground">free, ad-free</strong>, and already refreshing iman for brothers and sisters globally. With Ramadan drawing near, your support scales it further: mobile version, wider reach, language expansions — so more families, elders, professionals, and communities can benefit daily and earn ongoing reward.
            </p>
            <p className="text-foreground font-medium italic border-l-2 border-primary pl-4">
              This is sadaqah jariyah: Every prayer tracked, every fast marked, every verse read through the app multiplies your reward inshaAllah.
            </p>
          </div>
        </section>

        {/* Impact Breakdown */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Your Impact</h2>
          <div className="space-y-3">
            {IMPACT_ITEMS.map((item) => (
              <Card key={item.amount} className="glass border-border/50">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{item.amount}</span>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* App Showcase */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">See the Serene Tools Bringing Peace to Daily Life</h2>
          <div className="grid grid-cols-3 gap-3">
            {SHOWCASE_ITEMS.map((item) => (
              <Card key={item.label} className="glass border-border/50 text-center">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-tight">{item.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">Swipe through the app to explore → <ChevronRight className="inline w-3 h-3" /></p>
        </section>

        {/* Ramadan Urgency */}
        <section className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          <div className="relative p-6 text-center space-y-3">
            <Moon className="w-8 h-8 text-primary-foreground mx-auto animate-float" />
            <h2 className="text-lg font-bold text-primary-foreground">Ramadan 1447 Is Just Days Away</h2>
            <p className="text-sm text-primary-foreground/85 leading-relaxed">
              A time of multiplied rewards and reflection. Help equip the ummah with simple tools for stronger fasts, Tarawih, and Quran connection. Donate today and share in the immense good before the blessed month begins!
            </p>
            <Button
              onClick={scrollToDonate}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border border-white/25 backdrop-blur-sm"
            >
              Give Now for the Ummah
            </Button>
          </div>
        </section>

        {/* Donation Form */}
        <section id="donation-form" className="space-y-5 scroll-mt-8">
          <h2 className="text-xl font-bold text-foreground text-center">Choose Your Contribution</h2>

          {/* Amount Selection */}
          <div className="grid grid-cols-3 gap-3">
            {AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                  selectedAmount === amt
                    ? 'bg-primary text-primary-foreground border-primary shadow-soft scale-105'
                    : 'bg-card text-foreground border-border hover:border-primary/40'
                }`}
              >
                ${amt}
              </button>
            ))}
            <div className="relative">
              <Input
                type="number"
                placeholder="Custom"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                className="h-full text-center text-sm font-semibold rounded-xl"
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
            <Label htmlFor="monthly" className="text-sm font-medium text-foreground cursor-pointer">
              Monthly recurring donation
            </Label>
            <Switch id="monthly" checked={isMonthly} onCheckedChange={setIsMonthly} />
          </div>

          {/* Zakat Checkbox */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <Checkbox id="zakat" checked={isZakat} onCheckedChange={(v) => setIsZakat(v === true)} />
            <Label htmlFor="zakat" className="text-sm text-foreground cursor-pointer">
              This is my Zakat / Sadaqah contribution
            </Label>
          </div>

          {/* CTA */}
          <Button
            onClick={handleDonate}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground font-semibold text-base py-6 rounded-2xl shadow-glow"
          >
            <Heart className="w-5 h-5 mr-2" />
            Donate{finalAmount > 0 ? ` $${finalAmount}` : ''} & Earn Continuous Reward
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            <CheckCircle2 className="inline w-3 h-3 mr-1" />
            Secure payment • Tax-deductible • 100% goes to the project
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center space-y-3 pt-4 pb-8 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <em>JazakAllah khair</em> for supporting this dawah effort. Updates shared on <a href="https://x.com/sapphirepul" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">X @sapphirepul</a>. For Allah's sake only.
          </p>
          <p className="text-xs text-muted-foreground font-arabic">بارك الله فيكم</p>
        </footer>
      </div>
    </div>
  );
};

export default Donate;
