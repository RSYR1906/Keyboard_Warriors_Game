"use client";

import { motion } from "framer-motion";
import { memo } from "react";

// ── Story mode enemy configs with body types ─────────────────
export const STORY_ENEMIES = [
  { name: "Wild Wolf", color: "#6B7280", accent: "#9CA3AF", body: "beast", weapon: "claws" },
  { name: "Forest Ghoul", color: "#065F46", accent: "#34D399", body: "hunched", weapon: "scythe" },
  { name: "Cave Bat", color: "#581C87", accent: "#A78BFA", body: "winged", weapon: "fangs" },
  { name: "Stone Sentinel", color: "#78716C", accent: "#D6D3D1", body: "golem", weapon: "fists" },
  { name: "Dark Sorcerer", color: "#4C1D95", accent: "#8B5CF6", body: "robed", weapon: "staff" },
  { name: "Frost Giant", color: "#164E63", accent: "#67E8F9", body: "giant", weapon: "club" },
  { name: "Minotaur", color: "#7C2D12", accent: "#FB923C", body: "bulky", weapon: "axe" },
  { name: "Fire Drake", color: "#991B1B", accent: "#F87171", body: "dragon", weapon: "breath" },
  { name: "Shadow Self", color: "#1E1B4B", accent: "#818CF8", body: "mirror", weapon: "sword" },
  { name: "The Tyrant", color: "#713F12", accent: "#FACC15", body: "king", weapon: "greatsword" },
];

export function getEnemyConfig(mode, stage) {
  if (mode === "story") {
    return STORY_ENEMIES[Math.min((stage || 1) - 1, STORY_ENEMIES.length - 1)];
  }
  if (mode === "endless") {
    return { name: "Training Dummy", color: "#78716C", accent: "#A8A29E", body: "dummy", weapon: "none" };
  }
  return { name: "CPU Bot", color: "#991B1B", accent: "#F87171", body: "knight", weapon: "sword" };
}

// ── Shared hit-flash overlay used by every body type ─────────
function HitFlash({ x, y, width, height, rx = 12, isHit }) {
  if (!isHit) return null;
  return (
    <motion.rect x={x} y={y} width={width} height={height} rx={rx} fill="red" opacity="0.25"
      animate={{ opacity: [0.35, 0, 0.25, 0] }} transition={{ duration: 0.4 }} />
  );
}

// ── Body-type renderers ──────────────────────────────────────
// Each receives { isAttacking, isHit, color, accent }.

function BeastBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" className="drop-shadow-2xl">
      <motion.ellipse cx="80" cy="70" rx="45" ry="22" fill={color} stroke={accent} strokeWidth="1"
        animate={isAttacking ? { rx: 50, cy: 65 } : {}} transition={{ duration: 0.25 }} />
      <path d="M50 55 L55 48 L60 55 L65 50 L70 55" stroke={accent} strokeWidth="1" fill="none" opacity="0.4" />
      <motion.g animate={isAttacking ? { x: -20 } : { x: 0 }} transition={{ duration: 0.25 }}>
        <rect x="35" y="82" width="10" height="30" rx="4" fill={color} />
        <rect x="50" y="82" width="10" height="28" rx="4" fill={color} />
        <path d="M35 112 L30 118 M40 112 L37 118 M45 112 L42 118" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M50 110 L45 116 M55 110 L52 116 M60 110 L57 116" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      <rect x="100" y="82" width="10" height="26" rx="4" fill={color} />
      <rect x="115" y="82" width="10" height="28" rx="4" fill={color} />
      <motion.path d="M125 65 Q140 50 145 60 Q148 70 140 68"
        stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"
        animate={isAttacking ? { d: "M125 65 Q145 40 150 50 Q155 60 145 60" } : {}}
        transition={{ duration: 0.3 }} />
      <motion.g animate={isHit ? { x: [0, 5, -5, 3, 0] } : {}} transition={{ duration: 0.3 }}>
        <path d="M20 50 Q15 30 35 25 L50 35 Q55 55 40 65 Z" fill={color} stroke={accent} strokeWidth="1" />
        <polygon points="25,30 18,12 32,25" fill={color} stroke={accent} strokeWidth="0.5" />
        <polygon points="35,27 30,10 42,22" fill={color} stroke={accent} strokeWidth="0.5" />
        <motion.ellipse cx="30" cy="40" rx="4" ry="3" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent }} />
        <ellipse cx="30" cy="40" rx="2" ry="2" fill="#0F172A" />
        <path d="M18 48 Q15 42 22 38" stroke={accent} strokeWidth="1" fill="none" />
        <polygon points="20,50 17,56 23,50" fill="white" />
        <polygon points="28,52 25,58 31,52" fill="white" />
      </motion.g>
      <HitFlash x={10} y={15} width={145} height={110} rx={15} isHit={isHit} />
    </svg>
  );
}

function HunchedBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 140 200" width="140" height="200" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <motion.path d="M50 70 L35 170 Q50 180 70 175 Q90 180 105 170 L90 70"
        fill={color} opacity="0.85"
        animate={isAttacking ? { d: "M50 70 L30 165 Q50 185 70 175 Q90 185 110 165 L90 70" } : {}}
        transition={{ duration: 0.3 }} />
      <path d="M40 165 L35 175 L45 170 L42 180 L50 172" stroke={color} strokeWidth="2" fill={color} />
      <path d="M95 165 L100 175 L90 170 L98 180 L88 172" stroke={color} strokeWidth="2" fill={color} />
      <path d="M55 68 Q48 55 52 40 Q58 30 70 28 Q82 30 86 42 Q88 60 85 68" fill={color} stroke={accent} strokeWidth="1" />
      <path d="M58 60 Q70 55 82 60" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M60 66 Q70 62 80 66" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.3" />
      <motion.g animate={isAttacking ? { rotate: 40, x: -10 } : { rotate: 0, x: 0, y: 0 }}
        transition={{ duration: 0.25 }} style={{ transformOrigin: "35px 70px" }}>
        <rect x="28" y="68" width="10" height="35" rx="4" fill="#8B9D83" />
        <rect x="30" y="15" width="4" height="58" rx="1" fill="#78716C" />
        <path d="M34 15 Q55 8 50 25 L38 22 Z" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="0.5" />
      </motion.g>
      <rect x="92" y="68" width="10" height="30" rx="4" fill="#8B9D83" />
      <path d="M96 98 L92 106 M98 98 L98 107 M100 98 L103 105" stroke="#8B9D83" strokeWidth="1.5" strokeLinecap="round" />
      <motion.g animate={isHit ? { x: [0, 4, -4, 2, 0] } : {}} transition={{ duration: 0.3 }}>
        <circle cx="70" cy="22" r="18" fill={color} stroke={accent} strokeWidth="1" />
        <ellipse cx="63" cy="20" rx="5" ry="6" fill="#0F172A" />
        <ellipse cx="77" cy="20" rx="5" ry="6" fill="#0F172A" />
        <motion.circle cx="63" cy="20" r="2" fill={accent}
          animate={isHit ? { fill: "#FFF", r: 3 } : { fill: accent, opacity: [0.6, 1, 0.6] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <motion.circle cx="77" cy="20" r="2" fill={accent}
          animate={isHit ? { fill: "#FFF", r: 3 } : { fill: accent, opacity: [0.6, 1, 0.6] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <path d="M60 30 Q70 38 80 30" stroke={accent} strokeWidth="1" fill="none" />
      </motion.g>
      <rect x="55" y="140" width="8" height="30" rx="3" fill="#5C6B55" />
      <rect x="77" y="140" width="8" height="32" rx="3" fill="#5C6B55" />
      <HitFlash x={25} y={0} width={90} height={185} isHit={isHit} />
    </svg>
  );
}

function WingedBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 180 160" width="180" height="160" className="drop-shadow-2xl">
      <motion.path d="M10 40 Q20 15 50 25 L60 55 Q35 70 10 60 Z"
        fill={color} opacity="0.7" stroke={accent} strokeWidth="0.5"
        animate={isAttacking ? { d: "M5 30 Q15 5 50 20 L60 50 Q30 65 5 55 Z" } : {}}
        transition={{ duration: 0.3 }} />
      <motion.path d="M170 40 Q160 15 130 25 L120 55 Q145 70 170 60 Z"
        fill={color} opacity="0.7" stroke={accent} strokeWidth="0.5"
        animate={isAttacking ? { d: "M175 30 Q165 5 130 20 L120 50 Q150 65 175 55 Z" } : {}}
        transition={{ duration: 0.3 }} />
      <line x1="60" y1="55" x2="20" y2="25" stroke={accent} strokeWidth="1" opacity="0.4" />
      <line x1="60" y1="55" x2="15" y2="45" stroke={accent} strokeWidth="1" opacity="0.4" />
      <line x1="120" y1="55" x2="160" y2="25" stroke={accent} strokeWidth="1" opacity="0.4" />
      <line x1="120" y1="55" x2="165" y2="45" stroke={accent} strokeWidth="1" opacity="0.4" />
      <ellipse cx="90" cy="70" rx="28" ry="25" fill={color} stroke={accent} strokeWidth="1" />
      <ellipse cx="90" cy="72" rx="18" ry="15" fill={color} opacity="0.6" />
      <path d="M75 92 L70 105 L75 100 L78 108 L82 100" stroke={color} strokeWidth="2" fill="none" />
      <path d="M105 92 L100 105 L105 100 L108 108 L112 100" stroke={color} strokeWidth="2" fill="none" />
      <motion.g animate={isHit ? { y: [0, 3, -3, 2, 0] } : {}} transition={{ duration: 0.3 }}>
        <ellipse cx="90" cy="40" rx="18" ry="16" fill={color} stroke={accent} strokeWidth="1" />
        <polygon points="72,35 60,8 78,28" fill={color} stroke={accent} strokeWidth="0.5" />
        <polygon points="108,35 120,8 102,28" fill={color} stroke={accent} strokeWidth="0.5" />
        <polygon points="73,33 65,14 77,28" fill={accent} opacity="0.2" />
        <polygon points="107,33 115,14 103,28" fill={accent} opacity="0.2" />
        <motion.ellipse cx="83" cy="38" rx="5" ry="6" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <motion.ellipse cx="97" cy="38" rx="5" ry="6" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <ellipse cx="84" cy="37" rx="2" ry="3" fill="#0F172A" />
        <ellipse cx="98" cy="37" rx="2" ry="3" fill="#0F172A" />
        <polygon points="85,50 82,58 88,50" fill="white" />
        <polygon points="95,50 92,58 98,50" fill="white" />
        <ellipse cx="90" cy="46" rx="3" ry="2" fill="#0F172A" />
      </motion.g>
      <HitFlash x={5} y={5} width={170} height={110} rx={15} isHit={isHit} />
    </svg>
  );
}

function GolemBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 160 200" width="160" height="200" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <rect x="40" y="65" width="80" height="70" rx="8" fill={color} stroke={accent} strokeWidth="2" />
      <path d="M60 70 L65 90 L55 100" stroke={accent} strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M100 75 L95 95 L105 110" stroke={accent} strokeWidth="1" fill="none" opacity="0.4" />
      <circle cx="80" cy="98" r="10" fill={accent} opacity="0.3" />
      <circle cx="80" cy="98" r="5" fill={accent} opacity="0.6" />
      <motion.g animate={isAttacking ? { rotate: -30, y: -10 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }} style={{ transformOrigin: "30px 80px" }}>
        <rect x="15" y="70" width="25" height="50" rx="8" fill={color} stroke={accent} strokeWidth="1" />
        <circle cx="27" cy="125" r="15" fill={color} stroke={accent} strokeWidth="1.5" />
        <path d="M20 120 L22 130 M27 118 L27 130 M34 120 L32 130" stroke={accent} strokeWidth="1" opacity="0.3" />
      </motion.g>
      <rect x="120" y="70" width="25" height="50" rx="8" fill={color} stroke={accent} strokeWidth="1" />
      <circle cx="133" cy="125" r="15" fill={color} stroke={accent} strokeWidth="1.5" />
      <motion.g animate={isHit ? { x: [0, 4, -4, 2, 0] } : {}} transition={{ duration: 0.3 }}>
        <rect x="58" y="40" width="44" height="30" rx="6" fill={color} stroke={accent} strokeWidth="1.5" />
        <motion.rect x="64" y="50" width="12" height="6" rx="2" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.7, 1, 0.7] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity }} />
        <motion.rect x="84" y="50" width="12" height="6" rx="2" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.7, 1, 0.7] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity }} />
        <path d="M76 44 L80 40 L84 44 L80 48 Z" fill={accent} opacity="0.5" />
      </motion.g>
      <rect x="48" y="135" width="22" height="40" rx="6" fill={color} stroke={accent} strokeWidth="1" />
      <rect x="90" y="135" width="22" height="40" rx="6" fill={color} stroke={accent} strokeWidth="1" />
      <rect x="44" y="170" width="30" height="12" rx="4" fill={color} stroke={accent} strokeWidth="0.5" />
      <rect x="86" y="170" width="30" height="12" rx="4" fill={color} stroke={accent} strokeWidth="0.5" />
      <HitFlash x={10} y={35} width={145} height={150} isHit={isHit} />
    </svg>
  );
}

function RobedBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 140 200" width="140" height="200" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <motion.path d="M40 65 L25 180 Q70 190 115 180 L100 65"
        fill={color} stroke={accent} strokeWidth="1"
        animate={isAttacking ? { d: "M40 65 L20 175 Q70 195 120 175 L100 65" } : {}}
        transition={{ duration: 0.3 }} />
      <path d="M55 80 L55 170 Q70 175 85 170 L85 80" fill="#0F0F2E" opacity="0.5" />
      <path d="M45 100 Q70 95 95 100 Q70 105 45 100" fill={accent} opacity="0.4" />
      <path d="M48 65 Q70 55 92 65 Q80 72 70 70 Q60 72 48 65" fill={color} stroke={accent} strokeWidth="0.5" />
      <motion.g animate={isAttacking ? { rotate: -25, x: 5, y: -8 } : { rotate: 0, x: 0, y: 0 }}
        transition={{ duration: 0.3 }}>
        <rect x="95" y="65" width="10" height="30" rx="4" fill="#C9B8A8" />
        <rect x="98" y="10" width="4" height="62" rx="2" fill="#5B4A3F" />
        <circle cx="100" cy="10" r="10" fill={accent} opacity="0.3" />
        <motion.circle cx="100" cy="10" r="6" fill={accent}
          animate={{ opacity: [0.5, 1, 0.5], r: [5, 7, 5] }}
          transition={{ duration: 2, repeat: Infinity }} />
        <circle cx="100" cy="10" r="3" fill="white" opacity="0.6" />
        <motion.ellipse cx="100" cy="10" rx="14" ry="5" fill="none" stroke={accent} strokeWidth="0.5"
          animate={{ ry: [4, 6, 4], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }} />
      </motion.g>
      <rect x="35" y="68" width="10" height="28" rx="4" fill="#C9B8A8" />
      {isAttacking && (
        <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5 }}>
          <circle cx="30" cy="90" r="3" fill={accent} opacity="0.7" />
          <circle cx="25" cy="85" r="2" fill={accent} opacity="0.5" />
          <circle cx="35" cy="82" r="2" fill={accent} opacity="0.6" />
        </motion.g>
      )}
      <motion.g animate={isHit ? { x: [0, 3, -3, 2, 0] } : {}} transition={{ duration: 0.3 }}>
        <path d="M48 25 Q70 5 92 25 L95 55 Q70 62 45 55 Z" fill={color} stroke={accent} strokeWidth="1" />
        <ellipse cx="70" cy="40" rx="15" ry="12" fill="#0F0F2E" />
        <motion.circle cx="64" cy="40" r="3" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.6, 1, 0.6] }}
          transition={isHit ? { duration: 0.2 } : { duration: 1.5, repeat: Infinity }} />
        <motion.circle cx="76" cy="40" r="3" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.6, 1, 0.6] }}
          transition={isHit ? { duration: 0.2 } : { duration: 1.5, repeat: Infinity }} />
      </motion.g>
      <HitFlash x={20} y={0} width={100} height={190} isHit={isHit} />
    </svg>
  );
}

function GiantBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 160 220" width="160" height="220" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <path d="M55 125 L45 160 Q80 170 115 160 L105 125" fill="#44403C" />
      <path d="M50 155 L52 162 L55 155 L58 163" stroke="#57534E" strokeWidth="1" fill="none" />
      <rect x="45" y="60" width="70" height="70" rx="10" fill={color} stroke={accent} strokeWidth="1.5" />
      <ellipse cx="80" cy="105" rx="25" ry="15" fill={color} opacity="0.8" />
      <path d="M60 75 L75 90" stroke={accent} strokeWidth="1" opacity="0.3" />
      <path d="M90 70 L80 85" stroke={accent} strokeWidth="1" opacity="0.3" />
      <motion.g animate={isAttacking ? { rotate: -35, y: -10 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }} style={{ transformOrigin: "30px 75px" }}>
        <rect x="15" y="65" width="28" height="55" rx="10" fill={color} stroke={accent} strokeWidth="0.5" />
        <rect x="22" y="15" width="10" height="55" rx="3" fill="#78716C" />
        <rect x="14" y="5" width="26" height="18" rx="5" fill={accent} opacity="0.6" />
        <rect x="18" y="8" width="18" height="12" rx="3" fill={accent} opacity="0.3" />
      </motion.g>
      <rect x="117" y="65" width="28" height="55" rx="10" fill={color} stroke={accent} strokeWidth="0.5" />
      <motion.g animate={isHit ? { x: [0, 5, -5, 3, 0] } : {}} transition={{ duration: 0.3 }}>
        <ellipse cx="80" cy="48" rx="22" ry="20" fill={color} stroke={accent} strokeWidth="1" />
        <path d="M62 42 Q72 36 80 38 Q88 36 98 42" stroke={accent} strokeWidth="2" fill="none" />
        <motion.circle cx="72" cy="46" r="3" fill={accent} animate={isHit ? { fill: "#FFF" } : { fill: accent }} />
        <motion.circle cx="88" cy="46" r="3" fill={accent} animate={isHit ? { fill: "#FFF" } : { fill: accent }} />
        <circle cx="72" cy="46" r="1.5" fill="#0F172A" />
        <circle cx="88" cy="46" r="1.5" fill="#0F172A" />
        <path d="M72 55 Q80 60 88 55" stroke={accent} strokeWidth="1" fill="none" />
        <polygon points="74,55 70,62 78,55" fill="#E2E8F0" />
        <polygon points="86,55 90,62 82,55" fill="#E2E8F0" />
      </motion.g>
      <rect x="52" y="155" width="20" height="45" rx="8" fill={color} />
      <rect x="88" y="155" width="20" height="45" rx="8" fill={color} />
      <rect x="48" y="195" width="28" height="12" rx="4" fill="#44403C" />
      <rect x="84" y="195" width="28" height="12" rx="4" fill="#44403C" />
      <HitFlash x={10} y={25} width={140} height={185} isHit={isHit} />
    </svg>
  );
}

function BulkyBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 150 210" width="150" height="210" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <ellipse cx="75" cy="100" rx="38" ry="40" fill={color} stroke={accent} strokeWidth="1.5" />
      <ellipse cx="75" cy="90" rx="25" ry="20" fill={color} opacity="0.6" />
      <path d="M60 80 L75 75 L90 80 L85 100 L75 105 L65 100 Z" fill={accent} opacity="0.15" />
      <rect x="42" y="128" width="66" height="8" rx="3" fill="#44403C" stroke="#57534E" strokeWidth="0.5" />
      <rect x="70" y="126" width="10" height="12" rx="2" fill="#CA8A04" />
      <motion.g animate={isAttacking ? { rotate: -40, x: 10 } : { rotate: 0, x: 0 }}
        transition={{ duration: 0.25 }} style={{ transformOrigin: "20px 85px" }}>
        <rect x="10" y="75" width="22" height="50" rx="8" fill={color} />
        <rect x="16" y="20" width="6" height="60" rx="2" fill="#78716C" />
        <path d="M6 20 Q12 8 22 20 L22 40 Q12 48 6 40 Z" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="0.5" />
        <path d="M6 25 Q12 18 22 25" stroke="#CBD5E1" strokeWidth="0.5" fill="none" />
      </motion.g>
      <rect x="118" y="75" width="22" height="50" rx="8" fill={color} />
      <motion.g animate={isHit ? { x: [0, 4, -4, 2, 0] } : {}} transition={{ duration: 0.3 }}>
        <ellipse cx="75" cy="52" rx="22" ry="20" fill={color} stroke={accent} strokeWidth="1" />
        <path d="M53 45 Q40 25 35 35" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M97 45 Q110 25 115 35" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="75" cy="58" rx="12" ry="8" fill={color} stroke={accent} strokeWidth="0.5" />
        <circle cx="70" cy="57" r="2" fill="#0F172A" />
        <circle cx="80" cy="57" r="2" fill="#0F172A" />
        <motion.circle cx="66" cy="48" r="3" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <motion.circle cx="84" cy="48" r="3" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <path d="M72 60 Q75 64 78 60" stroke={accent} strokeWidth="1.5" fill="none" />
      </motion.g>
      <rect x="52" y="135" width="16" height="45" rx="6" fill={color} />
      <rect x="82" y="135" width="16" height="45" rx="6" fill={color} />
      <path d="M50 178 L55 185 L65 185 L70 178" fill="#292524" />
      <path d="M80 178 L85 185 L95 185 L100 178" fill="#292524" />
      <HitFlash x={5} y={25} width={140} height={170} isHit={isHit} />
    </svg>
  );
}

function DragonBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 180 180" width="180" height="180" className="drop-shadow-2xl">
      <motion.path d="M15 50 Q30 10 65 30 L70 65 Q40 80 15 70 Z"
        fill={color} opacity="0.6" stroke={accent} strokeWidth="0.5"
        animate={isAttacking ? { d: "M5 40 Q25 0 65 25 L70 60 Q35 75 5 65 Z" } : {}}
        transition={{ duration: 0.3 }} />
      <motion.path d="M165 50 Q150 10 115 30 L110 65 Q140 80 165 70 Z"
        fill={color} opacity="0.6" stroke={accent} strokeWidth="0.5"
        animate={isAttacking ? { d: "M175 40 Q155 0 115 25 L110 60 Q145 75 175 65 Z" } : {}}
        transition={{ duration: 0.3 }} />
      <line x1="70" y1="65" x2="25" y2="25" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="70" y1="65" x2="20" y2="50" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="110" y1="65" x2="155" y2="25" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="110" y1="65" x2="160" y2="50" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <ellipse cx="90" cy="85" rx="35" ry="28" fill={color} stroke={accent} strokeWidth="1.5" />
      <ellipse cx="90" cy="90" rx="20" ry="18" fill={accent} opacity="0.15" />
      <path d="M78 80 L82 75 L86 80 L90 75 L94 80 L98 75 L102 80" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.3" />
      <motion.path d="M125 90 Q145 95 155 85 Q165 75 160 90 Q165 105 155 100"
        stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
        animate={isAttacking ? { d: "M125 90 Q150 90 160 78 Q170 65 165 82 Q172 100 160 95" } : {}}
        transition={{ duration: 0.3 }} />
      <polygon points="155,96 162,90 158,102" fill={accent} />
      <motion.g animate={isAttacking ? { x: -10, y: 5 } : { x: 0, y: 0 }} transition={{ duration: 0.25 }}>
        <rect x="55" y="100" width="12" height="25" rx="4" fill={color} />
        <path d="M55 125 L50 132 M60 125 L58 133 M67 125 L65 132" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      <rect x="113" y="100" width="12" height="25" rx="4" fill={color} />
      <path d="M113 125 L108 132 M118 125 L116 133 M125 125 L123 132" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      <motion.g animate={isHit ? { x: [0, -4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
        <path d="M65 45 Q90 25 115 45 L110 65 Q90 72 70 65 Z" fill={color} stroke={accent} strokeWidth="1" />
        <path d="M72 40 L62 20 L75 35" fill={accent} opacity="0.7" />
        <path d="M108 40 L118 20 L105 35" fill={accent} opacity="0.7" />
        <motion.ellipse cx="80" cy="48" rx="5" ry="4" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <motion.ellipse cx="100" cy="48" rx="5" ry="4" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <ellipse cx="80" cy="48" rx="1.5" ry="3.5" fill="#0F172A" />
        <ellipse cx="100" cy="48" rx="1.5" ry="3.5" fill="#0F172A" />
        <circle cx="85" cy="56" r="2" fill="#0F172A" />
        <circle cx="95" cy="56" r="2" fill="#0F172A" />
        {isAttacking && (
          <motion.g animate={{ opacity: [0, 1, 0.8, 0] }} transition={{ duration: 0.5 }}>
            <ellipse cx="90" cy="68" rx="8" ry="4" fill={accent} opacity="0.6" />
            <ellipse cx="90" cy="74" rx="12" ry="5" fill={accent} opacity="0.4" />
            <ellipse cx="90" cy="82" rx="16" ry="6" fill={accent} opacity="0.2" />
          </motion.g>
        )}
        <path d="M78 60 L80 64 L82 60 L84 64 L86 60" stroke="white" strokeWidth="1" fill="none" />
        <path d="M94 60 L96 64 L98 60 L100 64 L102 60" stroke="white" strokeWidth="1" fill="none" />
      </motion.g>
      <HitFlash x={10} y={10} width={160} height={130} rx={15} isHit={isHit} />
    </svg>
  );
}

function MirrorBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 140 200" width="140" height="200" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <motion.path d="M45 72 L28 160 Q70 175 112 160 L95 72"
        fill={color} opacity="0.9"
        animate={isAttacking ? { d: "M45 72 L18 155 Q70 180 122 155 L95 72" } : {}}
        transition={{ duration: 0.3 }} />
      <rect x="46" y="68" width="48" height="55" rx="5" fill={color} stroke={accent} strokeWidth="1.5" />
      <path d="M56 72 L70 68 L84 72 L80 95 L70 100 L60 95 Z" fill="#0F0F2E" stroke={accent} strokeWidth="0.5" />
      <circle cx="70" cy="82" r="4" fill={accent} opacity="0.6" />
      <motion.circle cx="70" cy="82" r="2" fill={accent}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }} />
      <rect x="46" y="115" width="48" height="7" rx="2" fill="#1A1A2E" />
      <path d="M35 60 Q46 48 55 60 L55 72 Q46 78 35 72 Z" fill={color} stroke={accent} strokeWidth="1" />
      <path d="M85 60 Q94 48 105 60 L105 72 Q94 78 85 72 Z" fill={color} stroke={accent} strokeWidth="1" />
      <motion.circle cx="40" cy="70" r="2" fill={accent} opacity="0.3"
        animate={{ y: [0, -10, -20], opacity: [0.3, 0.1, 0], x: [-2, -5, -8] }}
        transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="100" cy="75" r="2" fill={accent} opacity="0.3"
        animate={{ y: [0, -12, -22], opacity: [0.3, 0.1, 0], x: [2, 5, 8] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
      <motion.g animate={isAttacking ? { rotate: -50, x: 20, y: -15 } : { rotate: 0, x: 0, y: 0 }} transition={{ duration: 0.25 }}>
        <rect x="96" y="70" width="14" height="40" rx="6" fill="#4A4A6A" />
        <rect x="100" y="18" width="6" height="55" rx="1" fill={accent} opacity="0.6" />
        <rect x="93" y="68" width="20" height="5" rx="2" fill="#1A1A2E" />
        <polygon points="103,6 98,18 108,18" fill={accent} opacity="0.8" />
      </motion.g>
      <rect x="30" y="70" width="14" height="40" rx="6" fill="#4A4A6A" />
      <path d="M22 68 L40 62 L40 100 L31 108 L22 100 Z" fill={color} stroke={accent} strokeWidth="1" />
      <motion.g animate={isHit ? { x: [0, -4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
        <path d="M50 32 Q70 12 90 32 L90 55 Q70 60 50 55 Z" fill={color} stroke={accent} strokeWidth="1" />
        <path d="M55 40 L85 40 L82 52 Q70 56 58 52 Z" fill="#0A0A1E" />
        <motion.rect x="58" y="44" width="10" height="3" rx="1" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.5, 1, 0.5] }}
          transition={isHit ? { duration: 0.2 } : { duration: 1.5, repeat: Infinity }} />
        <motion.rect x="72" y="44" width="10" height="3" rx="1" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.5, 1, 0.5] }}
          transition={isHit ? { duration: 0.2 } : { duration: 1.5, repeat: Infinity }} />
        <path d="M70 12 L70 -2" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      <rect x="50" y="120" width="14" height="42" rx="5" fill={color} />
      <rect x="76" y="120" width="14" height="42" rx="5" fill={color} />
      <path d="M46 158 L68 158 L66 168 L48 168 Z" fill="#0A0A1E" />
      <path d="M72 158 L94 158 L92 168 L74 168 Z" fill="#0A0A1E" />
      <HitFlash x={25} y={0} width={90} height={175} isHit={isHit} />
    </svg>
  );
}

function KingBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 160 210" width="160" height="210" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <motion.path d="M50 75 L30 185 Q80 200 130 185 L110 75"
        fill="#4A0E0E" opacity="0.9"
        animate={isAttacking ? { d: "M50 75 L22 180 Q80 205 138 180 L110 75" } : {}}
        transition={{ duration: 0.3 }} />
      <path d="M55 80 L40 180 Q80 188 120 180 L105 80" fill="#FFF8E1" opacity="0.15" />
      <rect x="50" y="72" width="60" height="58" rx="6" fill={color} stroke={accent} strokeWidth="2" />
      <path d="M65 78 L80 72 L95 78 L90 105 L80 110 L70 105 Z" fill="#4A0E0E" stroke={accent} strokeWidth="1" />
      <path d="M80 82 L76 92 L84 92 Z" fill={accent} />
      <circle cx="80" cy="88" r="2" fill="white" />
      <rect x="50" y="122" width="60" height="8" rx="3" fill="#4A0E0E" stroke={accent} strokeWidth="0.5" />
      <rect x="72" y="120" width="16" height="12" rx="2" fill={accent} />
      <circle cx="80" cy="126" r="3" fill="white" opacity="0.6" />
      <path d="M35 62 Q50 45 60 62 L60 78 Q50 85 35 78 Z" fill={color} stroke={accent} strokeWidth="1.5" />
      <path d="M100 62 Q110 45 125 62 L125 78 Q110 85 100 78 Z" fill={color} stroke={accent} strokeWidth="1.5" />
      <polygon points="42,58 40,45 48,55" fill={accent} />
      <polygon points="118,58 120,45 112,55" fill={accent} />
      <motion.g animate={isAttacking ? { rotate: -45, x: 15, y: -12 } : { rotate: 0, x: 0, y: 0 }}
        transition={{ duration: 0.25 }}>
        <rect x="110" y="72" width="18" height="45" rx="7" fill="#C9A882" />
        <rect x="115" y="8" width="8" height="68" rx="2" fill="url(#tyrantBlade)" />
        <rect x="106" y="70" width="28" height="6" rx="3" fill={accent} />
        <polygon points="119,0 113,12 125,12" fill={accent} />
        <circle cx="106" cy="73" r="4" fill={accent} />
        <circle cx="134" cy="73" r="4" fill={accent} />
      </motion.g>
      <rect x="32" y="75" width="18" height="42" rx="7" fill="#C9A882" />
      <motion.g animate={isHit ? { x: [0, 4, -4, 2, 0] } : {}} transition={{ duration: 0.3 }}>
        <path d="M55 35 Q80 15 105 35 L105 58 Q80 65 55 58 Z" fill={color} stroke={accent} strokeWidth="1.5" />
        <path d="M60 42 L100 42 L97 56 Q80 60 63 56 Z" fill="#1A0A0A" />
        <path d="M58 35 L62 18 L70 28 L80 14 L90 28 L98 18 L102 35" fill={accent} stroke="#FDE68A" strokeWidth="0.5" />
        <circle cx="70" cy="23" r="2" fill="#EF4444" />
        <circle cx="80" cy="17" r="2.5" fill="#3B82F6" />
        <circle cx="90" cy="23" r="2" fill="#EF4444" />
        <motion.rect x="64" y="46" width="12" height="4" rx="1" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.7, 1, 0.7] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <motion.rect x="84" y="46" width="12" height="4" rx="1" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.7, 1, 0.7] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
      </motion.g>
      <rect x="56" y="130" width="16" height="48" rx="6" fill={color} stroke={accent} strokeWidth="0.5" />
      <rect x="88" y="130" width="16" height="48" rx="6" fill={color} stroke={accent} strokeWidth="0.5" />
      <rect x="52" y="174" width="24" height="12" rx="4" fill="#1A0A0A" stroke={accent} strokeWidth="0.5" />
      <rect x="84" y="174" width="24" height="12" rx="4" fill="#1A0A0A" stroke={accent} strokeWidth="0.5" />
      <HitFlash x={25} y={5} width={110} height={185} isHit={isHit} />
      <defs>
        <linearGradient id="tyrantBlade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#78716C" />
          <stop offset="50%" stopColor={accent} />
          <stop offset="100%" stopColor="#78716C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function KnightBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 120 180" width="120" height="180" className="drop-shadow-2xl" style={{ transform: "scaleX(-1)" }}>
      <motion.path d="M40 65 L30 145 Q60 155 90 145 L80 65"
        fill={color} opacity="0.8"
        animate={isAttacking ? { d: "M40 65 L20 140 Q60 160 100 140 L80 65" } : {}}
        transition={{ duration: 0.3 }} />
      <rect x="42" y="60" width="36" height="45" rx="4" fill={color} stroke={accent} strokeWidth="1.5" />
      <rect x="42" y="98" width="36" height="6" rx="2" fill="#44403C" />
      <ellipse cx="40" cy="63" rx="10" ry="7" fill={color} stroke={accent} strokeWidth="1" />
      <ellipse cx="80" cy="63" rx="10" ry="7" fill={color} stroke={accent} strokeWidth="1" />
      <motion.g animate={isAttacking ? { rotate: 45, x: -15, y: -10 } : { rotate: 0, x: 0, y: 0 }} transition={{ duration: 0.25 }}>
        <rect x="28" y="63" width="12" height="35" rx="5" fill="#A8896A" />
        <rect x="30" y="30" width="4" height="38" rx="1" fill="#CBD5E1" />
        <rect x="26" y="62" width="12" height="4" rx="2" fill="#854D0E" />
        <polygon points="32,15 28,30 36,30" fill="#E2E8F0" />
      </motion.g>
      <rect x="80" y="63" width="12" height="35" rx="5" fill="#A8896A" />
      <motion.g animate={isHit ? { x: [0, 3, -3, 2, 0] } : {}} transition={{ duration: 0.3 }}>
        <path d="M45 30 Q60 10 75 30 L75 50 Q60 55 45 50 Z" fill={color} stroke={accent} strokeWidth="1" />
        <rect x="50" y="35" width="20" height="14" rx="3" fill="#1A1A2E" />
        <motion.circle cx="56" cy="42" r="2.5" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
        <motion.circle cx="64" cy="42" r="2.5" fill={accent}
          animate={isHit ? { fill: "#FFF" } : { fill: accent, opacity: [0.8, 1, 0.8] }}
          transition={isHit ? { duration: 0.2 } : { duration: 2, repeat: Infinity }} />
      </motion.g>
      <rect x="45" y="105" width="12" height="35" rx="5" fill={color} />
      <rect x="63" y="105" width="12" height="35" rx="5" fill={color} />
      <rect x="43" y="135" width="16" height="10" rx="3" fill="#292524" />
      <rect x="61" y="135" width="16" height="10" rx="3" fill="#292524" />
      <HitFlash x={25} y={10} width={70} height={140} rx={10} isHit={isHit} />
    </svg>
  );
}

