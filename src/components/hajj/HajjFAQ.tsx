import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is the best time to book Hajj?',
    answer: 'We recommend booking 6-12 months in advance for the best prices and availability. Popular packages sell out quickly, especially for hotels close to the Haram. Early booking also allows more time for visa processing and preparation.',
  },
  {
    question: 'How much does Hajj typically cost?',
    answer: 'Hajj costs vary significantly based on your departure location, accommodation tier, and package inclusions. On average: Economy packages range from $5,000-$7,000, Standard $7,000-$10,000, Premium $10,000-$15,000, and VIP/Luxury packages can exceed $20,000 per person.',
  },
  {
    question: 'Do I need a visa for Hajj?',
    answer: 'Yes, all non-Saudi nationals need a Hajj visa. This must be obtained through an authorized Hajj operator in your country. The visa process typically requires: valid passport (6+ months validity), completed application, passport photos, vaccination certificates, and confirmed Hajj package booking.',
  },
  {
    question: 'What vaccinations are required?',
    answer: 'Meningitis (ACWY) vaccination is mandatory for all pilgrims. COVID-19 vaccination requirements vary. Seasonal flu vaccine is recommended. Polio vaccine may be required depending on your country of origin. Check the Saudi Ministry of Health for current requirements.',
  },
  {
    question: 'Can women perform Hajj alone?',
    answer: 'Women under 45 typically need a Mahram (male guardian). However, recent regulations allow women 45+ to travel in organized groups without a Mahram. Some countries have specific arrangements for women traveling in approved women-only groups.',
  },
  {
    question: 'What should I pack for Hajj?',
    answer: 'Essential items include: Ihram garments (2 sets for men), comfortable walking sandals, unscented toiletries, medications, sunscreen, umbrella, money belt, copies of documents, small Quran, and light, modest clothing. Avoid packing heavy items as you\'ll be walking extensively.',
  },
  {
    question: 'How physically demanding is Hajj?',
    answer: 'Hajj requires significant physical stamina. Expect to walk 5-15 km daily over several days, often in hot weather (35-45°C). Key physically demanding activities include Tawaf, Sa\'i, standing at Arafah, and stoning the Jamarat. Start physical preparation months in advance.',
  },
  {
    question: 'What happens if I make a mistake during Hajj?',
    answer: 'Minor mistakes can often be compensated with additional prayers or charity. Major mistakes (like missing essential pillars) may require fidyah (compensation) or repeating certain rituals. Having a knowledgeable guide is invaluable. Many packages include scholar guidance for real-time assistance.',
  },
  {
    question: 'Should I combine Hajj with Umrah?',
    answer: 'Many pilgrims perform Umrah before Hajj (Hajj al-Tamattu). This is recommended as it\'s considered more rewarding. Combined packages often offer better value and you get to experience both pilgrimages in one trip. You\'ll need to exit and re-enter Ihram between Umrah and Hajj.',
  },
  {
    question: 'How do I choose a reliable Hajj operator?',
    answer: 'Look for: Government/Nusuk certification, IATA accreditation, years of experience (10+ preferred), verified reviews, transparent pricing, 24/7 support availability, clear refund policies, and included scholar guidance. Avoid unusually cheap packages that may compromise quality or safety.',
  },
];

const HajjFAQ: React.FC = () => {
  return (
    <div className="glass rounded-3xl p-5 border border-border shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gradient-gold">Common Questions</h2>
          <p className="text-xs text-foreground/70">Everything you need to know</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border border-border rounded-xl px-4 data-[state=open]:bg-primary/5"
          >
            <AccordionTrigger className="text-sm text-left text-foreground hover:no-underline py-3">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-xs text-foreground/70 pb-4 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default HajjFAQ;
