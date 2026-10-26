import React from 'react';

export const AshokaEmblem: React.FC<{ className?: string }> = ({ className = "h-14 w-auto" }) => {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor">
      {/* Three Lions stylized representation */}
      <path d="M50 8 C44 8 40 12 40 17 C40 22 43 25 45 28 C41 29 37 32 36 36 C35 41 38 46 41 49 C39 52 38 56 38 60 L62 60 C62 56 61 52 59 49 C62 46 65 41 64 36 C63 32 59 29 55 28 C57 25 60 22 60 17 C60 12 56 8 50 8 Z" fill="#996515" />
      <path d="M26 22 C22 22 18 26 19 31 C20 36 24 38 26 41 C22 43 19 46 20 51 C21 56 25 59 28 61 L36 61 C35 56 35 51 37 47 C34 44 32 39 33 35 C34 30 38 27 40 26 C37 23 33 22 26 22 Z" fill="#b8860b" />
      <path d="M74 22 C81 22 85 26 84 31 C83 36 79 38 77 41 C81 43 84 46 83 51 C82 56 78 59 75 61 L67 61 C68 56 68 51 66 47 C69 44 71 39 70 35 C69 30 65 27 63 26 C66 23 70 22 74 22 Z" fill="#b8860b" />
      {/* Abacus platform */}
      <rect x="15" y="62" width="70" height="7" rx="2" fill="#805500" />
      {/* Ashoka Chakra in center */}
      <circle cx="50" cy="77" r="7" fill="none" stroke="#002147" strokeWidth="1.5" />
      <circle cx="50" cy="77" r="2" fill="#002147" />
      {/* Galloping Horse and Bull on sides */}
      <path d="M25 74 Q28 72 32 76 Q30 79 26 78 Z" fill="#805500" />
      <path d="M75 74 Q72 72 68 76 Q70 79 74 78 Z" fill="#805500" />
      {/* Lower base */}
      <rect x="10" y="86" width="80" height="6" rx="2" fill="#996515" />
      {/* Text Satyameva Jayate */}
      <text x="50" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#664400" fontFamily="serif">सत्यमेव जयते</text>
    </svg>
  );
};

export const AicteLogo: React.FC<{ className?: string }> = ({ className = "h-14 w-auto" }) => {
  return (
    <div className={`flex items-center justify-center bg-white rounded-full border-2 border-orange-500 shadow-sm p-1 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#002147" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#FF9933" strokeWidth="2.5" />
        {/* Stylized Sun/Cogwheel & Book */}
        <polygon points="50,20 54,32 67,32 56,40 60,52 50,44 40,52 44,40 33,32 46,32" fill="#FFCC00" />
        {/* Open Book */}
        <path d="M26 68 Q50 62 50 78 Q50 62 74 68 L74 62 Q50 56 50 72 Q50 56 26 62 Z" fill="#FFFFFF" />
        {/* Base Lamp Flame */}
        <path d="M50 48 Q54 40 50 34 Q46 40 50 48 Z" fill="#E65100" />
        <circle cx="50" cy="84" r="3" fill="#138808" />
      </svg>
    </div>
  );
};
