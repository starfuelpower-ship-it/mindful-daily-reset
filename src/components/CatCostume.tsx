import { memo } from 'react';

export type CostumeType = 
  | 'none'
  | 'scarf'
  | 'wizard_hat'
  | 'raincoat'
  | 'sleep_cap'
  | 'headphones'
  | 'flower_crown'
  | 'bow_tie'
  | 'santa_hat'
  | 'crown';

interface CatCostumeProps {
  costume: CostumeType;
  isDark?: boolean;
}

// SVG costume components that overlay on the cat
export const CatCostume = memo(({ costume, isDark = false }: CatCostumeProps) => {
  if (costume === 'none') return null;

  const renderCostume = () => {
    switch (costume) {
      case 'scarf':
        return (
          <g className="animate-costume-in">
            {/* Cozy knit scarf */}
            <ellipse cx="32" cy="38" rx="13" ry="4" fill="#f87171" />
            <ellipse cx="32" cy="38" rx="11" ry="3" fill="#fca5a5" />
            {/* Scarf tail */}
            <path
              d="M19 38 Q15 42 16 48 Q17 52 14 56"
              stroke="#f87171"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M19 38 Q15 42 16 48 Q17 52 14 56"
              stroke="#fca5a5"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Knit pattern lines */}
            <line x1="22" y1="37" x2="22" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="27" y1="37" x2="27" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="32" y1="37" x2="32" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="37" y1="37" x2="37" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="42" y1="37" x2="42" y2="39" stroke="#dc2626" strokeWidth="1" />
          </g>
        );

      case 'wizard_hat':
        return (
          <g className="animate-costume-in">
            {/* Wizard hat */}
            <path
              d="M20 20 L32 -2 L44 20 Z"
              fill="#7c3aed"
              stroke="#6d28d9"
              strokeWidth="1"
            />
            {/* Hat brim */}
            <ellipse cx="32" cy="20" rx="14" ry="3" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
            {/* Stars on hat */}
            <text x="28" y="10" className="text-[6px] fill-yellow-300">★</text>
            <text x="34" y="14" className="text-[5px] fill-yellow-200">✦</text>
            <text x="25" y="16" className="text-[4px] fill-yellow-100">✧</text>
          </g>
        );

      case 'raincoat':
        return (
          <g className="animate-costume-in">
            {/* Raincoat hood */}
            <path
              d="M18 24 Q18 14 32 12 Q46 14 46 24"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1"
            />
            {/* Hood edge */}
            <ellipse cx="32" cy="24" rx="14" ry="3" fill="#fcd34d" />
            {/* Raincoat body */}
            <path
              d="M18 36 L18 52 L46 52 L46 36"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1"
            />
            {/* Buttons */}
            <circle cx="32" cy="42" r="1.5" fill="#f59e0b" />
            <circle cx="32" cy="48" r="1.5" fill="#f59e0b" />
          </g>
        );

      case 'sleep_cap':
        return (
          <g className="animate-costume-in">
            {/* Sleep cap base */}
            <path
              d="M18 22 Q18 12 32 10 Q46 12 46 22"
              fill="#c4b5fd"
              stroke="#a78bfa"
              strokeWidth="1"
            />
            {/* Cap droopy part */}
            <path
              d="M46 20 Q52 18 54 26 Q52 32 48 28"
              fill="#c4b5fd"
              stroke="#a78bfa"
              strokeWidth="1"
            />
            {/* Pompom */}
            <circle cx="54" cy="26" r="4" fill="#ddd6fe" />
            <circle cx="53" cy="25" r="1" fill="#ede9fe" />
          </g>
        );

      case 'headphones':
        return (
          <g className="animate-costume-in">
            {/* Headband */}
            <path
              d="M18 24 Q18 10 32 8 Q46 10 46 24"
              fill="none"
              stroke="#374151"
              strokeWidth="3"
            />
            {/* Left ear cup */}
            <ellipse cx="16" cy="26" rx="5" ry="6" fill="#374151" />
            <ellipse cx="16" cy="26" rx="3" ry="4" fill="#6b7280" />
            {/* Right ear cup */}
            <ellipse cx="48" cy="26" rx="5" ry="6" fill="#374151" />
            <ellipse cx="48" cy="26" rx="3" ry="4" fill="#6b7280" />
            {/* Cushions */}
            <ellipse cx="16" cy="26" rx="2" ry="3" fill="#9ca3af" />
            <ellipse cx="48" cy="26" rx="2" ry="3" fill="#9ca3af" />
          </g>
        );

      case 'flower_crown':
        return (
          <g className="animate-costume-in">
            {/* Crown base vine */}
            <path
              d="M18 18 Q25 14 32 16 Q39 14 46 18"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
            />
            {/* Flowers */}
            <g transform="translate(20, 14)">
              <circle cx="0" cy="0" r="3" fill="#f9a8d4" />
              <circle cx="0" cy="0" r="1.5" fill="#fcd34d" />
            </g>
            <g transform="translate(32, 12)">
              <circle cx="0" cy="0" r="4" fill="#fca5a5" />
              <circle cx="0" cy="0" r="2" fill="#fcd34d" />
            </g>
            <g transform="translate(44, 14)">
              <circle cx="0" cy="0" r="3" fill="#c4b5fd" />
              <circle cx="0" cy="0" r="1.5" fill="#fcd34d" />
            </g>
            {/* Small leaves */}
            <ellipse cx="26" cy="16" rx="2" ry="1" fill="#86efac" />
            <ellipse cx="38" cy="16" rx="2" ry="1" fill="#86efac" />
          </g>
        );

      case 'bow_tie':
        return (
          <g className="animate-costume-in">
            {/* Bow tie */}
            <path
              d="M24 38 L28 36 L28 40 Z"
              fill="#ec4899"
            />
            <path
              d="M40 38 L36 36 L36 40 Z"
              fill="#ec4899"
            />
            {/* Center knot */}
            <circle cx="32" cy="38" r="2" fill="#be185d" />
            {/* Bow sides */}
            <ellipse cx="26" cy="38" rx="4" ry="3" fill="#f472b6" />
            <ellipse cx="38" cy="38" rx="4" ry="3" fill="#f472b6" />
          </g>
        );

      case 'santa_hat':
        return (
          <g className="animate-costume-in">
            {/* Hat base */}
            <path
              d="M18 22 Q20 8 38 6 Q52 10 50 22"
              fill="#dc2626"
              stroke="#b91c1c"
              strokeWidth="1"
            />
            {/* White trim */}
            <ellipse cx="32" cy="22" rx="15" ry="4" fill="#fafafa" />
            {/* Pompom */}
            <circle cx="50" cy="10" r="5" fill="#fafafa" />
            <circle cx="49" cy="9" r="2" fill="#f5f5f5" />
          </g>
        );

      case 'crown':
        return (
          <g className="animate-costume-in">
            {/* Crown base */}
            <rect x="20" y="16" width="24" height="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" rx="1" />
            {/* Crown points */}
            <polygon points="22,16 26,8 30,16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <polygon points="29,16 32,6 35,16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <polygon points="34,16 38,8 42,16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            {/* Jewels */}
            <circle cx="26" cy="11" r="1.5" fill="#ef4444" />
            <circle cx="32" cy="9" r="2" fill="#3b82f6" />
            <circle cx="38" cy="11" r="1.5" fill="#22c55e" />
            {/* Base jewels */}
            <circle cx="26" cy="20" r="1" fill="#c4b5fd" />
            <circle cx="32" cy="20" r="1.5" fill="#fca5a5" />
            <circle cx="38" cy="20" r="1" fill="#c4b5fd" />
          </g>
        );

      default:
        return null;
    }
  };

  return renderCostume();
});

CatCostume.displayName = 'CatCostume';

// Costume metadata for the picker UI
export const COSTUME_DATA: Record<CostumeType, { name: string; description: string; category: string }> = {
  none: { name: 'No Costume', description: 'Just your adorable cat', category: 'default' },
  scarf: { name: 'Cozy Scarf', description: 'A warm knit scarf for chilly days', category: 'accessory' },
  wizard_hat: { name: 'Wizard Hat', description: 'Magical and mystical', category: 'hat' },
  raincoat: { name: 'Raincoat', description: 'Stay dry in style', category: 'outfit' },
  sleep_cap: { name: 'Sleep Cap', description: 'Perfect for cozy nights', category: 'hat' },
  headphones: { name: 'Headphones', description: 'Listening to lo-fi beats', category: 'accessory' },
  flower_crown: { name: 'Flower Crown', description: 'Spring vibes all year', category: 'hat' },
  bow_tie: { name: 'Bow Tie', description: 'Looking fancy!', category: 'accessory' },
  santa_hat: { name: 'Santa Hat', description: 'Ho ho ho! Festive spirit', category: 'hat' },
  crown: { name: 'Royal Crown', description: 'Your cat is royalty', category: 'hat' },
};

export default CatCostume;