// ── Dummy (training target for endless mode) ────────────────
function DummyBody({ isAttacking, isHit, color, accent }) {
  return (
    <svg viewBox="0 0 120 160" width="120" height="160" className="drop-shadow-2xl">
      {/* Wooden post */}
      <rect x="50" y="90" width="20" height="70" rx="3" fill="#78553A" />
      {/* Cross-beam */}
      <rect x="20" y="60" width="80" height="12" rx="4" fill="#8B6F47" />
      {/* Head (straw-stuffed sack) */}
      <motion.circle cx="60" cy="40" r="22" fill={color} stroke={accent} strokeWidth="2"
        animate={isHit ? { x: [0, 8, -8, 5, -3, 0], rotate: [0, 10, -10, 5, 0] } : {}}
        transition={{ duration: 0.4 }} />
      {/* X eyes */}
      <motion.g animate={isHit ? { fill: "#EF4444" } : { fill: accent }} transition={{ duration: 0.2 }}>
        <text x="50" y="44" fontSize="12" fontWeight="bold" fill={accent}>✕</text>
        <text x="62" y="44" fontSize="12" fontWeight="bold" fill={accent}>✕</text>
      </motion.g>
      {/* Stitched mouth */}
      <path d="M52 50 L56 48 L60 50 L64 48 L68 50" stroke={accent} strokeWidth="1.5" fill="none" />
      {/* Target circles on body */}
      <circle cx="60" cy="80" r="15" fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.5" />
      <circle cx="60" cy="80" r="8" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.7" />
      <circle cx="60" cy="80" r="3" fill="#EF4444" opacity="0.8" />
      {/* Arm nubs on cross-beam */}
      <circle cx="22" cy="66" r="6" fill={color} stroke={accent} strokeWidth="1" />
      <circle cx="98" cy="66" r="6" fill={color} stroke={accent} strokeWidth="1" />
      {/* Straw wisps */}
      <motion.g animate={isHit ? { y: [0, -3, 0] } : {}} transition={{ duration: 0.3 }}>
        <line x1="45" y1="25" x2="40" y2="18" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="75" y1="25" x2="80" y2="18" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="55" y1="22" x2="52" y2="14" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      <HitFlash x={38} y={18} width={44} height={44} rx={22} isHit={isHit} />
    </svg>
  );
}

// ── Body-type dispatch map ───────────────────────────────────
const BODY_COMPONENTS = {
  beast: BeastBody,
  hunched: HunchedBody,
  winged: WingedBody,
  golem: GolemBody,
  robed: RobedBody,
  giant: GiantBody,
  bulky: BulkyBody,
  dragon: DragonBody,
  mirror: MirrorBody,
  king: KingBody,
  dummy: DummyBody,
};

/**
 * EnemyCharacter — renders the correct body type based on config.
 *
 * @param {{ isAttacking: boolean, isHit: boolean, config: Object }} props
 */
export default memo(function EnemyCharacter({ isAttacking, isHit, config }) {
  const { color, accent, body } = config;
  const BodyComponent = BODY_COMPONENTS[body] || KnightBody;
  return <BodyComponent isAttacking={isAttacking} isHit={isHit} color={color} accent={accent} />;
});
