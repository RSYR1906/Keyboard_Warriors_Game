"use client";

import { motion } from "framer-motion";
import { memo } from "react";

/**
 * PlayerCharacter — Armored Knight with Greatsword (SVG).
 *
 * @param {{ isAttacking: boolean, isHit: boolean }} props
 */
export default memo(function PlayerCharacter({ isAttacking, isHit }) {
  return (
    <svg viewBox="0 0 140 200" width="140" height="200" className="drop-shadow-2xl">
      {/* Cape — flowing behind */}
      <motion.path
        d="M45 72 L28 160 Q70 175 112 160 L95 72"
        fill="url(#playerCapeGrad)"
        animate={isAttacking ? { d: "M45 72 L18 155 Q70 180 122 155 L95 72" } : {}}
        transition={{ duration: 0.3 }}
      />
      {/* Legs — armored greaves */}
      <rect x="50" y="120" width="14" height="42" rx="5" fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" />
      <rect x="76" y="120" width="14" height="42" rx="5" fill="#1E3A5F" stroke="#38BDF8" strokeWidth="0.5" />
      {/* Knee guards */}
      <ellipse cx="57" cy="130" rx="8" ry="5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="0.5" />
      <ellipse cx="83" cy="130" rx="8" ry="5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="0.5" />
      {/* Boots — pointed steel */}
      <path d="M46 158 L50 158 L50 168 L42 168 Z" fill="#0F172A" stroke="#334155" strokeWidth="0.5" />
      <path d="M76 158 L80 158 L80 168 L72 168 Z" fill="#0F172A" stroke="#334155" strokeWidth="0.5" />
      <path d="M62 158 L66 158 L66 168 L70 168 L66 172 L58 172 L54 168 L58 168 Z" fill="#0F172A" />
      <path d="M88 158 L92 158 L92 168 L96 168 L92 172 L84 172 L80 168 L84 168 Z" fill="#0F172A" />
      {/* Body — layered plate armor */}
      <rect x="46" y="68" width="48" height="55" rx="5" fill="#1E3A5F" stroke="#38BDF8" strokeWidth="1.5" />
      {/* Chest plate detail */}
      <path d="M56 72 L70 68 L84 72 L80 95 L70 100 L60 95 Z" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="0.5" />
      {/* Gem on chest */}
      <circle cx="70" cy="82" r="4" fill="#0EA5E9" />
      <circle cx="70" cy="82" r="2" fill="#BAE6FD" />
      {/* Belt with buckle */}
      <rect x="46" y="115" width="48" height="7" rx="2" fill="#854D0E" />
      <rect x="64" y="113" width="12" height="11" rx="2" fill="#CA8A04" />
      <rect x="67" y="115" width="6" height="7" rx="1" fill="#A16207" />
      {/* Shoulder armor — large pauldrons */}
      <path d="M35 60 Q46 48 55 60 L55 72 Q46 78 35 72 Z" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1" />
      <path d="M85 60 Q94 48 105 60 L105 72 Q94 78 85 72 Z" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1" />
      {/* Rivets on shoulders */}
      <circle cx="45" cy="62" r="1.5" fill="#60A5FA" />
      <circle cx="95" cy="62" r="1.5" fill="#60A5FA" />
      {/* Shield arm */}
      <rect x="30" y="70" width="14" height="40" rx="6" fill="#D4A574" />
      {/* Large kite shield */}
      <path d="M22 68 L40 62 L40 100 L31 108 L22 100 Z" fill="#1E3A5F" stroke="#38BDF8" strokeWidth="1.5" />
      <path d="M28 72 L36 68 L36 95 L32 100 L28 95 Z" fill="#0C4A6E" />
      <path d="M32 78 L32 92" stroke="#38BDF8" strokeWidth="1.5" />
      <path d="M28 85 L36 85" stroke="#38BDF8" strokeWidth="1.5" />
      {/* Sword arm */}
      <motion.g animate={isAttacking ? { rotate: -50, x: 20, y: -15 } : { rotate: 0, x: 0, y: 0 }} transition={{ duration: 0.25 }}>
        <rect x="96" y="70" width="14" height="40" rx="6" fill="#D4A574" />
        {/* Greatsword — long blade */}
        <rect x="100" y="18" width="6" height="55" rx="1" fill="url(#swordBlade)" />
        {/* Crossguard */}
        <rect x="93" y="68" width="20" height="5" rx="2" fill="#854D0E" />
        <circle cx="93" cy="70" r="3" fill="#CA8A04" />
        <circle cx="113" cy="70" r="3" fill="#CA8A04" />
        {/* Pommel */}
        <circle cx="103" cy="78" r="3" fill="#CA8A04" />
        {/* Blade tip */}
        <polygon points="103,6 98,18 108,18" fill="#E2E8F0" />
      </motion.g>
      {/* Head — visored helmet */}
      <motion.g animate={isHit ? { x: [0, -4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
        {/* Helmet base */}
        <path d="M50 32 Q70 12 90 32 L90 55 Q70 60 50 55 Z" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1" />
        {/* Visor */}
        <path d="M55 40 L85 40 L82 52 Q70 56 58 52 Z" fill="#0F172A" />
        {/* Eye slits — glowing */}
        <motion.rect x="58" y="44" width="10" height="3" rx="1" fill="#38BDF8"
          animate={isHit ? { fill: "#EF4444" } : { fill: "#38BDF8" }} />
        <motion.rect x="72" y="44" width="10" height="3" rx="1" fill="#38BDF8"
          animate={isHit ? { fill: "#EF4444" } : { fill: "#38BDF8" }} />
        {/* Crest — tall plume */}
        <path d="M70 12 L70 -2" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        <path d="M64 2 L70 -6 L76 2" fill="#0EA5E9" />
        <path d="M66 6 L70 0 L74 6" fill="#38BDF8" opacity="0.6" />
        {/* Helmet ridge */}
        <path d="M55 32 Q70 26 85 32" stroke="#60A5FA" strokeWidth="1" fill="none" />
      </motion.g>
      {/* Hit flash */}
      {isHit && (
        <motion.rect x="25" y="0" width="90" height="175" rx="12" fill="red" opacity="0.25"
          animate={{ opacity: [0.35, 0, 0.25, 0] }} transition={{ duration: 0.4 }} />
      )}
      <defs>
        <linearGradient id="playerCapeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="swordBlade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
    </svg>
  );
});
