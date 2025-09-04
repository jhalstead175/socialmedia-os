
import React from 'react';
import { usePromoStore } from './PromoStore';
import { Sparkles, Tag, FileText } from 'lucide-react';

const WhatsNewChips = () => {
    const promo = usePromoStore();

    const chips = [
        { text: 'New: AI Resume + Interview Coach', icon: <Sparkles className="w-4 h-4 text-sky-400" /> },
        { text: 'Promo: ' + (promo.code || 'SPRING30'), icon: <Tag className="w-4 h-4 text-green-400" /> },
        { text: 'Updated: Executive Templates', icon: <FileText className="w-4 h-4 text-purple-400" /> },
    ];

    return (
        <div className="relative py-8 overflow-hidden">
            <div className="flex justify-center gap-4">
                {chips.map((chip, index) => (
                    <div key={index} className="badge badge-new fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        {chip.icon}
                        <span>{chip.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhatsNewChips;
