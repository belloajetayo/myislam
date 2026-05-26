import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  HandHeart,
  TrendingUp,
  Info,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Zakat: React.FC = () => {
  const navigate = useNavigate();
  const [savings, setSavings] = useState("");
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [investments, setInvestments] = useState("");
  const [businessAssets, setBusinessAssets] = useState("");
  const [debts, setDebts] = useState("");
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);

  const nisabThreshold = 5000; // Approximate USD value

  const calculateZakat = () => {
    const total =
      (parseFloat(savings) || 0) +
      (parseFloat(gold) || 0) +
      (parseFloat(silver) || 0) +
      (parseFloat(investments) || 0) +
      (parseFloat(businessAssets) || 0) -
      (parseFloat(debts) || 0);

    if (total >= nisabThreshold) {
      setZakatAmount(total * 0.025);
    } else {
      setZakatAmount(0);
    }
  };

  const zakatRecipients = [
    {
      title: "The Poor (Al-Fuqara)",
      description: "Those who have little to no income",
    },
    {
      title: "The Needy (Al-Masakin)",
      description: "Those who cannot meet basic needs",
    },
    {
      title: "Zakat Administrators",
      description: "Those who collect and distribute Zakat",
    },
    {
      title: "New Muslims",
      description: "Those whose hearts are to be reconciled",
    },
    { title: "Those in Bondage", description: "To free slaves and captives" },
    { title: "The Debt-Ridden", description: "Those overwhelmed by debts" },
    {
      title: "In the Way of Allah",
      description: "For causes that serve Islam",
    },
    { title: "Travelers", description: "Stranded travelers in need" },
  ];

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-4 py-2">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">Zakat</h1>
            <p className="text-sm text-primary-foreground/70">
              Purify your wealth
            </p>
          </div>
        </header>

        {/* Floating Donation Button */}
        <button
          onClick={() => navigate("/donation")}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-base shadow-[0_8px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_8px_40px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse-gentle"
        >
          <HandHeart className="w-6 h-6" />
          Donate Now 💛
        </button>

        {/* Intro Card */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <HandHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gradient-gold">
                What is Zakat?
              </h2>
              <p className="text-xs text-primary-foreground/70">
                Third Pillar of Islam
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Zakat is an obligatory form of charity requiring Muslims to give
            2.5% of their qualifying wealth annually to those in need. It
            purifies wealth and helps create a more equitable society.
          </p>
        </div>

        {/* Calculator */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gradient-gold">
              Zakat Calculator
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Cash & Savings ($)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
                className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Gold Value ($)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={gold}
                onChange={(e) => setGold(e.target.value)}
                className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Silver Value ($)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={silver}
                onChange={(e) => setSilver(e.target.value)}
                className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Investments & Stocks ($)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Business Assets ($)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={businessAssets}
                onChange={(e) => setBusinessAssets(e.target.value)}
                className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Debts to Deduct ($)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={debts}
                onChange={(e) => setDebts(e.target.value)}
                className="bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* How the Calculator Works */}
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground mb-1">How it works</p>
              <p>
                1. Add all asset values (savings, gold, silver, investments,
                business).
              </p>
              <p>
                2. Subtract outstanding debts to get your net zakatable wealth.
              </p>
              <p>
                3. If the total meets the Nisab (~$5,000), you owe{" "}
                <strong className="text-foreground">2.5%</strong> as Zakat.
              </p>
            </div>

            <Button
              onClick={calculateZakat}
              className="w-full gradient-accent text-primary-foreground font-semibold py-5 rounded-xl mt-2"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Zakat
            </Button>

            {zakatAmount !== null && (
              <div className="mt-4 p-4 glass rounded-2xl border border-islamic-gold/30 bg-islamic-gold/10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-islamic-gold" />
                  <span className="text-sm text-primary-foreground/70">
                    Your Zakat Due:
                  </span>
                </div>
                <p className="text-3xl font-bold text-gradient-gold">
                  ${zakatAmount.toFixed(2)}
                </p>
                {zakatAmount === 0 && (
                  <p className="text-xs text-primary-foreground/60 mt-2">
                    Your wealth is below the Nisab threshold (~${nisabThreshold}
                    )
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recipients */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <h3 className="text-lg font-bold text-gradient-gold mb-4">
            8 Categories of Zakat Recipients
          </h3>
          <div className="space-y-3">
            {zakatRecipients.map((recipient, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {recipient.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {recipient.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-islamic-gold" />
            <h3 className="font-semibold text-gradient-gold">
              Important Notes
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-foreground">
            <li>• Zakat is due once your wealth reaches the Nisab threshold</li>
            <li>
              • The Nisab is equivalent to 85 grams of gold or 595 grams of
              silver
            </li>
            <li>• Calculate Zakat on a lunar year (354 days) basis</li>
            <li>
              • Consult with local scholars for complex financial situations
            </li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Zakat;
