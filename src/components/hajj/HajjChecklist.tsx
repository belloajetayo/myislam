import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ClipboardList, Download, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
}

const checklistItems: ChecklistItem[] = [
  // 6+ Months Before
  { id: '1', category: '6+ Months Before', task: 'Research and choose Hajj package/operator', priority: 'high', timeframe: '6+ months' },
  { id: '2', category: '6+ Months Before', task: 'Ensure passport valid for 6+ months after Hajj', priority: 'high', timeframe: '6+ months' },
  { id: '3', category: '6+ Months Before', task: 'Book Hajj package and pay deposit', priority: 'high', timeframe: '6+ months' },
  { id: '4', category: '6+ Months Before', task: 'Start physical fitness preparation', priority: 'medium', timeframe: '6+ months' },
  { id: '5', category: '6+ Months Before', task: 'Begin saving for remaining costs', priority: 'high', timeframe: '6+ months' },
  
  // 3-6 Months Before
  { id: '6', category: '3-6 Months Before', task: 'Complete visa application documents', priority: 'high', timeframe: '3-6 months' },
  { id: '7', category: '3-6 Months Before', task: 'Get required vaccinations (Meningitis, etc.)', priority: 'high', timeframe: '3-6 months' },
  { id: '8', category: '3-6 Months Before', task: 'Study Hajj rituals and duas', priority: 'medium', timeframe: '3-6 months' },
  { id: '9', category: '3-6 Months Before', task: 'Arrange time off work/responsibilities', priority: 'high', timeframe: '3-6 months' },
  { id: '10', category: '3-6 Months Before', task: 'Complete full package payment', priority: 'high', timeframe: '3-6 months' },
  
  // 1-3 Months Before
  { id: '11', category: '1-3 Months Before', task: 'Purchase Ihram garments (2 sets)', priority: 'medium', timeframe: '1-3 months' },
  { id: '12', category: '1-3 Months Before', task: 'Buy comfortable walking sandals', priority: 'medium', timeframe: '1-3 months' },
  { id: '13', category: '1-3 Months Before', task: 'Get travel insurance', priority: 'high', timeframe: '1-3 months' },
  { id: '14', category: '1-3 Months Before', task: 'Prepare medications (3-month supply)', priority: 'high', timeframe: '1-3 months' },
  { id: '15', category: '1-3 Months Before', task: 'Attend Hajj preparation classes', priority: 'medium', timeframe: '1-3 months' },
  { id: '16', category: '1-3 Months Before', task: 'Arrange finances for trip', priority: 'high', timeframe: '1-3 months' },
  
  // 1-2 Weeks Before
  { id: '17', category: '1-2 Weeks Before', task: 'Pack all essentials (see packing list)', priority: 'high', timeframe: '1-2 weeks' },
  { id: '18', category: '1-2 Weeks Before', task: 'Make copies of all documents', priority: 'high', timeframe: '1-2 weeks' },
  { id: '19', category: '1-2 Weeks Before', task: 'Download offline maps of Makkah/Madinah', priority: 'low', timeframe: '1-2 weeks' },
  { id: '20', category: '1-2 Weeks Before', task: 'Settle debts and seek forgiveness', priority: 'high', timeframe: '1-2 weeks' },
  { id: '21', category: '1-2 Weeks Before', task: 'Write will (recommended)', priority: 'medium', timeframe: '1-2 weeks' },
  { id: '22', category: '1-2 Weeks Before', task: 'Confirm all bookings and itinerary', priority: 'high', timeframe: '1-2 weeks' },
  
  // Day Before/Of
  { id: '23', category: 'Day Before/Of', task: 'Trim nails and remove unwanted hair', priority: 'high', timeframe: 'Day before' },
  { id: '24', category: 'Day Before/Of', task: 'Perform ghusl before Ihram', priority: 'high', timeframe: 'Day of' },
  { id: '25', category: 'Day Before/Of', task: 'Make sincere intention (niyyah)', priority: 'high', timeframe: 'Day of' },
];

const HajjChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hajj-checklist');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('hajj-checklist', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const resetChecklist = () => {
    setCheckedItems([]);
    localStorage.removeItem('hajj-checklist');
  };

  const progress = (checkedItems.length / checklistItems.length) * 100;

  const groupedItems = checklistItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const priorityColors = {
    high: 'text-rose-500',
    medium: 'text-amber-500',
    low: 'text-blue-500',
  };

  return (
    <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gradient-gold">Preparation Checklist</h2>
            <p className="text-xs text-primary-foreground/70">{checkedItems.length}/{checklistItems.length} completed</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={resetChecklist}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-primary-foreground/60 mt-1 text-right">{Math.round(progress)}% ready</p>
      </div>

      {/* Checklist */}
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="space-y-1">
              {items.map((item) => {
                const isChecked = checkedItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                      isChecked ? 'bg-emerald-500/10' : 'hover:bg-primary/5'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    {isChecked ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className={`w-5 h-5 ${priorityColors[item.priority]} flex-shrink-0`} />
                    )}
                    <span className={`text-sm ${isChecked ? 'text-primary-foreground/50 line-through' : 'text-primary-foreground'}`}>
                      {item.task}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HajjChecklist;
