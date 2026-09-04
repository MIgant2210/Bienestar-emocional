import React from 'react';

// ============================================================================
// MOTOR MODULAR DE AVATARES DE EQUILIBRIA (V9.0)
// Motor de Rizos Volumétricos de Alta Definición (Inspirado en Referencia Oficial)
// ============================================================================

export const SKIN_TONES_CATALOG = [
  // Tonos Claros (Fair / Light)
  { hex: '#fff0e5', label: 'Porcelana Rosada', undertone: 'Frío / Rosa', category: 'claro' },
  { hex: '#fce4d6', label: 'Marfil Suave', undertone: 'Neutro', category: 'claro' },
  { hex: '#f8d4bb', label: 'Melocotón Cálido', undertone: 'Cálido / Dorado', category: 'claro' },
  { hex: '#f2cbb2', label: 'Beige Arena', undertone: 'Neutro Cálido', category: 'claro' },

  // Tonos Medios (Medium / Tan / Trigueño)
  { hex: '#eab992', label: 'Trigueño Dorado', undertone: 'Cálido (Angie)', category: 'medio' },
  { hex: '#dfa77b', label: 'Miel Almendra', undertone: 'Dorado', category: 'medio' },
  { hex: '#d59b6c', label: 'Oliva Cálido Latino', undertone: 'Oliva / Neutro', category: 'medio' },
  { hex: '#c68652', label: 'Bronce Caramelo', undertone: 'Cálido (Kenny)', category: 'medio' },
  { hex: '#b87747', label: 'Canela Terracota', undertone: 'Cálido Rojizo', category: 'medio' },
  { hex: '#a66738', label: 'Avellana Tostada', undertone: 'Neutro', category: 'medio' },

  // Tonos Profundos (Deep / Dark / Ébano)
  { hex: '#93532c', label: 'Castaño Cobrizo', undertone: 'Cálido Profundo', category: 'profundo' },
  { hex: '#7d431f', label: 'Cacao Dorado', undertone: 'Dorado Profundo', category: 'profundo' },
  { hex: '#693517', label: 'Espresso Rico', undertone: 'Cálido Intenso', category: 'profundo' },
  { hex: '#53270f', label: 'Café Moca', undertone: 'Neutro Oscuro', category: 'profundo' },
  { hex: '#3e1b0b', label: 'Ébano Puro', undertone: 'Neutro Profundo', category: 'profundo' },
  { hex: '#2f1408', label: 'Chocolate Nocturno', undertone: 'Frío Profundo', category: 'profundo' }
];

export const DEFAULT_AVATAR_CONFIG = {
  skinTone: '#eab992',
  bodyType: 'mujer_curvilinea', 
  height: 'media',              
  
  // Rostro y rasgos
  faceShape: 'oval',            
  eyes: 'almendrados',          
  eyeColor: '#2e1509',          
  brows: 'naturales',           
  nose: 'recta',                
  mouth: 'sonrisa_calida',      
  facialHair: 'none',           
  freckles: false,
  blush: true,

  // Cabello
  hairStyle: 'rizos_leona',     
  hairColor: '#3d2314',         

  // Gafas
  glasses: 'none',              
  glassesColor: '#7c3aed',

  // Prenda Superior
  topType: 'hoodie',            
  topColor: '#493362',

  // Prenda Inferior
  bottomType: 'cargo',          
  bottomColor: '#bfa67a',

  // Calzado
  shoesType: 'skate',           
  shoesColor: '#18181b',

  // Accesorios
  accessories: {
    watch: true,
    earrings: false,
    earringsType: 'gold_hoop',  
    necklace: false,
    backpack: false,
    headphones: false,
    headphonesColor: '#18181b',
    cap: false,
    capColor: '#18181b',
    beanie: false,
    beanieColor: '#3b82f6'
  }
};

const shadeColor = (col, percent) => {
  let num = parseInt((col || '#7c3aed').replace('#', ''), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let B = ((num >> 8) & 0x00FF) + amt;
  let G = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
    (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
};

const getSkinTones = (baseHex) => {
  const hex = (baseHex || '#eab992').toLowerCase();
  const isDark = ['#93532c','#7d431f','#693517','#53270f','#3e1b0b','#2f1408'].includes(hex);
  return {
    skin: hex,
    shadow: shadeColor(hex, -22),
    light: shadeColor(hex, 16),
    blush: isDark ? 'rgba(180,60,60,0.15)' : 'rgba(235,110,110,0.22)'
  };
};

export const ModularAvatar = ({
  config = {},
  pose = 'neutral',
  duration = 4,
  compact = false,
  isActive = false,
  secondsLeft = null,
  className = '',
  style = {}
}) => {
  const merged = { 
    ...DEFAULT_AVATAR_CONFIG, 
    ...config, 
    accessories: { ...DEFAULT_AVATAR_CONFIG.accessories, ...(config?.accessories || {}) } 
  };
  const p = (pose || 'neutral').toLowerCase();

  const isCelebrate = p.includes('celebrate') || p.includes('celebraci');
  const isBack = p === 'chest_open' || p === 'back_view' || p === 'chest_open_back';
  const isLookUp = p.includes('arriba') || p.includes('look_up') || p.includes('cielo') || p.includes('techo') || isBack;
  const isSeated = p.includes('seated') || p.includes('lotus') || p.includes('4-7-8') || p.includes('478') || p.includes('grounding') || p.includes('sentad') || p.includes('sientat') || p.includes('siéntat') || p.includes('erguid') || p.includes('pies');
  const isInhale = p.includes('inhale') || p.includes('inhala');
  const isHold = p.includes('hold') || p.includes('mant');
  const isExhale = p.includes('exhale') || p.includes('exhala');
  const isShrug = p.includes('shoulder_lift') || p.includes('eleva') || p.includes('hombros_arriba');
  const isShoulderDrop = p.includes('shoulder_drop') || p.includes('suelta') || p.includes('soltado') || p.includes('golpe');
  const isRoll = p.includes('shoulder_roll') || p.includes('rotaci') || p.includes('circulo') || p.includes('circunferencia');
  const isNeckRight = p.includes('neck_right') || (p.includes('cuello') && p.includes('derech')) || (p.includes('lateral') && !p.includes('izq'));
  const isNeckLeft = p.includes('neck_left') || (p.includes('cuello') && p.includes('izquierd'));
  const isNeckFront = p.includes('neck_front') || p.includes('ment') || p.includes('nuca');
  const isPalmRight = p.includes('palm_stretch_right') || (p.includes('palma') && p.includes('derech'));
  const isPalmLeft = p.includes('palm_stretch_left') || (p.includes('palma') && p.includes('izquierd'));
  const isWristRoll = p.includes('wrist_roll') || p.includes('muec');
  const isFistClench = p.includes('fist_clench') || p.includes('puo') || p.includes('antebrazo');
  const isTwistRight = p.includes('twist_right') || (p.includes('torsi') && p.includes('derech')) || (p.includes('twist') && !p.includes('izq'));
  const isTwistLeft = p.includes('twist_left') || (p.includes('torsi') && p.includes('izquierd'));
  const isStretchUp = p.includes('stretch_up') || p.includes('columna') || (p.includes('extensi') && p.includes('techo'));
  const isEyesClosed = isInhale || isHold || isExhale || isShoulderDrop || isNeckRight || isNeckLeft || isNeckFront || isSeated;

  const dur = `${Math.max(duration, 1.5)}s`;

  // Paleta de Piel y Cabello
  const { skin, shadow: skinShadow, light: skinLight, blush: skinBlush } = getSkinTones(merged.skinTone);
  const freckleColor = shadeColor(skin, -36);
  const hair = merged.hairColor || '#3d2314';
  const hairDark = shadeColor(hair, -32);
  const hairMid = shadeColor(hair, 12);
  const hairLight = shadeColor(hair, 28);
  const hairHighlight = shadeColor(hair, 45);

  // Paleta de Prendas
  const topColor = merged.topColor || '#493362';
  const topShadow = shadeColor(topColor, -25);
  const topLight = shadeColor(topColor, 22);

  const bottomColor = merged.bottomColor || '#bfa67a';
  const bottomShadow = shadeColor(bottomColor, -25);
  const bottomLight = shadeColor(bottomColor, 18);

  const shoesColor = merged.shoesColor || '#18181b';
  const eyeIrisColor = merged.eyeColor || '#2e1509';
  const lipstickColor = merged.lipstickColor || '#c27878';
  const lipShadow = shadeColor(lipstickColor, -25);
  const lipLight = shadeColor(lipstickColor, 20);
  const frameColor = merged.glassesColor || '#7c3aed';

  // Normalización de Complexión
  const rawBodyType = merged.bodyType || 'mujer_curvilinea';
  const normalizedBodyType = {
    'curvilineo': 'mujer_curvilinea',
    'promedio': 'mujer_promedio',
    'atletico': 'hombre_atletico',
    'robusto': 'hombre_robusto',
    'delgado': 'hombre_delgado',
    'triangulo_invertido': 'hombre_muscular',
    'ovalado': 'mujer_robusta',
    'menudo': 'mujer_delgada'
  }[rawBodyType] || rawBodyType;

  const isFemale = normalizedBodyType.startsWith('mujer');

  const bodyMods = {
    mujer_curvilinea: { shL: 122, shR: 178, torsoTopL: 124, torsoTopR: 176, waistL: 133, waistR: 167, hipL: 118, hipR: 182, neckW: 18, armW: 12.5, legW: 14, hasBust: true, bustScale: 1.0 },
    mujer_promedio: { shL: 120, shR: 180, torsoTopL: 122, torsoTopR: 178, waistL: 130, waistR: 170, hipL: 121, hipR: 179, neckW: 18.5, armW: 13, legW: 13.5, hasBust: true, bustScale: 0.9 },
    mujer_atletica: { shL: 118, shR: 182, torsoTopL: 118, torsoTopR: 182, waistL: 129, waistR: 171, hipL: 122, hipR: 178, neckW: 19, armW: 13.5, legW: 14, hasBust: true, bustScale: 0.85 },
    mujer_robusta: { shL: 116, shR: 184, torsoTopL: 116, torsoTopR: 184, waistL: 124, waistR: 176, hipL: 114, hipR: 186, neckW: 21, armW: 15, legW: 16, hasBust: true, bustScale: 1.25 },
    mujer_delgada: { shL: 124, shR: 176, torsoTopL: 125, torsoTopR: 175, waistL: 135, waistR: 165, hipL: 122, hipR: 178, neckW: 17, armW: 11.5, legW: 12, hasBust: true, bustScale: 0.75 },

    hombre_atletico: { shL: 116, shR: 184, torsoTopL: 116, torsoTopR: 184, waistL: 126, waistR: 174, hipL: 125, hipR: 175, neckW: 22, armW: 15, legW: 14.5, hasBust: false },
    hombre_promedio: { shL: 116, shR: 184, torsoTopL: 116, torsoTopR: 184, waistL: 127, waistR: 173, hipL: 126, hipR: 174, neckW: 21, armW: 14, legW: 14, hasBust: false },
    hombre_robusto: { shL: 112, shR: 188, torsoTopL: 112, torsoTopR: 188, waistL: 120, waistR: 180, hipL: 120, hipR: 180, neckW: 24, armW: 17, legW: 16.5, hasBust: false },
    hombre_delgado: { shL: 122, shR: 178, torsoTopL: 122, torsoTopR: 178, waistL: 131, waistR: 169, hipL: 128, hipR: 172, neckW: 19, armW: 12, legW: 12.5, hasBust: false },
    hombre_muscular: { shL: 108, shR: 192, torsoTopL: 108, torsoTopR: 192, waistL: 125, waistR: 175, hipL: 126, hipR: 174, neckW: 24, armW: 17.5, legW: 15.5, hasBust: false }
  }[normalizedBodyType] || { 
    shL: 116, shR: 184, torsoTopL: 116, torsoTopR: 184, waistL: 126, waistR: 174, hipL: 125, hipR: 175, neckW: 20, armW: 14, legW: 14, hasBust: false 
  };

  const heightTransform = {
    'baja': 'scaleY(0.93) translateY(18px)',
    'media-baja': 'scaleY(0.96) translateY(9px)',
    'media': '',
    'media-alta': 'scaleY(1.03) translateY(-8px)',
    'alta': 'scaleY(1.07) translateY(-18px)'
  }[merged.height || 'media'] || '';

    const rawTopType = merged.topType || 'hoodie';
  const topType = {
    'shirt': 'shirt_formal',
    'sweater': 'sweater_heart',
    'chaleco': 'chaleco_puffy',
    'sport_top': 'tank_top',
    'vestido': 'vestido_corto'
  }[rawTopType] || rawTopType;

    const rawShoesType = merged.shoesType || 'sneakers_urbanos';
  const shoesType = {
    'skate': 'sneakers_urbanos',
    'runners': 'sneakers_running',
    'high_tops': 'sneakers_altos',
    'botas': 'botines_chelsea',
    'sandalias': 'sandalias_planas',
    'zapatos_vestir': 'zapatos_oxford',
    'mocasines': 'mocasines_clasicos'
  }[rawShoesType] || rawShoesType;

  const rawBottomType = merged.bottomType || 'cargo';
  const bottomType = {
    'jeans': 'jeans_clasicos',
    'shorts': 'shorts_casuales'
  }[rawBottomType] || rawBottomType;

  const isShortBottom = [
    'shorts_casuales', 'shorts_deportivos', 'shorts_mezclilla', 'shorts_biker',
    'falda_tablas', 'falda_mezclilla', 'falda_tubo', 'shorts'
  ].includes(bottomType);

  const isDress = typeof topType === 'string' && topType.startsWith('vestido');
  const isBareLegs = isDress
    ? ['vestido_corto', 'vestido_estampado', 'vestido_tirantes'].includes(topType)
    : (isShortBottom || bottomType === 'none');

  const isSleeveless = ['tank_top', 'chaleco_puffy', 'chaleco_lana', 'vestido_tirantes'].includes(topType);
  const isShortSleeve = ['tshirt', 'polo', 'shirt_casual_open', 'vestido_corto', 'vestido_estampado'].includes(topType);
  const isLongSleeve = ['hoodie', 'sweater_heart', 'sweater_equi', 'sweater_turtleneck', 'shirt_formal', 'cardigan', 'vestido_largo', 'vestido_brillos'].includes(topType);
  
  // Normalización de Estilos de Cabello
  const rawHStyle = merged.hairStyle || 'rizos_leona';
  const hStyle = {
    'curly_shoulder': 'curly_3b_angie',
    'wavy_long': 'ondas_largas',
    'messy_bun': 'chongo_bonito',
    'afro_volume': 'afro_voluminoso',
    'afro_short': 'afro_corto'
  }[rawHStyle] || rawHStyle;


  return (
    <div
      className={`modular-master-avatar ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: compact ? '180px' : '230px',
        height: compact ? '270px' : '340px',
        userSelect: 'none',
        perspective: '1200px',
        ...style
      }}
    >
      <style>{`
        @keyframes mBreathIn{0%{transform:scale(1) translateY(0)}50%{transform:scale(1.05,1.03) translateY(-4px)}100%{transform:scale(1.07,1.045) translateY(-6px)}}
        @keyframes mBreathOut{0%{transform:scale(1.07,1.045) translateY(-6px)}55%{transform:scale(1.01) translateY(-1px)}100%{transform:scale(.97) translateY(3px)}}
        
        /* Elevación de Hombros Clave: Torso superior y brazos suben al unísono hacia las orejas */
        @keyframes mShrugTorso{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes mHeadSink{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
        
        /* Rotación de Hombros */
        @keyframes mRollTorsoL{0%{transform:translate(0,0)}25%{transform:translate(-3px,-15px)}50%{transform:translate(4px,-6px)}75%{transform:translate(1px,6px)}100%{transform:translate(0,0)}}
        @keyframes mRollTorsoR{0%{transform:translate(0,0)}25%{transform:translate(3px,-15px)}50%{transform:translate(-4px,-6px)}75%{transform:translate(-1px,6px)}100%{transform:translate(0,0)}}
        
        /* Soltado de golpe */
        @keyframes mDropTorso{0%{transform:translateY(-16px)}30%{transform:translateY(6px)}65%{transform:translateY(-2px)}100%{transform:translateY(0)}}
        
        /* Cuello y Cabeza */
        @keyframes mNeckR{0%,100%{transform:rotate(18deg) translateY(2px)}50%{transform:rotate(24deg) translateY(4px)}}
        @keyframes mNeckL{0%,100%{transform:rotate(-18deg) translateY(2px)}50%{transform:rotate(-24deg) translateY(4px)}}
        @keyframes mNeckF{0%,100%{transform:translateY(6px) rotateX(-14deg)}50%{transform:translateY(12px) rotateX(-22deg)}}
        
        /* Brazos y Muñecas */
        @keyframes mWristRoll{0%{transform:rotate(0deg)}50%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}
        @keyframes mStretchPulse{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.04) translateY(-8px)}}
        @keyframes mTremor{0%,100%{transform:translate(0,0)}25%{transform:translate(1px,-1px)}75%{transform:translate(-1px,1px)}}
        @keyframes mJump{0%,100%{transform:translateY(0) scale(1)}25%{transform:translateY(-22px) scale(1.02)}55%{transform:translateY(-3px) scale(.98)}75%{transform:translateY(-10px) scale(1.01)}}
        @keyframes mVapor{0%{opacity:0;transform:translate(0,0) scale(.5)}30%{opacity:.85;transform:translate(12px,-8px) scale(1)}80%{opacity:.4;transform:translate(22px,-18px) scale(1.3)}100%{opacity:0;transform:translate(30px,-24px) scale(1.5)}}
        @keyframes mSpark{0%,100%{opacity:.2;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(180deg)}}
        
        /* Clases de animación */
        .mb{transform-origin:150px 200px;animation:${isInhale?`mBreathIn ${dur} ease-out forwards`:isExhale?`mBreathOut ${dur} ease-in-out forwards`:'none'};}
        
        .msh{transform-origin:150px 144px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'mShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'mDropTorso .8s ease-out':isRoll?'mRollTorsoL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        
        .mh{transform-origin:150px 115px;transition:transform .5s cubic-bezier(.34,1.4,.64,1);transform:${isLookUp?'translateY(-8px) rotateX(14deg)':isNeckRight?'rotate(20deg) translateY(3px)':isNeckLeft?'rotate(-20deg) translateY(3px)':isNeckFront?'translateY(10px) rotateX(-18deg)':isCelebrate?'translateY(-5px) rotate(2deg)':'none'};animation:${isShrug?'mHeadSink 2.2s ease-in-out infinite':isNeckRight?'mNeckR 2.8s ease-in-out infinite':isNeckLeft?'mNeckL 2.8s ease-in-out infinite':isNeckFront?'mNeckF 2.8s ease-in-out infinite':'none'};}
        
        .msl{transform-origin:${bodyMods.shL}px 144px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'mShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'mDropTorso .8s ease-out':isRoll?'mRollTorsoL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        .msr{transform-origin:${bodyMods.shR}px 144px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'mShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'mDropTorso .8s ease-out':isRoll?'mRollTorsoR 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        
        .mal{transform-origin:${bodyMods.shL}px 144px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(-145deg) translate(-6px,-20px)':isStretchUp?'rotate(-168deg) translate(-8px,-30px)':isInhale?'rotate(-24deg) translate(10px,6px)':isPalmLeft?'rotate(-75deg) translate(12px,-6px)':isPalmRight?'rotate(-38deg) translate(22px,4px)':isWristRoll?'rotate(-50deg) translate(16px,2px)':isTwistRight?'rotate(-38deg) translate(16px,8px)':isTwistLeft?'rotate(-26deg) translate(10px,4px)':isSeated?'rotate(-16deg) translate(4px,14px)':isFistClench?'rotate(-32deg) translate(8px,-4px)':'rotate(0)'};animation:${isWristRoll?'mWristRoll 1.4s linear infinite':isStretchUp?'mStretchPulse 2.2s ease-in-out infinite':isFistClench?'mTremor 0.15s infinite':'none'};}
        .mar{transform-origin:${bodyMods.shR}px 144px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(145deg) translate(6px,-20px)':isStretchUp?'rotate(168deg) translate(8px,-30px)':isInhale?'rotate(24deg) translate(-10px,6px)':isPalmRight?'rotate(75deg) translate(-12px,-6px)':isPalmLeft?'rotate(38deg) translate(-22px,4px)':isWristRoll?'rotate(50deg) translate(-16px,2px)':isTwistRight?'rotate(26deg) translate(-10px,4px)':isTwistLeft?'rotate(38deg) translate(-16px,8px)':isSeated?'rotate(16deg) translate(-4px,14px)':isFistClench?'rotate(32deg) translate(-8px,-4px)':'rotate(0)'};animation:${isWristRoll?'mWristRoll 1.4s linear infinite':isStretchUp?'mStretchPulse 2.2s ease-in-out infinite':isFistClench?'mTremor 0.15s infinite':'none'};}
      `}</style>

      {/* Sombra de suelo */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          width: isSeated ? '154px' : `${124 + bodyMods.armW * 1.5}px`,
          height: '14px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(73,51,98,.34) 0%, transparent 70%)',
          filter: 'blur(3px)',
          transition: 'all .4s',
          zIndex: 1,
          transform: isCelebrate ? 'scale(.7) translateY(12px)' : 'scale(1)'
        }}
      />

      {/* Vapor al exhalar */}
      {(isShoulderDrop || isExhale) && (
        <div style={{ position: 'absolute', top: 72, right: 38, pointerEvents: 'none', zIndex: 15, animation: 'mVapor 2s ease-out infinite' }}>
          <svg width="36" height="26" viewBox="0 0 36 26">
            <path d="M5 18C5 12 12 10 15 14C16 9 25 9 27 14C30 12 33 15 31 19C33 22 28 24 25 22C22 25 13 24 11 22C8 24 4 22 5 18Z" fill="#e0e0e0" opacity=".85" />
          </svg>
        </div>
      )}

      {/* Destellos de celebración */}
      {isCelebrate && (
        <div style={{ position: 'absolute', inset: -12, pointerEvents: 'none', zIndex: 15 }}>
          <svg viewBox="0 0 300 400" style={{ width: '100%', height: '100%' }}>
            <path d="M50 55L56 43L68 39L56 35L50 23L44 35L32 39L44 43Z" fill="#fbbf24" style={{ animation: 'mSpark 1.2s ease-in-out infinite' }} />
            <path d="M250 65L255 54L268 51L255 48L250 37L245 48L232 51L245 54Z" fill="#f97316" style={{ animation: 'mSpark 1.3s ease-in-out infinite .3s' }} />
            <path d="M150 12L154 4L164 1L154-2L150-10L146-2L136 1L146 4Z" fill="#c084fc" style={{ animation: 'mSpark 1.1s ease-in-out infinite .6s' }} />
          </svg>
        </div>
      )}

      {/* ═══ SVG VECTORIAL DEL AVATAR ═══ */}
      <svg
        viewBox="0 0 300 400"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,.15))',
          transition: 'transform .55s cubic-bezier(.34,1.4,.64,1)',
          animation: isCelebrate ? 'mJump 2.2s ease-in-out infinite' : 'none',
          transform: `${heightTransform} ${isCelebrate ? '' : isTwistRight ? 'rotateY(24deg) scale(.98)' : isTwistLeft ? 'rotateY(-24deg) scale(.98)' : isSeated ? 'translateY(38px)' : ''}`
        }}
      >
        <defs>
          <linearGradient id={`mSkinGrad_${skin.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skinLight} />
            <stop offset="60%" stopColor={skin} />
            <stop offset="100%" stopColor={skinShadow} />
          </linearGradient>
          <linearGradient id={`mTopGrad_${topColor.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={topLight} />
            <stop offset="70%" stopColor={topColor} />
            <stop offset="100%" stopColor={topShadow} />
          </linearGradient>
          <linearGradient id={`mCurlGrad_${hair.replace('#','')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={hairDark} />
            <stop offset="45%" stopColor={hair} />
            <stop offset="75%" stopColor={hairLight} />
            <stop offset="100%" stopColor={hairDark} />
          </linearGradient>
        </defs>

        {isBack ? (
          <g className="mb">
            {/* ═══ VISTA POSTERIOR ═══ */}
            <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 4} 230, 120 280, 122 348 C 122 356, 126 362, 138 362 L 148 362 L 148 266 L 150 206 Z`} fill={isBareLegs ? skin : (isDress ? skin : bottomColor)} />
            <path d={`M ${bodyMods.waistR} 206 C ${bodyMods.hipR + 4} 230, 180 280, 178 348 C 178 356, 174 362, 162 362 L 152 362 L 152 266 L 150 206 Z`} fill={isBareLegs ? skin : (isDress ? skin : bottomColor)} />
            
            {!isDress && isBareLegs && (
              <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 4} 225, 122 248, 122 250 L 148 250 L 150 206 L 152 250 L 178 250 C 178 248, ${bodyMods.hipR + 4} 225, ${bodyMods.waistR} 206 Z`} fill={bottomColor} />
            )}

            {isDress && (
              (topType === 'vestido_corto' || topType === 'vestido_estampado' || topType === 'vestido_tirantes') ? (
                <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 5} 226, 110 260, 110 262 C 134 270, 166 270, 190 262 C 190 260, ${bodyMods.hipR + 5} 226, ${bodyMods.waistR} 206 Z`} fill={topColor} />
              ) : (
                <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 5} 238, 104 346, 106 352 C 134 358, 166 358, 194 352 C 196 346, ${bodyMods.hipR + 5} 238, ${bodyMods.waistR} 206 Z`} fill={topColor} />
              )
            )}

            {/* Calzado vista posterior */}
            {shoesType === 'botas_altas' && (
              <g>
                <path d="M 124 280 C 121 300, 122 342, 120 360 L 146 360 C 147 342, 147 300, 145 280 Z" fill={shoesColor} />
                <path d="M 155 280 C 153 300, 153 342, 154 360 L 180 360 C 178 342, 179 300, 176 280 Z" fill={shoesColor} />
              </g>
            )}
            <ellipse cx="132" cy="362" rx="15" ry="8" fill={shoesColor} />
            <ellipse cx="168" cy="362" rx="15" ry="8" fill={shoesColor} />

            <rect x={150 - bodyMods.neckW / 2} y="108" width={bodyMods.neckW} height="28" rx="4" fill={skin} />
            <path d={`M ${150 - bodyMods.neckW / 3} 118 L 150 124 L ${150 + bodyMods.neckW / 3} 118`} stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".4" />

            <path d={`M ${bodyMods.torsoTopL} 144 C ${bodyMods.torsoTopL - 2} 168, ${bodyMods.waistL} 196, ${bodyMods.waistL} 206 L ${bodyMods.waistR} 206 C ${bodyMods.waistR} 196, ${bodyMods.torsoTopR + 2} 168, ${bodyMods.torsoTopR} 144 Q 164 132, 150 134 Q 136 132, ${bodyMods.torsoTopL} 144 Z`} fill={topColor} />

            <path d={`M ${bodyMods.shL} 144 Q 124 180, 142 220`} stroke={topColor} strokeWidth={bodyMods.armW} strokeLinecap="round" fill="none" />
            <path d="M 128 180 Q 136 204, 144 220" stroke={skin} strokeWidth={bodyMods.armW - 4} strokeLinecap="round" fill="none" />
            <path d={`M ${bodyMods.shR} 144 Q 176 180, 158 220`} stroke={topColor} strokeWidth={bodyMods.armW} strokeLinecap="round" fill="none" />
            <path d="M 172 180 Q 164 204, 156 220" stroke={skin} strokeWidth={bodyMods.armW - 4} strokeLinecap="round" fill="none" />

            <g transform="translate(150, 222)">
              <ellipse cx="0" cy="2" rx="13" ry="9" fill={skin} />
              <path d="M-9-2 Q-7 3,-9 7" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M-4-3 Q-2 3,-4 8" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 1-3 Q 3 3, 1 8" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 6-3 Q 8 3, 6 8" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>

            <g transform="translate(0, 0)">
              <ellipse cx="118" cy="80" rx="4.5" ry="7" fill={skin} />
              <ellipse cx="182" cy="80" rx="4.5" ry="7" fill={skin} />
              <path d="M 118 70 C 114 30, 130 20, 150 20 C 170 20, 186 30, 182 70 C 182 88, 176 102, 168 106 Q 150 110, 132 106 C 124 102, 118 88, 118 70 Z" fill={hair} />
              <path d="M 124 72 Q 150 98, 176 72 Q 168 108, 150 110 Q 132 108, 124 72 Z" fill={hairDark} />
            </g>
          </g>
        ) : (
          <g className="mb">
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* ═══ 0. CAPA TRASERA DE CABELLO ═══ */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <g className="mh">
              {/*
               * ══════════════════════════════════════════════════════════════════
               * CAPA TRASERA DE CABELLO V10 — MECHONES COMO FORMAS RELLENAS
               * Cada estilo tiene silueta, tamaño de mechones y distribución ÚNICA.
               * Cada mechón = path cerrado fill + highlight. SIN strokes decorativos
               * sobre masa plana.
               * ══════════════════════════════════════════════════════════════════
               */}

              {/* ═══ ESTILO 1: RIZOS VOLUMINOSOS SALVAJES ═══ */}
                {hStyle === 'rizos_leona' && (
                  <g>
                    {/* Base sólida muy ajustada a los hombros para quitar volumen exagerado */}
                    <path d="M150 18 C128 18, 110 40, 110 80 C110 130, 114 180, 118 250 C120 270, 140 275, 150 275 C160 275, 180 270, 182 250 C186 180, 190 130, 190 80 C190 40, 172 18, 150 18 Z" fill={hairDark} />
                    <path d="M150 22 C132 22, 114 42, 114 82 C114 132, 118 180, 122 245 C124 260, 138 265, 150 265 C162 265, 176 260, 178 245 C182 180, 186 132, 186 82 C186 42, 168 22, 150 22 Z" fill={hair} />
                    {/* Rizo S estructural trasero izquierdo ajustado */}
                    <path d="M120 46 C110 70, 122 95, 115 125 C108 155, 122 170, 115 200 C108 230, 124 245, 120 260 C125 255, 130 230, 125 200 C120 170, 134 155, 125 125 C116 95, 130 70, 120 46 Z" fill={hairDark} opacity="0.85" />
                    <path d="M124 50 C114 74, 126 99, 119 129 C112 159, 126 174, 119 204 C112 234, 128 249, 124 264 C129 259, 134 234, 129 204 C124 174, 138 159, 129 129 C120 99, 134 74, 124 50 Z" fill={hairMid} />
                    {/* Rizo S estructural trasero derecho ajustado */}
                    <path d="M180 46 C190 70, 178 95, 185 125 C192 155, 178 170, 185 200 C192 230, 176 245, 180 260 C175 255, 170 230, 175 200 C180 170, 166 155, 175 125 C184 95, 170 70, 180 46 Z" fill={hairDark} opacity="0.85" />
                    <path d="M176 50 C186 74, 174 99, 181 129 C188 159, 174 174, 181 204 C188 234, 172 249, 176 264 C171 259, 166 234, 171 204 C176 174, 162 159, 171 129 C162 99, 176 74, 176 50 Z" fill={hairMid} />
                  </g>
                )}

                {/* ═══ ESTILO 2: RIZOS DEFINIDOS NATURALES ═══ */}
                {hStyle === 'rizos_definidos' && (
                  <g>
                    {/* Base sólida pero más estrecha (menos volumen horizontal) */}
                    <path d="M150 18 C130 18, 112 40, 112 75 C112 120, 118 160, 120 220 C122 240, 138 250, 150 250 C162 250, 178 240, 180 220 C182 160, 188 120, 188 75 C188 40, 170 18, 150 18 Z" fill={hairDark} />
                    <path d="M150 22 C134 22, 116 42, 116 78 C116 122, 122 160, 124 218 C126 235, 140 245, 150 245 C160 245, 174 235, 176 218 C178 160, 184 122, 184 78 C184 42, 166 22, 150 22 Z" fill={hair} />
                    {/* Mechones definidos (sacacorchos finos) */}
                    <path d="M118 60 C110 80, 124 100, 116 125 C108 150, 124 170, 116 195 C110 215, 126 230, 124 245 C128 240, 128 220, 126 195 C124 170, 136 150, 128 125 C120 100, 134 80, 126 60 Z" fill={hairDark} />
                    <path d="M120 62 C112 82, 126 102, 118 127 C110 152, 126 172, 118 197 C112 217, 128 232, 126 247 C130 242, 130 222, 128 197 C126 172, 138 152, 130 127 C122 102, 136 82, 128 62 Z" fill={hairMid} />
                    <path d="M182 60 C190 80, 176 100, 184 125 C192 150, 176 170, 184 195 C190 215, 174 230, 176 245 C172 240, 172 220, 174 195 C176 170, 164 150, 172 125 C180 100, 166 80, 174 60 Z" fill={hairDark} />
                    <path d="M180 62 C188 82, 174 102, 182 127 C190 152, 174 172, 182 197 C188 217, 172 232, 174 247 C170 242, 170 222, 172 197 C174 172, 162 152, 170 127 C178 102, 164 82, 172 62 Z" fill={hairMid} />
                  </g>
                )}

                {/* ═══ ESTILO 3: RIZOS SUELTOS CON VOLUMEN ═══ */}
                {hStyle === 'rizos_sueltos' && (
                  <g>
                    <path d="M150 18 C128 18, 112 40, 112 80 C112 130, 118 180, 124 240 C128 255, 140 260, 150 260 C160 260, 172 255, 176 240 C182 180, 188 130, 188 80 C188 40, 172 18, 150 18 Z" fill={hairDark} />
                    <path d="M150 22 C132 22, 116 42, 116 82 C116 132, 122 180, 128 238 C132 252, 142 255, 150 255 C158 255, 168 252, 172 238 C178 180, 184 132, 184 82 C184 42, 168 22, 150 22 Z" fill={hair} />
                    {/* Rizos reales elásticos en forma S más apretados */}
                    <path d="M120 46 C112 68, 122 92, 116 118 C110 144, 122 166, 116 192 C112 216, 126 238, 120 258 C124 252, 128 230, 126 194 C124 158, 134 140, 124 116 C114 92, 130 70, 122 48 Z" fill={hairDark} opacity="0.86" />
                    <path d="M124 48 C116 70, 126 94, 120 120 C114 146, 126 168, 120 194 C116 218, 130 240, 124 260 C128 254, 132 232, 130 196 C128 160, 138 142, 128 118 C118 94, 134 72, 126 50 Z" fill={hairMid} />
                    <path d="M180 46 C188 68, 178 92, 184 118 C190 144, 178 166, 184 192 C188 216, 174 238, 180 258 C176 252, 172 230, 174 194 C176 158, 166 140, 176 116 C186 92, 170 70, 178 48 Z" fill={hairDark} opacity="0.86" />
                    <path d="M176 48 C184 70, 174 94, 180 120 C186 146, 174 168, 180 194 C184 218, 170 240, 176 260 C172 254, 168 232, 170 196 C172 160, 162 142, 172 118 C182 94, 166 72, 174 50 Z" fill={hairMid} />
                  </g>
                )}

                {/* ═══ ESTILO 4: RIZOS EN CAPAS ═══ */}
                {hStyle === 'rizos_capas' && (
                  <g>
                    <path d="M150 18 C130 18, 114 35, 114 70 C114 110, 118 150, 122 195 C124 210, 138 215, 150 215 C162 215, 176 210, 178 195 C182 150, 186 110, 186 70 C186 35, 170 18, 150 18 Z" fill={hairDark} />
                    <path d="M150 22 C134 22, 118 38, 118 72 C118 112, 122 150, 126 193 C128 205, 140 210, 150 210 C160 210, 172 205, 174 193 C178 150, 182 112, 182 72 C182 38, 166 22, 150 22 Z" fill={hair} />
                    {/* Capas asimétricas refinadas */}
                    <path d="M120 46 C112 60, 122 75, 115 90 C108 105, 124 125, 118 150 C122 145, 126 120, 124 95 C122 70, 130 60, 124 46 Z" fill={hairDark} opacity="0.8" />
                    <path d="M122 48 C114 62, 124 77, 117 92 C110 107, 126 127, 120 152 C124 147, 128 122, 126 97 C124 72, 132 62, 126 48 Z" fill={hairMid} />
                    <path d="M180 46 C188 60, 178 75, 185 90 C192 105, 176 125, 182 150 C178 145, 174 120, 176 95 C178 70, 170 60, 176 46 Z" fill={hairDark} opacity="0.8" />
                    <path d="M178 48 C186 62, 176 77, 183 92 C190 107, 174 127, 180 152 C176 147, 172 122, 174 97 C176 72, 168 62, 174 48 Z" fill={hairMid} />
                  </g>
                )}

                {/* ═══ ESTILO 5: RIZOS LARGOS CON FLEQUILLO CORTINA ═══ */}
                {hStyle === 'rizos_largos_flequillo' && (
                  <g>
                    {/* Silueta sólida estrecha */}
                    <path d="M150 18 C128 18, 112 36, 112 70 C112 120, 116 160, 120 220 C124 240, 138 250, 150 250 C162 250, 176 240, 180 220 C184 160, 188 120, 188 70 C188 36, 172 18, 150 18 Z" fill={hairDark} />
                    <path d="M150 22 C132 22, 116 38, 116 72 C116 122, 120 160, 124 218 C126 235, 140 245, 150 245 C160 245, 174 235, 176 218 C180 160, 184 122, 184 72 C184 38, 168 22, 150 22 Z" fill={hair} />
                    {/* Mechón S L */}
                    <path d="M118 46 C110 66, 120 88, 114 115 C108 142, 122 170, 116 200 C112 220, 126 235, 122 255 C126 248, 130 225, 126 195 C122 165, 132 145, 124 115 C116 85, 130 65, 122 48 Z" fill={hairDark} opacity="0.86" />
                    <path d="M122 48 C114 68, 124 90, 118 117 C112 144, 126 172, 120 202 C116 222, 130 237, 126 257 C130 250, 134 227, 130 197 C126 167, 136 147, 128 117 C120 87, 134 67, 126 50 Z" fill={hairMid} />
                    {/* Mechón S R */}
                    <path d="M182 46 C190 66, 180 88, 186 115 C192 142, 178 170, 184 200 C188 220, 174 235, 178 255 C174 248, 170 225, 174 195 C178 165, 168 145, 176 115 C184 85, 170 65, 178 48 Z" fill={hairDark} opacity="0.86" />
                    <path d="M178 48 C186 68, 176 90, 182 117 C188 144, 174 172, 180 202 C184 222, 170 237, 174 257 C170 250, 166 227, 170 197 C174 167, 164 147, 172 117 C180 87, 166 67, 174 50 Z" fill={hairMid} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS VOLUMINOSOS SALVAJES ── */}
                {hStyle === 'rizos_leona' && (
                  <g>
                    {/* Cúpula base - Volumen dramáticamente reducido, pegado a la cabeza */}
                    <path d="M120 56 C116 38,124 22,150 22 C176 22,184 38,180 56 C176 46,164 42,150 42 C136 42,124 46,120 56Z" fill={hair} />
                    {/* Mechón L frontal (Pegado) */}
                    <path d="M122 50 C118 60,116 74,120 84 C122 78,126 66,124 50Z" fill={hairDark} opacity="0.9" />
                    <path d="M124 52 C120 62,118 76,122 86 C124 80,128 68,126 52Z" fill={hairMid} />
                    {/* Mechón R frontal (Pegado) */}
                    <path d="M178 50 C182 60,184 74,180 84 C178 78,174 66,176 50Z" fill={hairDark} opacity="0.9" />
                    <path d="M176 52 C180 62,182 76,178 86 C176 80,172 68,174 52Z" fill={hairMid} />
                    {/* Rizos cayendo (estrechos y bien definidos S) */}
                    <path d="M120 58 C114 74,118 90,112 108 C108 120,112 135,108 150 C108 160,114 165,120 165 C120 155,116 145,120 132 C124 118,120 105,124 90 C126 78,124 66,120 58Z" fill={hairDark} opacity="0.88" />
                    <path d="M122 60 C116 76,120 92,114 110 C110 122,114 137,110 152 C110 162,116 167,122 167 C122 157,118 147,122 134 C126 120,122 107,126 92 C128 80,126 68,122 60Z" fill={hair} />
                    
                    <path d="M180 58 C186 74,182 90,188 108 C192 120,188 135,192 150 C192 160,186 165,180 165 C180 155,184 145,180 132 C176 118,180 105,176 90 C174 78,176 66,180 58Z" fill={hairDark} opacity="0.88" />
                    <path d="M178 60 C184 76,180 92,186 110 C190 122,186 137,190 152 C190 162,184 167,178 167 C178 157,182 147,178 134 C174 120,178 107,174 92 C172 80,174 68,178 60Z" fill={hair} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS DEFINIDOS NATURALES ── */}
                {hStyle === 'rizos_definidos' && (
                  <g>
                    {/* Cúpula base - Volumen reducido dramáticamente */}
                    <path d="M122 54 C118 38,126 24,150 24 C174 24,182 38,178 54 C174 46,164 42,150 42 C136 42,126 46,122 54Z" fill={hair} />
                    {/* Flequillo asimétrico natural pegado a la frente */}
                    <path d="M124 50 C124 64,130 74,136 84 C138 88,142 86,140 80 C138 72,132 60,132 50Z" fill={hairDark} />
                    <path d="M126 50 C126 64,132 74,138 84 C140 88,144 86,142 80 C140 72,134 60,134 50Z" fill={hairMid} />
                    
                    <path d="M136 48 C140 60,146 72,154 80 C156 84,160 82,158 76 C154 68,148 58,146 48Z" fill={hairDark} />
                    <path d="M138 48 C142 60,148 72,156 80 C158 84,162 82,160 76 C156 68,150 58,148 48Z" fill={hairMid} />
                    
                    <path d="M176 50 C172 62,168 70,162 80 C160 84,156 82,158 76 C162 68,166 58,168 50Z" fill={hairDark} />
                    <path d="M174 50 C170 62,166 70,160 80 C158 84,154 82,156 76 C160 68,164 58,166 50Z" fill={hairMid} />

                    {/* Rizos S laterales que caen cerca del rostro */}
                    <path d="M120 60 C114 74, 118 90, 112 105 C108 115, 112 130, 108 142 C106 148, 112 152, 116 150 C118 144, 114 132, 118 122 C122 110, 118 98, 122 85 C124 75, 122 65, 120 60Z" fill={hairDark} />
                    <path d="M122 62 C116 76, 120 92, 114 107 C110 117, 114 132, 110 144 C108 150, 114 154, 118 152 C120 146, 116 134, 120 124 C124 112, 120 100, 124 87 C126 77, 124 67, 122 62Z" fill={hair} />

                    <path d="M180 60 C186 74, 182 90,188 105 C192 115,188 130,192 142 C194 148,188 152,184 150 C182 144,186 132,182 122 C178 110,182 98,178 85 C176 75,178 65,180 60Z" fill={hairDark} />
                    <path d="M178 62 C184 76, 180 92,186 107 C190 117,186 132,190 144 C192 150,186 154,182 152 C180 146,184 134,180 124 C176 112,180 100,176 87 C174 77,176 67,178 62Z" fill={hair} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS SUELTOS CON VOLUMEN (REDiseñados sin exceso de volumen) ── */}
                {hStyle === 'rizos_sueltos' && (
                  <g>
                    {/* Cúpula ajustada */}
                    <path d="M122 54 C118 36,128 22,150 22 C172 22,182 36,178 54 C172 46,164 42,150 42 C136 42,128 46,122 54Z" fill={hair} />
                    {/* Mechones Rizados S Lados */}
                    <path d="M118 56 C112 70, 116 85, 110 100 C106 112, 112 126, 108 140 C106 146, 112 150, 116 148 C118 140, 114 128, 118 118 C122 105, 118 94, 122 82 C124 72, 122 62, 118 56Z" fill={hairDark} opacity="0.9" />
                    <path d="M120 58 C114 72, 118 87, 112 102 C108 114, 114 128, 110 142 C108 148, 114 152, 118 150 C120 142, 116 130, 120 120 C124 107, 120 96, 124 84 C126 74, 124 64, 120 58Z" fill={hairMid} />
                    
                    <path d="M182 56 C188 70, 184 85, 190 100 C194 112, 188 126,192 140 C194 146,188 150,184 148 C182 140,186 128,182 118 C178 105,182 94,178 82 C176 72,178 62,182 56Z" fill={hairDark} opacity="0.9" />
                    <path d="M180 58 C186 72, 182 87, 188 102 C192 114, 186 128,190 142 C192 148,186 152,182 150 C180 142,184 130,180 120 C176 107,180 96,176 84 C174 74,176 64,180 58Z" fill={hairMid} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS EN CAPAS ── */}
                {hStyle === 'rizos_capas' && (
                  <g>
                    <path d="M122 56 C118 38,126 24,150 24 C174 24,182 38,178 56 C172 48,162 44,150 44 C138 44,128 48,122 56Z" fill={hair} />
                    <path d="M118 56 C114 70, 118 84, 114 96 C112 104, 116 108, 120 104 C122 96, 118 86, 122 76 C124 68, 122 62, 118 56Z" fill={hairDark} opacity="0.85" />
                    <path d="M120 58 C116 72, 120 86, 116 98 C114 106, 118 110, 122 106 C124 98, 120 88, 124 78 C126 70, 124 64, 120 58Z" fill={hairMid} />
                    
                    <path d="M182 56 C186 70, 182 84, 186 96 C188 104, 184 108, 180 104 C178 96, 182 86, 178 76 C176 68,178 62,182 56Z" fill={hairDark} opacity="0.85" />
                    <path d="M180 58 C184 72, 180 86, 184 98 C186 106, 182 110, 178 106 C176 98, 180 88, 176 78 C174 70,176 64,180 58Z" fill={hairMid} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS LARGOS CON FLEQUILLO CORTINA ── */}
                {hStyle === 'rizos_largos_flequillo' && (
                  <g>
                    {/* Cúpula ajustada */}
                    <path d="M122 54 C118 36,128 22,150 22 C172 22,182 36,178 54 C172 46,164 42,150 42 C136 42,128 46,122 54Z" fill={hair} />
                    {/* Flequillo cortina bien definido y pegado */}
                    <path d="M142 42 C136 56, 126 70, 120 80 C118 84,122 88,126 84 C130 76, 138 64,142 42Z" fill={hairDark} opacity="0.9" />
                    <path d="M144 42 C138 56, 128 70, 122 80 C120 84,124 88,128 84 C132 76, 140 64,144 42Z" fill={hairMid} />
                    <path d="M158 42 C164 56, 174 70, 180 80 C182 84,178 88,174 84 C170 76, 162 64,158 42Z" fill={hairDark} opacity="0.9" />
                    <path d="M156 42 C162 56, 172 70, 178 80 C180 84,176 88,172 84 C168 76, 160 64,156 42Z" fill={hairMid} />
                    
                    {/* Mechones laterales en S */}
                    <path d="M120 56 C114 74, 118 92, 112 110 C108 122, 114 138, 110 152 C108 158, 114 162, 118 160 C120 152, 116 138, 120 128 C124 114, 120 100, 124 88 C126 78, 124 66, 120 56Z" fill={hairDark} opacity="0.88" />
                    <path d="M122 58 C116 76, 120 94, 114 112 C110 124, 116 140, 112 154 C110 160, 116 164, 120 162 C122 154, 118 140, 122 130 C126 116, 122 102, 126 90 C128 80, 126 68, 122 58Z" fill={hair} />
                    
                    <path d="M180 56 C186 74, 182 92,188 110 C192 122,186 138,190 152 C192 158,186 162,182 160 C180 152,184 138,180 128 C176 114,180 100,176 88 C174 78,176 66,180 56Z" fill={hairDark} opacity="0.88" />
                    <path d="M178 58 C184 76, 180 94,186 112 C190 124,184 140,188 154 C190 160,184 164,180 162 C178 154,182 140,178 130 C174 116,178 102,174 90 C172 80,174 68,178 58Z" fill={hair} />
                  </g>
                )}

                {/* ── ONDAS LARGAS GLAMOUR (MANTO CONTINUO EN S) ── */}
              {hStyle === 'ondas_largas' && (

                <g>
                  <path
                    d="M 112 50 C 90 74, 82 115, 86 160 C 88 196, 94 228, 102 254 L 198 254 C 206 228, 212 196, 214 160 C 218 115, 210 74, 188 50 Z"
                    fill={hair}
                  />
                  <g stroke={hairLight} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".85">
                    <path d="M 94 92 Q 84 130, 96 172 Q 88 214, 106 250" />
                    <path d="M 108 96 Q 98 136, 112 178 Q 104 218, 120 252" />
                    <path d="M 206 92 Q 216 130, 204 172 Q 212 214, 194 250" />
                    <path d="M 192 96 Q 202 136, 188 178 Q 196 218, 180 252" />
                    <path d="M 150 140 Q 142 180, 150 220 Q 146 240, 150 254" strokeWidth="2.2" opacity=".5" />
                  </g>
                  <g stroke={hairDark} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".6">
                    <path d="M 100 134 Q 88 174, 102 216" />
                    <path d="M 200 134 Q 212 174, 198 216" />
                  </g>
                </g>
              )}

              {/* ── 3. ONDAS PLAYERAS MEDIAS ── */}
              {hStyle === 'ondas_medias' && (
                <g>
                  <path
                    d="M 114 50 C 96 74, 90 108, 94 148 C 96 178, 102 202, 108 220 L 192 220 C 198 202, 204 178, 206 148 C 210 108, 204 74, 186 50 Z"
                    fill={hair}
                  />
                  <path d="M 100 88 Q 90 124, 102 160 Q 94 192, 106 216" stroke={hairLight} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".8" />
                  <path d="M 200 88 Q 210 124, 198 160 Q 206 192, 194 216" stroke={hairLight} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".8" />
                </g>
              )}

              {/* ── 4. BOB RIZADO & RIZOS MEDIOS ── */}
              {(hStyle === 'curly_bob_flequillo' || hStyle === 'curly_3b_angie') && (
                <g>
                  <path
                    d="M 112 52 C 94 70, 86 100, 90 134 C 92 156, 100 178, 110 188 L 190 188 C 200 178, 208 156, 210 134 C 214 100, 206 70, 188 52 Z"
                    fill={hair}
                  />
                  <g stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".85">
                    <path d="M 96 82 Q 86 102, 94 122 Q 88 144, 98 166 Q 94 178, 104 186" />
                    <path d="M 106 90 Q 98 112, 106 132 Q 100 154, 112 176" />
                    <path d="M 204 82 Q 214 102, 206 122 Q 212 144, 202 166 Q 206 178, 196 186" />
                    <path d="M 194 90 Q 202 112, 194 132 Q 200 154, 188 176" />
                  </g>
                  <g stroke={hairDark} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5">
                    <path d="M 92 108 Q 98 126, 92 146" />
                    <path d="M 208 108 Q 202 126, 208 146" />
                  </g>
                </g>
              )}

              {/* ── 5. LISO LARGO SEDOSO ── */}
              {(hStyle === 'liso_largo_sedoso' || hStyle === 'liso_largo_flequillo' || hStyle === 'liso_cortina') && (
                <g>
                  <path
                    d="M 116 50 C 104 80, 100 130, 104 180 C 106 215, 112 245, 120 258 L 180 258 C 188 245, 194 215, 196 180 C 200 130, 196 80, 184 50 Z"
                    fill={hair}
                  />
                  <path d="M 108 90 L 112 245" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
                  <path d="M 192 90 L 188 245" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
                  <path d="M 116 110 L 120 250" stroke="#ffffff" strokeWidth="1.2" opacity=".25" />
                  <path d="M 184 110 L 180 250" stroke="#ffffff" strokeWidth="1.2" opacity=".25" />
                </g>
              )}

              {/* ── 6. AFRO VOLUMINOSO HALO ── */}
              {(hStyle === 'afro_voluminoso' || hStyle === 'afro_4b_volumen') && (
                <g>
                  <path
                    d="M 104 74 C 88 56, 92 34, 112 22 C 130 12, 170 12, 188 22 C 208 34, 212 56, 196 74 C 208 92, 204 114, 190 120 C 176 126, 124 126, 110 120 C 96 114, 92 92, 104 74 Z"
                    fill={hair}
                  />
                  <g stroke={hairLight} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".65">
                    <path d="M 104 46 Q 112 32, 128 26 Q 150 18, 172 26 Q 188 32, 196 46" />
                    <path d="M 96 66 Q 90 82, 98 98 Q 108 114, 126 118" />
                    <path d="M 204 66 Q 210 82, 202 98 Q 192 114, 174 118" />
                  </g>
                </g>
              )}

              {/* ── 7. BOX BRAIDS Y DREADLOCKS ── */}
              {(hStyle === 'box_braids' || hStyle === 'dreadlocks') && (
                <g stroke={hair} strokeWidth="4.5" strokeLinecap="round">
                  <path d="M 112 60 L 102 210" />
                  <path d="M 118 55 L 108 235" />
                  <path d="M 182 55 L 192 235" />
                  <path d="M 188 60 L 198 210" />
                  <circle cx="104" cy="180" r="3" fill="#d4af37" stroke="none" />
                  <circle cx="196" cy="180" r="3" fill="#d4af37" stroke="none" />
                  <circle cx="108" cy="220" r="3" fill="#d4af37" stroke="none" />
                  <circle cx="192" cy="220" r="3" fill="#d4af37" stroke="none" />
                </g>
              )}

              {/* ── 8. COLETA ALTA DINÁMICA ── */}
              {hStyle === 'high_ponytail' && (
                <g>
                  <path d="M 152 24 Q 194 12, 204 46 Q 214 92, 208 144 Q 200 120, 196 90 Q 186 50, 158 32 Z" fill={hair} />
                  <path d="M 166 26 Q 198 28, 206 58 Q 212 96, 206 140" stroke={hairLight} strokeWidth="2.5" fill="none" opacity=".8" />
                  <ellipse cx="156" cy="26" rx="5" ry="4" fill="#fbbf24" />
                </g>
              )}

              {/* ── 9. CHONGO BONITO ── */}
              {(hStyle === 'chongo_bonito' || hStyle === 'messy_bun') && (
                <g>
                  <ellipse cx="150" cy="14" rx="20" ry="16" fill={hair} />
                  <circle cx="144" cy="12" r="11" fill={hairLight} opacity=".7" />
                  <circle cx="156" cy="14" r="10" fill={hairDark} opacity=".6" />
                  <ellipse cx="150" cy="23" rx="14" ry="4.5" fill="#7c3aed" />
                </g>
              )}
            </g>

            {/* ── 1. Piernas y Calzado ── */}
            {/* CORREGIDO: Sin transform="none" para evitar errores en consola */}
            <g transform={isSeated ? "translate(0,-30)" : undefined}>
              {isSeated ? (
                <g>
                  {/* 1. Sombra de contacto en el suelo */}
                  <ellipse cx="150" cy="314" rx="96" ry="14" fill="#000000" opacity="0.16" />

                  {/* 2. Base de Pelvis y Cadera en flor de loto */}
                  <path 
                    d="M 124 206 C 110 220, 100 238, 106 256 C 114 276, 136 288, 150 288 C 164 288, 186 276, 194 256 C 200 238, 190 220, 176 206 Z" 
                    fill={isBareLegs ? skinShadow : bottomShadow} 
                  />

                  {/* 3. Muslo y Rodilla Izquierda (apoyada en el suelo) */}
                  <path 
                    d="M 124 206 C 94 210, 62 232, 54 258 C 46 282, 58 300, 84 304 C 110 306, 142 292, 160 278 C 132 274, 110 254, 116 230 C 120 216, 122 208, 124 206 Z" 
                    fill={isBareLegs ? skin : bottomColor} 
                  />
                  <path 
                    d="M 56 268 C 62 290, 82 300, 106 302 C 90 298, 74 286, 68 268 Z" 
                    fill={isBareLegs ? skinShadow : bottomShadow} 
                    opacity="0.45" 
                  />

                  {/* 4. Muslo y Rodilla Derecha (apoyada en el suelo) */}
                  <path 
                    d="M 176 206 C 206 210, 238 232, 246 258 C 254 282, 242 300, 216 304 C 190 306, 158 292, 140 278 C 168 274, 190 254, 184 230 C 180 216, 178 208, 176 206 Z" 
                    fill={isBareLegs ? skin : bottomColor} 
                  />
                  <path 
                    d="M 244 268 C 238 290, 218 300, 194 302 C 210 298, 226 286, 232 268 Z" 
                    fill={isBareLegs ? skinShadow : bottomShadow} 
                    opacity="0.45" 
                  />

                  {/* 5. Pantorrilla Cruzada Inferior (Pierna derecha cruzando por debajo) */}
                  <path 
                    d="M 226 286 C 210 300, 178 308, 145 308 C 120 308, 96 300, 86 288 C 96 282, 120 286, 145 288 C 176 290, 206 284, 226 286 Z" 
                    fill={isBareLegs ? skinShadow : bottomShadow} 
                  />

                  {/* 6. Pantorrilla Cruzada Superior en Flor de Loto (Pierna izquierda descansando al frente) */}
                  <path 
                    d="M 72 284 C 88 296, 118 306, 150 306 C 182 306, 212 296, 228 284 C 216 274, 186 278, 150 278 C 114 278, 84 274, 72 284 Z" 
                    fill={isBareLegs ? skin : bottomColor} 
                  />

                  {/* Pliegues de flexión y articulación en loto */}
                  <path 
                    d="M 90 288 C 122 300, 178 300, 210 288" 
                    stroke={isBareLegs ? skinShadow : bottomShadow} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.6" 
                  />
                  <path 
                    d="M 120 274 C 138 282, 162 282, 180 274" 
                    stroke={isBareLegs ? skinShadow : bottomShadow} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.45" 
                  />

                  {/* 7. Calzado Izquierdo (descansando de lado en postura cruzada) */}
                  <g transform="translate(180, 295) rotate(-12)">
                    <path d="M 0 12 Q 18 16 36 11 L 35 15 Q 18 19 0 15 Z" fill="#ffffff" />
                    <path d="M 0 15 Q 18 19 35 15" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <path d="M 2 12 C 2 6, 8 2, 16 3 C 24 4, 30 7, 34 11 Z" fill={shoesColor} />
                    <ellipse cx="6" cy="11" rx="4.5" ry="2.5" fill="#ffffff" opacity="0.9" />
                    <line x1="14" y1="5" x2="18" y2="9" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="18" y1="6" x2="22" y2="10" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                  </g>

                  {/* 8. Calzado Derecho (descansando de lado en postura cruzada) */}
                  <g transform="translate(84, 295) rotate(12)">
                    <path d="M 0 11 Q 18 16 36 12 L 36 15 Q 18 19 1 15 Z" fill="#ffffff" />
                    <path d="M 1 15 Q 18 19 36 15" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <path d="M 2 11 C 6 7, 12 4, 20 3 C 28 2, 34 6, 34 12 Z" fill={shoesColor} />
                    <ellipse cx="30" cy="11" rx="4.5" ry="2.5" fill="#ffffff" opacity="0.9" />
                    <line x1="18" y1="5" x2="14" y2="9" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="22" y1="6" x2="18" y2="10" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                </g>
              ) : (
                <g>
                  <path
                    d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 4} 230, 122 280, 124 348 C 124 356, 128 362, 140 362 L 148 362 L 148 266 L 150 206 Z`}
                    fill={isBareLegs ? skin : bottomColor}
                  />
                  <path
                    d={`M ${bodyMods.waistR} 206 C ${bodyMods.hipR + 4} 230, 178 280, 176 348 C 176 356, 172 362, 160 362 L 152 362 L 152 266 L 150 206 Z`}
                    fill={isBareLegs ? skin : bottomColor}
                  />

                  {isBareLegs && (
                    <g fill={skinShadow} opacity=".4">
                      <ellipse cx="134" cy="280" rx="5.5" ry="3.5" />
                      <ellipse cx="166" cy="280" rx="5.5" ry="3.5" />
                    </g>
                  )}

                  {/* MEDIAS / MALLAS DE RED (Fishnet Stockings) si se eligen botas con red */}
                  {shoesType === 'botas_malla_red' && isBareLegs && (
                    <g stroke="#18181b" strokeWidth="0.8" opacity="0.65">
                      {/* Pierna Izquierda */}
                      <line x1="120" y1="230" x2="148" y2="258" />
                      <line x1="120" y1="245" x2="148" y2="273" />
                      <line x1="122" y1="260" x2="148" y2="286" />
                      <line x1="123" y1="275" x2="148" y2="300" />
                      <line x1="124" y1="290" x2="148" y2="314" />
                      <line x1="124" y1="305" x2="148" y2="329" />
                      <line x1="124" y1="320" x2="148" y2="344" />
                      <line x1="148" y1="230" x2="120" y2="258" />
                      <line x1="148" y1="245" x2="120" y2="273" />
                      <line x1="148" y1="260" x2="122" y2="286" />
                      <line x1="148" y1="275" x2="123" y2="300" />
                      <line x1="148" y1="290" x2="124" y2="314" />
                      <line x1="148" y1="305" x2="124" y2="329" />
                      <line x1="148" y1="320" x2="124" y2="344" />

                      {/* Pierna Derecha */}
                      <line x1="152" y1="230" x2="180" y2="258" />
                      <line x1="152" y1="245" x2="180" y2="273" />
                      <line x1="152" y1="260" x2="178" y2="286" />
                      <line x1="152" y1="275" x2="177" y2="300" />
                      <line x1="152" y1="290" x2="176" y2="314" />
                      <line x1="152" y1="305" x2="176" y2="329" />
                      <line x1="152" y1="320" x2="176" y2="344" />
                      <line x1="180" y1="230" x2="152" y2="258" />
                      <line x1="180" y1="245" x2="152" y2="273" />
                      <line x1="178" y1="260" x2="152" y2="286" />
                      <line x1="177" y1="275" x2="152" y2="300" />
                      <line x1="176" y1="290" x2="152" y2="314" />
                      <line x1="176" y1="305" x2="152" y2="329" />
                      <line x1="176" y1="320" x2="152" y2="344" />
                    </g>
                  )}

                  {/* CAÑA ALTA DE BOTAS HASTA LA RODILLA */}
                  {shoesType === 'botas_altas' && (
                    <g>
                      {/* Bota Izquierda */}
                      <path d="M 124 280 C 121 300, 122 342, 120 360 L 146 360 C 147 342, 147 300, 145 280 Z" fill={shoesColor} />
                      <ellipse cx="134.5" cy="280" rx="10.5" ry="3.5" fill={shadeColor(shoesColor, 15)} stroke={shadeColor(shoesColor, -25)} strokeWidth="1" />
                      <line x1="144" y1="284" x2="142" y2="356" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2,2" />
                      {/* Bota Derecha */}
                      <path d="M 155 280 C 153 300, 153 342, 154 360 L 180 360 C 178 342, 179 300, 176 280 Z" fill={shoesColor} />
                      <ellipse cx="165.5" cy="280" rx="10.5" ry="3.5" fill={shadeColor(shoesColor, 15)} stroke={shadeColor(shoesColor, -25)} strokeWidth="1" />
                      <line x1="156" y1="284" x2="158" y2="356" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2,2" />
                    </g>
                  )}

                  {/* CAÑA DE BOTAS VAQUERAS WESTERN */}
                  {shoesType === 'botas_vaqueras' && (
                    <g>
                      {/* Bota Izquierda */}
                      <path d="M 124 300 Q 134 308, 144 300 L 145 360 L 120 360 Z" fill={shoesColor} />
                      <path d="M 127 312 Q 134 322, 141 312" stroke={shadeColor(shoesColor, 35)} strokeWidth="1.2" fill="none" />
                      <path d="M 128 324 Q 134 334, 140 324" stroke={shadeColor(shoesColor, 35)} strokeWidth="1.2" fill="none" />
                      {/* Bota Derecha */}
                      <path d="M 156 300 Q 166 308, 176 300 L 180 360 L 155 360 Z" fill={shoesColor} />
                      <path d="M 159 312 Q 166 322, 173 312" stroke={shadeColor(shoesColor, 35)} strokeWidth="1.2" fill="none" />
                      <path d="M 160 324 Q 166 334, 172 324" stroke={shadeColor(shoesColor, 35)} strokeWidth="1.2" fill="none" />
                    </g>
                  )}

                  {/* ══════════ COLECCIÓN DE PRENDAS INFERIORES (SOLO SI NO ES VESTIDO) ══════════ */}
                  {!isDress && (
                    <g>
                      {/* 1. JEANS CLÁSICOS DENIM */}
                      {bottomType === 'jeans_clasicos' && (
                        <g>
                          {/* Bolsillos curvos con costuras ámbar */}
                          <path d={`M ${bodyMods.waistL + 3} 208 C ${bodyMods.waistL + 4} 218, 138 224, 143 220`} stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.85" />
                          <path d={`M ${bodyMods.waistR - 3} 208 C ${bodyMods.waistR - 4} 218, 162 224, 157 220`} stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.85" />
                          {/* Remaches de cobre/bronce */}
                          <circle cx={bodyMods.waistL + 4} cy="208" r="1.1" fill="#f59e0b" />
                          <circle cx="143" cy="220" r="1.1" fill="#f59e0b" />
                          <circle cx={bodyMods.waistR - 4} cy="208" r="1.1" fill="#f59e0b" />
                          <circle cx="157" cy="220" r="1.1" fill="#f59e0b" />
                          {/* Bragueta / pespunte */}
                          <path d="M 150 206 L 150 220 Q 150 226, 146 228" stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.85" />
                        </g>
                      )}

                      {/* 2. JEANS DE LONA RASGADOS / ROTOS */}
                      {bottomType === 'jeans_rotos' && (
                        <g>
                          {/* Bolsillos y bragueta */}
                          <path d={`M ${bodyMods.waistL + 3} 208 C ${bodyMods.waistL + 4} 218, 138 224, 143 220`} stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.8" />
                          <path d={`M ${bodyMods.waistR - 3} 208 C ${bodyMods.waistR - 4} 218, 162 224, 157 220`} stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.8" />
                          <path d="M 150 206 L 150 220 Q 150 226, 146 228" stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.8" />
                          {/* Rasgadura en rodilla izquierda */}
                          <path d="M 128 274 L 140 274" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                          <path d="M 129 278 L 139 278" stroke={skin} strokeWidth="2.6" strokeLinecap="round" />
                          <path d="M 130 282 L 138 282" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                          {/* Rasgadura en rodilla derecha */}
                          <path d="M 160 278 L 172 278" stroke={skin} strokeWidth="2.6" strokeLinecap="round" />
                          <path d="M 161 275 L 171 275" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M 162 282 L 170 282" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                          {/* Desgaste en muslo izquierdo */}
                          <path d="M 128 240 L 138 240" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
                        </g>
                      )}

                      {/* 3. MOM JEANS DE TIRO ALTO */}
                      {bottomType === 'jeans_tiro_alto' && (
                        <g>
                          {/* Pretina alta */}
                          <path d={`M ${bodyMods.waistL - 1} 199 L ${bodyMods.waistR + 1} 199 L ${bodyMods.waistR} 208 L ${bodyMods.waistL} 208 Z`} fill={bottomColor} />
                          {/* Cinturón de cuero oscuro */}
                          <rect x={bodyMods.waistL} y="201" width={bodyMods.waistR - bodyMods.waistL} height="5" fill="#3d2314" rx="1" />
                          {/* Hebilla metálica plateada */}
                          <rect x="147" y="199.5" width="6" height="8" rx="1.2" fill="none" stroke="#e2e8f0" strokeWidth="1.4" />
                          <line x1="150" y1="200" x2="150" y2="207" stroke="#e2e8f0" strokeWidth="1" />
                          {/* Bolsillos profundos */}
                          <path d={`M ${bodyMods.waistL + 3} 208 Q 140 215, 142 226`} stroke="#d97706" strokeWidth="1.2" fill="none" />
                          <path d={`M ${bodyMods.waistR - 3} 208 Q 160 215, 158 226`} stroke="#d97706" strokeWidth="1.2" fill="none" />
                        </g>
                      )}

                      {/* 4. JEANS ACAMPANADOS FLARE */}
                      {bottomType === 'jeans_acampanados' && (
                        <g>
                          {/* Campana exterior que se abre desde las rodillas */}
                          <path d="M 125 296 C 123 318, 114 346, 112 356 L 146 356 L 148 296 Z" fill={bottomColor} />
                          <path d="M 175 296 C 177 318, 186 346, 188 356 L 154 356 L 152 296 Z" fill={bottomColor} />
                          <path d="M 112 356 Q 129 359, 146 356" stroke={bottomShadow} strokeWidth="1.8" fill="none" />
                          <path d="M 154 356 Q 171 359, 188 356" stroke={bottomShadow} strokeWidth="1.8" fill="none" />
                        </g>
                      )}

                      {/* 5. PANTALÓN CARGO TÁCTICO */}
                      {bottomType === 'cargo' && (
                        <g>
                          {/* Bolsillos fuelle en muslo izquierdo */}
                          <rect x={bodyMods.hipL - 6} y="246" width="11" height="26" rx="2.5" fill={bottomShadow} />
                          <rect x={bodyMods.hipL - 7} y="244" width="13" height="7" rx="1.8" fill={bottomColor} stroke={bottomShadow} strokeWidth="1" />
                          <circle cx={bodyMods.hipL - 0.5} cy="247.5" r="1.1" fill={bottomShadow} />
                          {/* Bolsillos fuelle en muslo derecho */}
                          <rect x={bodyMods.hipR - 5} y="246" width="11" height="26" rx="2.5" fill={bottomShadow} />
                          <rect x={bodyMods.hipR - 6} y="244" width="13" height="7" rx="1.8" fill={bottomColor} stroke={bottomShadow} strokeWidth="1" />
                          <circle cx={bodyMods.hipR + 0.5} cy="247.5" r="1.1" fill={bottomShadow} />
                        </g>
                      )}

                      {/* 6. JOGGERS DEPORTIVOS */}
                      {bottomType === 'joggers' && (
                        <g>
                          {/* Cintura elástica fruncida */}
                          <path d={`M ${bodyMods.waistL} 206 Q 150 209, ${bodyMods.waistR} 206`} stroke={bottomShadow} strokeWidth="3" fill="none" opacity="0.6" />
                          {/* Cordones blancos con topes */}
                          <path d="M 148 208 Q 146 216, 145 222" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                          <path d="M 152 208 Q 154 216, 155 222" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                          <circle cx="145" cy="222" r="1.2" fill="#cbd5e1" />
                          <circle cx="155" cy="222" r="1.2" fill="#cbd5e1" />
                          {/* Puños elásticos en tobillos */}
                          <rect x="122" y="344" width="26" height="8" rx="2" fill={bottomShadow} />
                          <rect x="152" y="344" width="26" height="8" rx="2" fill={bottomShadow} />
                        </g>
                      )}

                      {/* 7. PANTALÓN SASTRE DE VESTIR */}
                      {bottomType === 'pantalon_vestir' && (
                        <g>
                          {/* Raya de planchado formal central */}
                          <line x1="135" y1="214" x2="135" y2="356" stroke={bottomLight} strokeWidth="1.2" opacity="0.4" />
                          <line x1="136" y1="214" x2="136" y2="356" stroke={bottomShadow} strokeWidth="1.2" opacity="0.5" />
                          <line x1="165" y1="214" x2="165" y2="356" stroke={bottomLight} strokeWidth="1.2" opacity="0.4" />
                          <line x1="164" y1="214" x2="164" y2="356" stroke={bottomShadow} strokeWidth="1.2" opacity="0.5" />
                          {/* Bolsillos inclinados italianos */}
                          <line x1={bodyMods.waistL + 2} y1="208" x2={bodyMods.waistL + 9} y2="226" stroke={bottomShadow} strokeWidth="1.8" />
                          <line x1={bodyMods.waistR - 2} y1="208" x2={bodyMods.waistR - 9} y2="226" stroke={bottomShadow} strokeWidth="1.8" />
                        </g>
                      )}

                      {/* 8. PANTS DEPORTIVOS CON FRANJAS LATERALES */}
                      {bottomType === 'pants_deportivos' && (
                        <g>
                          {/* Doble franja blanca en pierna izquierda */}
                          <path d={`M ${bodyMods.waistL + 1} 206 C ${bodyMods.hipL - 3} 230, 123 280, 125 356`} stroke="#ffffff" strokeWidth="2.4" fill="none" opacity="0.95" />
                          <path d={`M ${bodyMods.waistL + 4} 206 C ${bodyMods.hipL} 230, 126 280, 128 356`} stroke="#ffffff" strokeWidth="1.4" fill="none" opacity="0.9" />
                          {/* Doble franja blanca en pierna derecha */}
                          <path d={`M ${bodyMods.waistR - 1} 206 C ${bodyMods.hipR + 3} 230, 177 280, 175 356`} stroke="#ffffff" strokeWidth="2.4" fill="none" opacity="0.95" />
                          <path d={`M ${bodyMods.waistR - 4} 206 C ${bodyMods.hipR} 230, 174 280, 172 356`} stroke="#ffffff" strokeWidth="1.4" fill="none" opacity="0.9" />
                        </g>
                      )}

                      {/* 9. LEGGINGS DEPORTIVOS */}
                      {bottomType === 'leggings' && (
                        <g>
                          <path d="M 148 240 L 148 354" stroke={bottomShadow} strokeWidth="1.2" opacity="0.4" />
                          <path d="M 152 240 L 152 354" stroke={bottomShadow} strokeWidth="1.2" opacity="0.4" />
                        </g>
                      )}

                      {/* 10. FALDA DE TABLAS PLISADA */}
                      {bottomType === 'falda_tablas' && (
                        <g>
                          <polygon points={`${bodyMods.waistL},206 108,260 192,260 ${bodyMods.waistR},206`} fill={bottomColor} />
                          <line x1={bodyMods.waistL + 6} y1="206" x2="120" y2="260" stroke={bottomShadow} strokeWidth="1.8" />
                          <line x1={bodyMods.waistL + 12} y1="206" x2="132" y2="260" stroke={bottomShadow} strokeWidth="1.8" />
                          <line x1="150" y1="206" x2="150" y2="260" stroke={bottomShadow} strokeWidth="1.8" />
                          <line x1={bodyMods.waistR - 12} y1="206" x2="168" y2="260" stroke={bottomShadow} strokeWidth="1.8" />
                          <line x1={bodyMods.waistR - 6} y1="206" x2="180" y2="260" stroke={bottomShadow} strokeWidth="1.8" />
                        </g>
                      )}

                      {/* 11. FALDA MAXI FLUIDA */}
                      {bottomType === 'falda_larga' && (
                        <g>
                          <path d={`M ${bodyMods.waistL - 1} 206 C ${bodyMods.hipL - 6} 240, 104 348, 106 354 C 134 360, 166 360, 194 354 C 196 348, ${bodyMods.hipR + 6} 240, ${bodyMods.waistR + 1} 206 Z`} fill={bottomColor} />
                          <path d="M 134 210 Q 124 280, 118 354" stroke={bottomShadow} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
                          <path d="M 150 210 Q 150 280, 150 356" stroke={bottomShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5" />
                          <path d="M 166 210 Q 176 280, 182 354" stroke={bottomShadow} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
                        </g>
                      )}

                      {/* 12. MINIFALDA DE MEZCLILLA */}
                      {bottomType === 'falda_mezclilla' && (
                        <g>
                          <polygon points={`${bodyMods.waistL},206 114,258 186,258 ${bodyMods.waistR},206`} fill={bottomColor} />
                          <line x1="150" y1="206" x2="150" y2="258" stroke={bottomShadow} strokeWidth="2" />
                          <circle cx="150" cy="214" r="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
                          <circle cx="150" cy="226" r="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
                          <circle cx="150" cy="238" r="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
                          <circle cx="150" cy="250" r="1.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
                          {/* Bolsillos tipo vaquero */}
                          <path d="M 125 212 Q 134 218, 134 230" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.8" />
                          <path d="M 175 212 Q 166 218, 166 230" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.8" />
                        </g>
                      )}

                      {/* 13. FALDA TUBO / LÁPIZ EJECUTIVA */}
                      {bottomType === 'falda_tubo' && (
                        <g>
                          <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 2} 226, 126 270, 128 280 L 172 280 C 174 270, ${bodyMods.hipR + 2} 226, ${bodyMods.waistR} 206 Z`} fill={bottomColor} />
                          <line x1="150" y1="264" x2="150" y2="280" stroke={skin} strokeWidth="1.8" />
                        </g>
                      )}

                      {/* 14. PANTALONETA / BERMUDA CASUAL */}
                      {bottomType === 'shorts_casuales' && (
                        <g>
                          <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 4} 226, 118 256, 118 256 L 146 256 L 150 216 L 154 256 L 182 256 C 182 256, ${bodyMods.hipR + 4} 226, ${bodyMods.waistR} 206 Z`} fill={bottomColor} />
                          {/* Dobladillo vuelto */}
                          <rect x="116" y="250" width="31" height="6" rx="1.5" fill={bottomShadow} opacity="0.5" />
                          <rect x="153" y="250" width="31" height="6" rx="1.5" fill={bottomShadow} opacity="0.5" />
                        </g>
                      )}

                      {/* 15. SHORTS DE RUNNING CON RIBETE */}
                      {bottomType === 'shorts_deportivos' && (
                        <g>
                          <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 4} 224, 122 246, 124 246 L 147 248 L 150 216 L 153 248 L 176 246 C 178 246, ${bodyMods.hipR + 4} 224, ${bodyMods.waistR} 206 Z`} fill={bottomColor} />
                          <path d="M 120 236 Q 122 248, 147 248" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                          <path d="M 180 236 Q 178 248, 153 248" stroke="#ffffff" strokeWidth="1.8" fill="none" />
                        </g>
                      )}

                      {/* 16. SHORTS DENIM DESHILACHADOS */}
                      {bottomType === 'shorts_mezclilla' && (
                        <g>
                          <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 4} 226, 118 252, 118 252 L 146 252 L 150 216 L 154 252 L 182 252 C 182 252, ${bodyMods.hipR + 4} 226, ${bodyMods.waistR} 206 Z`} fill={bottomColor} />
                          {/* Hilos desflecados */}
                          <path d="M 117 252 L 147 252" stroke="#ffffff" strokeWidth="1.6" strokeDasharray="3,2" />
                          <path d="M 153 252 L 183 252" stroke="#ffffff" strokeWidth="1.6" strokeDasharray="3,2" />
                          <path d="M 150 206 L 150 220 Q 150 226, 146 228" stroke="#d97706" strokeWidth="1.2" fill="none" opacity="0.8" />
                        </g>
                      )}

                      {/* 17. BIKER SHORTS CICLISTAS */}
                      {bottomType === 'shorts_biker' && (
                        <g>
                          <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 3} 228, 124 266, 124 266 L 147 266 L 150 216 L 153 266 L 176 266 C 176 266, ${bodyMods.hipR + 3} 228, ${bodyMods.waistR} 206 Z`} fill={bottomColor} />
                          <line x1="124" y1="266" x2="147" y2="266" stroke={bottomShadow} strokeWidth="1.5" />
                          <line x1="153" y1="266" x2="176" y2="266" stroke={bottomShadow} strokeWidth="1.5" />
                        </g>
                      )}
                    </g>
                  )}

                  {/* ══════════ COLECCIÓN DE FALDAS DE VESTIDOS ══════════ */}
                  {/* Falda de Vestidos Cortos (Skater, Estampado, Tirantes) */}
                  {(topType === 'vestido_corto' || topType === 'vestido_estampado' || topType === 'vestido_tirantes') && (
                    <g>
                      {/* Sombra base */}
                      <path d={`M ${bodyMods.waistL - 1} 206 C ${bodyMods.hipL - 6} 228, 108 262, 108 264 C 132 272, 168 272, 192 264 C 192 262, ${bodyMods.hipR + 6} 228, ${bodyMods.waistR + 1} 206 Z`} fill={topShadow} />
                      {/* Falda con vuelo */}
                      <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 5} 226, 110 260, 110 262 C 134 270, 166 270, 190 262 C 190 260, ${bodyMods.hipR + 5} 226, ${bodyMods.waistR} 206 Z`} fill={`url(#mTopGrad_${topColor.replace('#','')})`} />
                      {/* Pliegues de vuelo */}
                      <path d="M 130 212 Q 126 238, 122 266" stroke={topShadow} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />
                      <path d="M 150 212 Q 150 238, 150 268" stroke={topShadow} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
                      <path d="M 170 212 Q 174 238, 178 266" stroke={topShadow} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />
                      <path d="M 134 214 Q 131 238, 128 266" stroke={topLight} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
                      <path d="M 166 214 Q 169 238, 172 266" stroke={topLight} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
                      {/* Costura de cintura */}
                      <path d={`M ${bodyMods.waistL} 206 Q 150 210, ${bodyMods.waistR} 206`} stroke={topShadow} strokeWidth="2" fill="none" />
                    </g>
                  )}

                  {/* Falda de Vestidos Largos (Gala y Fiesta con Brillos) */}
                  {(topType === 'vestido_largo' || topType === 'vestido_brillos') && (
                    <g>
                      {/* Sombra base */}
                      <path d={`M ${bodyMods.waistL - 1} 206 C ${bodyMods.hipL - 6} 240, 102 348, 104 354 C 132 360, 168 360, 196 354 C 198 348, ${bodyMods.hipR + 6} 240, ${bodyMods.waistR + 1} 206 Z`} fill={topShadow} />
                      {/* Falda larga elegante */}
                      <path d={`M ${bodyMods.waistL} 206 C ${bodyMods.hipL - 5} 238, 104 346, 106 352 C 134 358, 166 358, 194 352 C 196 346, ${bodyMods.hipR + 5} 238, ${bodyMods.waistR} 206 Z`} fill={`url(#mTopGrad_${topColor.replace('#','')})`} />
                      {/* Pliegues verticales majestuosos */}
                      <path d="M 134 210 Q 124 280, 118 354" stroke={topShadow} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />
                      <path d="M 150 210 Q 150 280, 150 356" stroke={topShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.5" />
                      <path d="M 166 210 Q 176 280, 182 354" stroke={topShadow} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />
                      <path d="M 138 212 Q 130 280, 126 354" stroke={topLight} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />
                      <path d="M 162 212 Q 170 280, 174 354" stroke={topLight} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />
                      {/* Costura de cintura */}
                      <path d={`M ${bodyMods.waistL} 206 Q 150 210, ${bodyMods.waistR} 206`} stroke={topShadow} strokeWidth="2" fill="none" />
                    </g>
                  )}

                  {/* Estampados sobre falda para vestido floral */}
                  {topType === 'vestido_estampado' && (
                    <g opacity="0.95">
                      <circle cx="132" cy="235" r="3.5" fill="#fef08a" />
                      <circle cx="132" cy="235" r="1.5" fill="#f97316" />
                      <circle cx="168" cy="245" r="4" fill="#fbcfe8" />
                      <circle cx="168" cy="245" r="1.8" fill="#ec4899" />
                      <circle cx="148" cy="254" r="3.5" fill="#bae6fd" />
                      <circle cx="148" cy="254" r="1.5" fill="#0284c7" />
                      <circle cx="122" cy="250" r="3" fill="#bbf7d0" />
                      <circle cx="122" cy="250" r="1.2" fill="#16a34a" />
                      <circle cx="178" cy="236" r="3" fill="#fed7aa" />
                      <circle cx="178" cy="236" r="1.2" fill="#ea580c" />
                    </g>
                  )}

                  {/* Brillos y destellos sobre falda para vestido de noche ✨ */}
                  {topType === 'vestido_brillos' && (
                    <g opacity="0.95">
                      {/* Estrellas y destellos ✨ */}
                      <path d="M 136 240 Q 136 244 140 244 Q 136 244 136 248 Q 136 244 132 244 Q 136 244 136 240 Z" fill="#ffffff" />
                      <circle cx="136" cy="244" r="1" fill="#fef08a" />
                      <path d="M 164 265 Q 164 270 169 270 Q 164 270 164 275 Q 164 270 159 270 Q 164 270 164 265 Z" fill="#fef08a" />
                      <path d="M 148 300 Q 148 305 153 305 Q 148 305 148 310 Q 148 305 143 305 Q 148 305 148 300 Z" fill="#ffffff" />
                      <path d="M 128 325 Q 128 329 132 329 Q 128 329 128 333 Q 128 329 124 329 Q 128 329 128 325 Z" fill="#fef08a" />
                      <path d="M 172 320 Q 172 325 177 325 Q 172 325 172 330 Q 172 325 167 325 Q 172 325 172 320 Z" fill="#ffffff" />
                      {/* Partículas brillantes */}
                      <circle cx="126" cy="275" r="1.3" fill="#ffffff" opacity="0.8" />
                      <circle cx="140" cy="285" r="1.5" fill="#fef08a" opacity="0.85" />
                      <circle cx="178" cy="280" r="1.3" fill="#ffffff" opacity="0.8" />
                      <circle cx="155" cy="240" r="1.4" fill="#fef08a" opacity="0.9" />
                      <circle cx="162" cy="340" r="1.5" fill="#ffffff" opacity="0.85" />
                      <circle cx="140" cy="342" r="1.3" fill="#fef08a" opacity="0.8" />
                    </g>
                  )}

                  {/* ══════════ COLECCIÓN DE MODELOS DE CALZADO ══════════ */}
                  {/* 1. TENIS URBANOS SKATE */}
                  {shoesType === 'sneakers_urbanos' && (
                    <g>
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 115 362 L 149 362 L 148 367 L 116 367 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                      <ellipse cx="120" cy="362" rx="5.5" ry="4.5" fill="#ffffff" />
                      <line x1="126" y1="356" x2="134" y2="356" stroke="#ffffff" strokeWidth="1.4" />
                      <line x1="128" y1="359" x2="136" y2="359" stroke="#ffffff" strokeWidth="1.4" />

                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 151 362 L 185 362 L 184 367 L 152 367 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                      <ellipse cx="180" cy="362" rx="5.5" ry="4.5" fill="#ffffff" />
                      <line x1="166" y1="356" x2="174" y2="356" stroke="#ffffff" strokeWidth="1.4" />
                      <line x1="164" y1="359" x2="172" y2="359" stroke="#ffffff" strokeWidth="1.4" />
                    </g>
                  )}

                  {/* 2. TENIS DEPORTIVOS DE RUNNING */}
                  {shoesType === 'sneakers_running' && (
                    <g>
                      <ellipse cx="132" cy="361" rx="16" ry="7.5" fill={shoesColor} />
                      <path d="M 115 363 C 122 358, 140 357, 149 363 L 148 368 C 136 369, 122 369, 115 368 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
                      <path d="M 125 361 Q 134 358, 144 362" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />

                      <ellipse cx="168" cy="361" rx="16" ry="7.5" fill={shoesColor} />
                      <path d="M 151 363 C 158 358, 176 357, 185 363 L 184 368 C 172 369, 158 369, 151 368 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
                      <path d="M 156 362 Q 166 358, 175 361" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    </g>
                  )}

                  {/* 3. TENIS CHUNKY DE PLATAFORMA */}
                  {shoesType === 'sneakers_chunky' && (
                    <g>
                      <ellipse cx="132" cy="360" rx="16.5" ry="7.5" fill={shoesColor} />
                      <rect x="114" y="361" width="36" height="8" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="120" y1="366" x2="120" y2="369" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="128" y1="366" x2="128" y2="369" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="136" y1="366" x2="136" y2="369" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="144" y1="366" x2="144" y2="369" stroke="#94a3b8" strokeWidth="1.5" />

                      <ellipse cx="168" cy="360" rx="16.5" ry="7.5" fill={shoesColor} />
                      <rect x="150" y="361" width="36" height="8" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="156" y1="366" x2="156" y2="369" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="164" y1="366" x2="164" y2="369" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="172" y1="366" x2="172" y2="369" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="180" y1="366" x2="180" y2="369" stroke="#94a3b8" strokeWidth="1.5" />
                    </g>
                  )}

                  {/* 4. TENIS RETRO DE BOTA ALTA (HIGH-TOPS) */}
                  {shoesType === 'sneakers_altos' && (
                    <g>
                      <rect x="122" y="342" width="22" height="20" rx="2.5" fill={shoesColor} />
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <circle cx="137" cy="348" r="3.5" fill="#ffffff" />
                      <polygon points="137,346 138,348 140,348 138.5,349 139,351 137,350 135,351 135.5,349 134,348 136,348" fill="#dc2626" />
                      <line x1="126" y1="344" x2="132" y2="344" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="126" y1="348" x2="132" y2="348" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="126" y1="352" x2="132" y2="352" stroke="#ffffff" strokeWidth="1.2" />
                      <path d="M 115 362 L 149 362 L 148 367 L 116 367 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                      <ellipse cx="120" cy="362" rx="5.5" ry="4.5" fill="#ffffff" />

                      <rect x="156" y="342" width="22" height="20" rx="2.5" fill={shoesColor} />
                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <circle cx="163" cy="348" r="3.5" fill="#ffffff" />
                      <polygon points="163,346 164,348 166,348 164.5,349 165,351 163,350 161,351 161.5,349 160,348 162,348" fill="#dc2626" />
                      <line x1="168" y1="344" x2="174" y2="344" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="168" y1="348" x2="174" y2="348" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="168" y1="352" x2="174" y2="352" stroke="#ffffff" strokeWidth="1.2" />
                      <path d="M 151 362 L 185 362 L 184 367 L 152 367 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                      <ellipse cx="180" cy="362" rx="5.5" ry="4.5" fill="#ffffff" />
                    </g>
                  )}

                  {/* 5. TACONES STILETTOS DE AGUJA */}
                  {shoesType === 'tacones_aguja' && (
                    <g>
                      <path d="M 116 363 C 122 355, 138 355, 147 360 L 145 364 C 136 362, 122 362, 116 364 Z" fill={shoesColor} />
                      <polygon points="115,363 118,361 118,365" fill={shoesColor} />
                      <line x1="144" y1="360" x2="144" y2="368" stroke={shoesColor} strokeWidth="2.4" strokeLinecap="round" />
                      <circle cx="144" cy="368" r="1.1" fill="#f59e0b" />

                      <path d="M 184 363 C 178 355, 162 355, 153 360 L 155 364 C 164 362, 178 362, 184 364 Z" fill={shoesColor} />
                      <polygon points="185,363 182,361 182,365" fill={shoesColor} />
                      <line x1="156" y1="360" x2="156" y2="368" stroke={shoesColor} strokeWidth="2.4" strokeLinecap="round" />
                      <circle cx="156" cy="368" r="1.1" fill="#f59e0b" />
                    </g>
                  )}

                  {/* 6. TACONES DE BLOQUE CÓMODOS */}
                  {shoesType === 'tacones_bloque' && (
                    <g>
                      <ellipse cx="132" cy="361" rx="15" ry="7" fill={shoesColor} />
                      <rect x="140" y="360" width="7" height="8" rx="1.5" fill={shadeColor(shoesColor, -25)} />
                      <path d="M 126 348 Q 133 351, 140 348" stroke={shoesColor} strokeWidth="2.4" fill="none" />
                      <circle cx="140" cy="348" r="1.2" fill="#d97706" />

                      <ellipse cx="168" cy="361" rx="15" ry="7" fill={shoesColor} />
                      <rect x="153" y="360" width="7" height="8" rx="1.5" fill={shadeColor(shoesColor, -25)} />
                      <path d="M 160 348 Q 167 351, 174 348" stroke={shoesColor} strokeWidth="2.4" fill="none" />
                      <circle cx="160" cy="348" r="1.2" fill="#d97706" />
                    </g>
                  )}

                  {/* 7. SANDALIAS DE TACÓN CON TIRAS */}
                  {shoesType === 'sandalias_tacon' && (
                    <g>
                      <ellipse cx="132" cy="361" rx="15" ry="6.5" fill={skin} />
                      <line x1="144" y1="360" x2="144" y2="368" stroke={shoesColor} strokeWidth="2.4" strokeLinecap="round" />
                      <path d="M 118 360 Q 124 357, 130 362" stroke={shoesColor} strokeWidth="2" fill="none" />
                      <path d="M 126 358 Q 134 357, 142 362" stroke={shoesColor} strokeWidth="2" fill="none" />
                      <path d="M 128 348 Q 134 351, 142 349" stroke={shoesColor} strokeWidth="1.8" fill="none" />

                      <ellipse cx="168" cy="361" rx="15" ry="6.5" fill={skin} />
                      <line x1="156" y1="360" x2="156" y2="368" stroke={shoesColor} strokeWidth="2.4" strokeLinecap="round" />
                      <path d="M 182 360 Q 176 357, 170 362" stroke={shoesColor} strokeWidth="2" fill="none" />
                      <path d="M 174 358 Q 166 357, 158 362" stroke={shoesColor} strokeWidth="2" fill="none" />
                      <path d="M 172 348 Q 166 351, 158 349" stroke={shoesColor} strokeWidth="1.8" fill="none" />
                    </g>
                  )}

                  {/* 8. TACONES CON PLATAFORMA */}
                  {shoesType === 'tacones_plataforma' && (
                    <g>
                      <rect x="116" y="362" width="16" height="5.5" rx="2" fill={shadeColor(shoesColor, -30)} />
                      <ellipse cx="132" cy="360" rx="15" ry="7" fill={shoesColor} />
                      <rect x="139" y="358" width="8" height="10" rx="1.5" fill={shadeColor(shoesColor, -30)} />

                      <rect x="168" y="362" width="16" height="5.5" rx="2" fill={shadeColor(shoesColor, -30)} />
                      <ellipse cx="168" cy="360" rx="15" ry="7" fill={shoesColor} />
                      <rect x="153" y="358" width="8" height="10" rx="1.5" fill={shadeColor(shoesColor, -30)} />
                    </g>
                  )}

                  {/* 9. BOTAS ALTAS HASTA LA RODILLA */}
                  {shoesType === 'botas_altas' && (
                    <g>
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <rect x="138" y="360" width="7" height="8" rx="1" fill={shadeColor(shoesColor, -30)} />
                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <rect x="155" y="360" width="7" height="8" rx="1" fill={shadeColor(shoesColor, -30)} />
                    </g>
                  )}

                  {/* 10. BOTAS CON MALLAS DE RED */}
                  {shoesType === 'botas_malla_red' && (
                    <g>
                      <rect x="122" y="342" width="22" height="20" rx="3" fill={shoesColor} />
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <rect x="120" y="350" width="24" height="3" fill={shadeColor(shoesColor, -25)} />
                      <rect x="138" y="349" width="4" height="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                      <rect x="138" y="360" width="7" height="8" rx="1.5" fill={shadeColor(shoesColor, -35)} />

                      <rect x="156" y="342" width="22" height="20" rx="3" fill={shoesColor} />
                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <rect x="156" y="350" width="24" height="3" fill={shadeColor(shoesColor, -25)} />
                      <rect x="158" y="349" width="4" height="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                      <rect x="155" y="360" width="7" height="8" rx="1.5" fill={shadeColor(shoesColor, -35)} />
                    </g>
                  )}

                  {/* 11. BOTINES CHELSEA DE CUERO */}
                  {shoesType === 'botines_chelsea' && (
                    <g>
                      <rect x="122" y="344" width="22" height="18" rx="3" fill={shoesColor} />
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <polygon points="140,346 144,356 137,356" fill="#18181b" />
                      <rect x="142" y="341" width="3" height="4" fill="#3f3f46" rx="1" />
                      <rect x="139" y="360" width="7" height="7" rx="1.5" fill={shadeColor(shoesColor, -25)} />

                      <rect x="156" y="344" width="22" height="18" rx="3" fill={shoesColor} />
                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <polygon points="160,346 156,356 163,356" fill="#18181b" />
                      <rect x="155" y="341" width="3" height="4" fill="#3f3f46" rx="1" />
                      <rect x="154" y="360" width="7" height="7" rx="1.5" fill={shadeColor(shoesColor, -25)} />
                    </g>
                  )}

                  {/* 12. BOTAS MILITARES COMBAT */}
                  {shoesType === 'botas_militares' && (
                    <g>
                      <rect x="122" y="338" width="22" height="24" rx="3" fill={shoesColor} />
                      <ellipse cx="132" cy="362" rx="16.5" ry="8.5" fill={shoesColor} />
                      <rect x="114" y="364" width="36" height="5" rx="1" fill="#18181b" />
                      <line x1="128" y1="342" x2="136" y2="345" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="136" y1="342" x2="128" y2="345" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="128" y1="346" x2="136" y2="349" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="136" y1="346" x2="128" y2="349" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="128" y1="350" x2="136" y2="353" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="136" y1="350" x2="128" y2="353" stroke="#ffffff" strokeWidth="1.2" />

                      <rect x="156" y="338" width="22" height="24" rx="3" fill={shoesColor} />
                      <ellipse cx="168" cy="362" rx="16.5" ry="8.5" fill={shoesColor} />
                      <rect x="150" y="364" width="36" height="5" rx="1" fill="#18181b" />
                      <line x1="162" y1="342" x2="170" y2="345" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="170" y1="342" x2="162" y2="345" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="162" y1="346" x2="170" y2="349" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="170" y1="346" x2="162" y2="349" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="162" y1="350" x2="170" y2="353" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="170" y1="350" x2="162" y2="353" stroke="#ffffff" strokeWidth="1.2" />
                    </g>
                  )}

                  {/* 13. BOTAS VAQUERAS WESTERN */}
                  {shoesType === 'botas_vaqueras' && (
                    <g>
                      <ellipse cx="132" cy="362" rx="16" ry="7.5" fill={shoesColor} />
                      <polygon points="115,363 118,360 118,365" fill={shoesColor} />
                      <path d="M 140 360 L 145 360 L 142 367 L 138 367 Z" fill={shadeColor(shoesColor, -35)} />

                      <ellipse cx="168" cy="362" rx="16" ry="7.5" fill={shoesColor} />
                      <polygon points="185,363 182,360 182,365" fill={shoesColor} />
                      <path d="M 155 360 L 160 360 L 162 367 L 158 367 Z" fill={shadeColor(shoesColor, -35)} />
                    </g>
                  )}

                  {/* 14. BOTINES ELEGANTES DE TACÓN */}
                  {shoesType === 'botines_tacon' && (
                    <g>
                      <rect x="123" y="344" width="20" height="18" rx="2.5" fill={shoesColor} />
                      <path d="M 116 363 C 122 355, 138 355, 147 360 L 145 364 C 136 362, 122 362, 116 364 Z" fill={shoesColor} />
                      <line x1="143" y1="360" x2="143" y2="368" stroke={shoesColor} strokeWidth="2.2" strokeLinecap="round" />

                      <rect x="157" y="344" width="20" height="18" rx="2.5" fill={shoesColor} />
                      <path d="M 184 363 C 178 355, 162 355, 153 360 L 155 364 C 164 362, 178 362, 184 364 Z" fill={shoesColor} />
                      <line x1="157" y1="360" x2="157" y2="368" stroke={shoesColor} strokeWidth="2.2" strokeLinecap="round" />
                    </g>
                  )}

                  {/* 15. MOCASINES CLÁSICOS LOAFERS */}
                  {shoesType === 'mocasines_clasicos' && (
                    <g>
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 121 359 Q 131 356, 141 359" stroke={shadeColor(shoesColor, -25)} strokeWidth="1.4" fill="none" />
                      <rect x="127" y="357" width="10" height="2.5" rx="1" fill="#f59e0b" stroke="#d97706" strokeWidth="0.6" />
                      <rect x="140" y="361" width="5" height="6" rx="1" fill={shadeColor(shoesColor, -25)} />

                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 157 359 Q 167 356, 177 359" stroke={shadeColor(shoesColor, -25)} strokeWidth="1.4" fill="none" />
                      <rect x="163" y="357" width="10" height="2.5" rx="1" fill="#f59e0b" stroke="#d97706" strokeWidth="0.6" />
                      <rect x="155" y="361" width="5" height="6" rx="1" fill={shadeColor(shoesColor, -25)} />
                    </g>
                  )}

                  {/* 16. MOCASINES CHUNKY */}
                  {shoesType === 'mocasines_chunky' && (
                    <g>
                      <ellipse cx="132" cy="360" rx="16" ry="7.5" fill={shoesColor} />
                      <rect x="114" y="362" width="36" height="6" rx="2" fill="#18181b" />
                      <rect x="126" y="356" width="12" height="3" rx="1" fill="#f59e0b" />

                      <ellipse cx="168" cy="360" rx="16" ry="7.5" fill={shoesColor} />
                      <rect x="150" y="362" width="36" height="6" rx="2" fill="#18181b" />
                      <rect x="162" y="356" width="12" height="3" rx="1" fill="#f59e0b" />
                    </g>
                  )}

                  {/* 17. ZAPATOS OXFORD DE CORDONES */}
                  {shoesType === 'zapatos_oxford' && (
                    <g>
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 121 361 Q 126 359, 131 361" stroke={shadeColor(shoesColor, -25)} strokeWidth="1.2" strokeDasharray="1.5,1.5" fill="none" />
                      <line x1="133" y1="356" x2="139" y2="356" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="133" y1="358" x2="139" y2="358" stroke="#ffffff" strokeWidth="1.2" />
                      <rect x="140" y="361" width="5" height="6" rx="1" fill={shadeColor(shoesColor, -25)} />

                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 169 361 Q 174 359, 179 361" stroke={shadeColor(shoesColor, -25)} strokeWidth="1.2" strokeDasharray="1.5,1.5" fill="none" />
                      <line x1="161" y1="356" x2="167" y2="356" stroke="#ffffff" strokeWidth="1.2" />
                      <line x1="161" y1="358" x2="167" y2="358" stroke="#ffffff" strokeWidth="1.2" />
                      <rect x="155" y="361" width="5" height="6" rx="1" fill={shadeColor(shoesColor, -25)} />
                    </g>
                  )}

                  {/* 18. ZAPATOS DE CHAROL BRILLANTE */}
                  {shoesType === 'zapatos_charol' && (
                    <g>
                      <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 119 359 Q 128 356, 138 360" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75" />
                      <rect x="140" y="361" width="5" height="6" rx="1" fill={shadeColor(shoesColor, -25)} />

                      <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoesColor} />
                      <path d="M 181 359 Q 172 356, 162 360" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75" />
                      <rect x="155" y="361" width="5" height="6" rx="1" fill={shadeColor(shoesColor, -25)} />
                    </g>
                  )}

                  {/* 19. SANDALIAS PLANAS DE VERANO */}
                  {shoesType === 'sandalias_planas' && (
                    <g>
                      <ellipse cx="132" cy="362" rx="15" ry="6.5" fill={skin} />
                      <ellipse cx="132" cy="364" rx="16" ry="4" fill="#bfa67a" stroke="#8c7653" strokeWidth="0.8" />
                      <path d="M 120 361 L 134 365" stroke={shoesColor} strokeWidth="2.4" />
                      <path d="M 134 361 L 120 365" stroke={shoesColor} strokeWidth="2.4" />

                      <ellipse cx="168" cy="362" rx="15" ry="6.5" fill={skin} />
                      <ellipse cx="168" cy="364" rx="16" ry="4" fill="#bfa67a" stroke="#8c7653" strokeWidth="0.8" />
                      <path d="M 156 361 L 170 365" stroke={shoesColor} strokeWidth="2.4" />
                      <path d="M 170 361 L 156 365" stroke={shoesColor} strokeWidth="2.4" />
                    </g>
                  )}
                </g>
              )}
            </g>

            {/* ── 2. Torso (Busto Femenino / Torso Masculino) ── */}
            <g className="msh">
              <path
                d={`M ${bodyMods.torsoTopL} 144 C ${bodyMods.torsoTopL - 2} 166, ${bodyMods.waistL} 194, ${bodyMods.waistL} 206 L ${bodyMods.waistR} 206 C ${bodyMods.waistR} 194, ${bodyMods.torsoTopR + 2} 166, ${bodyMods.torsoTopR} 144 Q 164 132, 150 134 Q 136 132, ${bodyMods.torsoTopL} 144 Z`}
                fill={`url(#mTopGrad_${topColor.replace('#','')})`}
              />

              {isFemale && bodyMods.hasBust && (
                <g opacity=".85">
                  <path
                    d={`M ${bodyMods.torsoTopL + 6} 168 Q 138 ${177 + bodyMods.bustScale * 2}, 150 171 Q 162 ${177 + bodyMods.bustScale * 2}, ${bodyMods.torsoTopR - 6} 168`}
                    stroke={topShadow}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M 133 162 Q 139 168, 147 165" stroke={topLight} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".6" />
                  <path d="M 167 162 Q 161 168, 153 165" stroke={topLight} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".6" />
                </g>
              )}

              {/* ══════════ DETALLES EXCLUSIVOS POR PRENDA SUPERIOR ══════════ */}

              {/* 1. Sudadera / Hoodie */}
              {topType === 'hoodie' && (
                <g>
                  <path d={`M ${bodyMods.waistL + 6} 184 L ${bodyMods.waistR - 6} 184 L ${bodyMods.waistR - 8} 204 L ${bodyMods.waistL + 8} 204 Z`} fill={topShadow} opacity=".4" />
                  <path d="M 144 144 Q 143 158, 142 168" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".85" />
                  <path d="M 156 144 Q 157 158, 158 168" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".85" />
                  <circle cx="142" cy="168" r="1.6" fill="#e4e4e7" />
                  <circle cx="158" cy="168" r="1.6" fill="#e4e4e7" />
                </g>
              )}

              {/* 2. Playera Básica Cuello Redondo */}
              {topType === 'tshirt' && (
                <g>
                  <path d="M 141 135 Q 150 144, 159 135" stroke={topShadow} strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 142 135 Q 150 143, 158 135" stroke={topLight} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </g>
              )}

              {/* 3. Playera Polo con Cuello */}
              {topType === 'polo' && (
                <g>
                  <path d="M 137 135 L 143 148 L 150 140 L 144 135 Z" fill={topLight} stroke={topShadow} strokeWidth="1.2" />
                  <path d="M 163 135 L 157 148 L 150 140 L 156 135 Z" fill={topLight} stroke={topShadow} strokeWidth="1.2" />
                  <rect x="148.5" y="140" width="3" height="22" rx="1" fill={topShadow} opacity="0.4" />
                  <circle cx="150" cy="146" r="1.3" fill="#ffffff" />
                  <circle cx="150" cy="154" r="1.3" fill="#ffffff" />
                </g>
              )}

              {/* 4. Top Atlético Sin Mangas */}
              {topType === 'tank_top' && (
                <g>
                  <path d="M 140 135 Q 150 156, 160 135 Z" fill={skin} />
                  <path d="M 140 135 Q 150 156, 160 135" stroke={topShadow} strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              )}

              {/* 5. Camisa Formal de Botones */}
              {topType === 'shirt_formal' && (
                <g>
                  {/* Cuello Camisero Estructurado */}
                  <path d="M 136 135 L 140 150 L 149 140 L 144 134 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                  <path d="M 164 135 L 160 150 L 151 140 L 156 134 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                  {/* Tapeta central */}
                  <rect x="148" y="140" width="4" height="66" fill={topShadow} opacity="0.3" />
                  {/* Botones nacarados */}
                  <circle cx="150" cy="148" r="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
                  <circle cx="150" cy="162" r="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
                  <circle cx="150" cy="176" r="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
                  <circle cx="150" cy="190" r="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
                </g>
              )}

              {/* 6. Camisa Abierta con Playera Interior */}
              {topType === 'shirt_casual_open' && (
                <g>
                  {/* Playera interior blanca */}
                  <path d="M 143 136 Q 150 142, 157 136 L 155 206 L 145 206 Z" fill="#f8fafc" />
                  <path d="M 143 138 Q 150 143, 157 138" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                  {/* Solapas de camisa abierta */}
                  <path d="M 136 135 L 142 152 L 145 137 Z" fill={topLight} stroke={topShadow} strokeWidth="1" />
                  <path d="M 164 135 L 158 152 L 155 137 Z" fill={topLight} stroke={topShadow} strokeWidth="1" />
                  <path d="M 145 152 L 145 206" stroke={topShadow} strokeWidth="2.5" />
                  <path d="M 155 152 L 155 206" stroke={topShadow} strokeWidth="2.5" />
                </g>
              )}

              {/* 7. Chaleco Acolchado Puffer */}
              {topType === 'chaleco_puffy' && (
                <g>
                  {/* Cuello interior */}
                  <path d="M 144 134 Q 150 140, 156 134 Z" fill="#ffffff" opacity="0.9" />
                  {/* Cremallera frontal */}
                  <line x1="150" y1="138" x2="150" y2="206" stroke="#94a3b8" strokeWidth="2.8" />
                  <circle cx="150" cy="144" r="2.2" fill="#475569" />
                  {/* Costuras de acolchado térmico horizontal */}
                  <path d={`M ${bodyMods.torsoTopL + 3} 156 Q 150 162, ${bodyMods.torsoTopR - 3} 156`} stroke={topShadow} strokeWidth="2.2" fill="none" />
                  <path d={`M ${bodyMods.torsoTopL + 4} 158 Q 150 164, ${bodyMods.torsoTopR - 4} 158`} stroke={topLight} strokeWidth="1.4" fill="none" opacity="0.6" />
                  <path d={`M ${bodyMods.waistL + 2} 176 Q 150 182, ${bodyMods.waistR - 2} 176`} stroke={topShadow} strokeWidth="2.2" fill="none" />
                  <path d={`M ${bodyMods.waistL + 3} 178 Q 150 184, ${bodyMods.waistR - 3} 178`} stroke={topLight} strokeWidth="1.4" fill="none" opacity="0.6" />
                  <path d={`M ${bodyMods.waistL + 2} 194 Q 150 198, ${bodyMods.waistR - 2} 194`} stroke={topShadow} strokeWidth="2.2" fill="none" />
                </g>
              )}

              {/* 8. Chaleco de Lana en V */}
              {topType === 'chaleco_lana' && (
                <g>
                  {/* Camisa interior debajo */}
                  <path d="M 143 134 L 150 156 L 157 134 Z" fill="#f8fafc" />
                  <path d="M 143 134 L 140 144 L 148 138 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <path d="M 157 134 L 160 144 L 152 138 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  {/* Ribete en V */}
                  <path d="M 142 134 L 150 158 L 158 134" stroke={topShadow} strokeWidth="3" fill="none" />
                  <path d="M 142 134 L 150 158 L 158 134" stroke={topLight} strokeWidth="1.5" fill="none" />
                  {/* Textura de punto */}
                  <path d="M 136 174 L 136 198" stroke={topShadow} strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
                  <path d="M 164 174 L 164 198" stroke={topShadow} strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
                </g>
              )}

              {/* 9. Suéter con Corazón ❤️ */}
              {topType === 'sweater_heart' && (
                <g>
                  {/* Cuello redondo tejido */}
                  <path d="M 141 135 Q 150 142, 159 135" stroke={topShadow} strokeWidth="3.2" strokeLinecap="round" fill="none" />
                  <path d="M 142 135 Q 150 141, 158 135" stroke={topLight} strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  {/* Líneas de textura tejida */}
                  <path d="M 134 148 Q 132 174, 134 200" stroke={topShadow} strokeWidth="1.2" strokeDasharray="3,2" opacity="0.4" />
                  <path d="M 166 148 Q 168 174, 166 200" stroke={topShadow} strokeWidth="1.2" strokeDasharray="3,2" opacity="0.4" />
                  {/* GRÁFICO DE CORAZÓN BORDADO */}
                  <g transform="translate(150, 172)">
                    <path d="M 0 10 C -12 2, -18 -8, -9 -14 C -4 -17, 0 -10, 0 -8 C 0 -10, 4 -17, 9 -14 C 18 -8, 12 2, 0 10 Z" fill="#991b1b" opacity="0.4" transform="translate(0, 1.5)" />
                    <path d="M 0 10 C -12 2, -18 -8, -9 -14 C -4 -17, 0 -10, 0 -8 C 0 -10, 4 -17, 9 -14 C 18 -8, 12 2, 0 10 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.4" />
                    <path d="M -8 -11 Q -6 -13, -3 -12" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />
                  </g>
                </g>
              )}

              {/* 10. Suéter con Logo de Equi ✨ */}
              {topType === 'sweater_equi' && (
                <g>
                  {/* Cuello redondo tejido */}
                  <path d="M 141 135 Q 150 142, 159 135" stroke={topShadow} strokeWidth="3.2" strokeLinecap="round" fill="none" />
                  <path d="M 142 135 Q 150 141, 158 135" stroke={topLight} strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  {/* GRÁFICO DE LA MASCOTA / ESTRELLA EQUI ✨ */}
                  <g transform="translate(150, 172)">
                    <circle cx="0" cy="0" r="14" fill="#fef08a" opacity="0.35" />
                    <path d="M 0 -12 Q 2 -2, 12 0 Q 2 2, 0 12 Q -2 2, -12 0 Q -2 -2, 0 -12 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />
                    {/* Ojitos y rostro kawaii */}
                    <circle cx="-3" cy="-1" r="1.1" fill="#1e1b4b" />
                    <circle cx="3" cy="-1" r="1.1" fill="#1e1b4b" />
                    <circle cx="-3.3" cy="-1.4" r="0.4" fill="#ffffff" />
                    <circle cx="2.7" cy="-1.4" r="0.4" fill="#ffffff" />
                    <ellipse cx="-4.5" cy="1.5" rx="1.2" ry="0.7" fill="#f43f5e" opacity="0.75" />
                    <ellipse cx="4.5" cy="1.5" rx="1.2" ry="0.7" fill="#f43f5e" opacity="0.75" />
                    <path d="M -1.8 1.5 Q 0 3.2, 1.8 1.5" stroke="#1e1b4b" strokeWidth="0.8" strokeLinecap="round" fill="none" />
                    <circle cx="9" cy="-8" r="1.2" fill="#ffffff" />
                    <circle cx="-8" cy="8" r="1" fill="#fde047" />
                  </g>
                </g>
              )}

              {/* 11. Suéter de Cuello Alto / Tortuga */}
              {topType === 'sweater_turtleneck' && (
                <g>
                  {/* Cuello alto acanalado doblado */}
                  <rect x="142" y="127" width="16" height="15" rx="3" fill={topColor} stroke={topShadow} strokeWidth="1.5" />
                  <line x1="142" y1="135" x2="158" y2="135" stroke={topShadow} strokeWidth="1.2" />
                  <line x1="146" y1="127" x2="146" y2="142" stroke={topLight} strokeWidth="0.8" opacity="0.5" />
                  <line x1="150" y1="127" x2="150" y2="142" stroke={topLight} strokeWidth="0.8" opacity="0.5" />
                  <line x1="154" y1="127" x2="154" y2="142" stroke={topLight} strokeWidth="0.8" opacity="0.5" />
                </g>
              )}

              {/* 12. Cárdigan Tejido */}
              {topType === 'cardigan' && (
                <g>
                  <path d="M 143 134 L 150 162 L 157 134 Z" fill="#f8fafc" />
                  <line x1="150" y1="162" x2="150" y2="206" stroke={topShadow} strokeWidth="2.5" />
                  <circle cx="150" cy="172" r="1.4" fill="#d97706" />
                  <circle cx="150" cy="186" r="1.4" fill="#d97706" />
                  <circle cx="150" cy="200" r="1.4" fill="#d97706" />
                </g>
              )}

              {/* 13. Vestido Veraniego de Tirantes */}
              {topType === 'vestido_tirantes' && (
                <g>
                  {/* Escote recto/suave con piel visible */}
                  <path d="M 134 144 Q 150 152, 166 144 L 166 135 L 134 135 Z" fill={skin} />
                  <path d="M 134 144 Q 150 152, 166 144" stroke={topShadow} strokeWidth="1.8" fill="none" />
                  {/* Tirantes finos */}
                  <line x1={bodyMods.torsoTopL + 8} y1="134" x2={bodyMods.torsoTopL + 8} y2="146" stroke={topColor} strokeWidth="3" />
                  <line x1={bodyMods.torsoTopR - 8} y1="134" x2={bodyMods.torsoTopR - 8} y2="146" stroke={topColor} strokeWidth="3" />
                </g>
              )}

              {/* 14. Vestido Floral (Flores sobre el torso) */}
              {topType === 'vestido_estampado' && (
                <g opacity="0.95">
                  <circle cx="140" cy="178" r="3" fill="#fef08a" />
                  <circle cx="140" cy="178" r="1.2" fill="#f97316" />
                  <circle cx="160" cy="172" r="3.2" fill="#fbcfe8" />
                  <circle cx="160" cy="172" r="1.4" fill="#ec4899" />
                  <circle cx="145" cy="195" r="2.8" fill="#bae6fd" />
                  <circle cx="145" cy="195" r="1.2" fill="#0284c7" />
                </g>
              )}

              {/* 15. Vestido de Fiesta con Brillos (Destellos sobre el torso) */}
              {topType === 'vestido_brillos' && (
                <g opacity="0.95">
                  <path d="M 142 165 Q 142 168 145 168 Q 142 168 142 171 Q 142 168 139 168 Q 142 168 142 165 Z" fill="#ffffff" />
                  <path d="M 158 182 Q 158 186 162 186 Q 158 186 158 190 Q 158 186 154 186 Q 158 186 158 182 Z" fill="#fef08a" />
                  <circle cx="150" cy="156" r="1.3" fill="#ffffff" opacity="0.9" />
                  <circle cx="136" cy="186" r="1.2" fill="#fef08a" opacity="0.85" />
                  <circle cx="164" cy="160" r="1.1" fill="#ffffff" opacity="0.85" />
                </g>
              )}
            </g>

            {/* ── 3. Brazos Articulados (Brazos Anatómicamente Dentro de la Ropa) ── */}
            {/* BRAZO IZQUIERDO */}
            <g className="msl">
              <g className="mal">
                {/* 1. Brazo Base Anatómico (Tono de Piel continuo y suave) */}
                <path
                  d={`M ${bodyMods.shL} 144 Q ${bodyMods.shL - 9} 172, ${bodyMods.shL - 13} 188 Q ${bodyMods.shL - 17} 204, ${bodyMods.shL - 19} 218`}
                  stroke={skin}
                  strokeWidth={bodyMods.armW - 1.5}
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx={bodyMods.shL} cy="144" r={(bodyMods.armW - 1.5) / 2} fill={skin} />
                {/* Mano izquierda */}
                <ellipse cx={bodyMods.shL - 19} cy="222" rx="5.5" ry="7" fill={skin} />

                {/* 2. MANGA DE LA ROPA (Cubre el brazo según el estilo) */}
                {/* MANGA LARGA (Hoodies, Suéteres, Camisas, Vestidos de Gala y Noche) */}
                {isLongSleeve && (
                  <g>
                    <path
                      d={`M ${bodyMods.shL} 144 Q ${bodyMods.shL - 9} 172, ${bodyMods.shL - 13} 188 Q ${bodyMods.shL - 17} 202, ${bodyMods.shL - 18} 205`}
                      stroke={topColor}
                      strokeWidth={bodyMods.armW + 2}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx={bodyMods.shL} cy="144" r={(bodyMods.armW + 2) / 2} fill={topColor} />
                    {/* Puño de la manga en la muñeca */}
                    <ellipse cx={bodyMods.shL - 18} cy="205" rx={(bodyMods.armW + 2) / 2} ry="3" fill={topShadow} stroke={topLight} strokeWidth="1" />
                    {/* Si es vestido con brillos, destellos en la manga */}
                    {topType === 'vestido_brillos' && (
                      <g opacity="0.95">
                        <circle cx={bodyMods.shL - 7} cy="166" r="1.3" fill="#ffffff" />
                        <circle cx={bodyMods.shL - 14} cy="192" r="1.3" fill="#fef08a" />
                      </g>
                    )}
                  </g>
                )}

                {/* MANGA CORTA (Playeras, Polos, Vestidos Cortos) */}
                {isShortSleeve && (
                  <g>
                    <path
                      d={`M ${bodyMods.shL} 144 Q ${bodyMods.shL - 5} 155, ${bodyMods.shL - 8} 166`}
                      stroke={topColor}
                      strokeWidth={bodyMods.armW + 2.5}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx={bodyMods.shL} cy="144" r={(bodyMods.armW + 2.5) / 2} fill={topColor} />
                    {/* Dobladillo de la manga */}
                    <ellipse cx={bodyMods.shL - 8} cy="166" rx={(bodyMods.armW + 2.5) / 2} ry="3.2" fill={topShadow} stroke={topLight} strokeWidth="0.8" />
                    {topType === 'vestido_estampado' && (
                      <circle cx={bodyMods.shL - 5} cy="155" r="1.8" fill="#fef08a" />
                    )}
                  </g>
                )}

                {/* SIN MANGAS / TIRANTES */}
                {isSleeveless && topType === 'vestido_tirantes' && (
                  <line x1={bodyMods.shL + 2} y1="134" x2={bodyMods.shL + 2} y2="148" stroke={topColor} strokeWidth="3" strokeLinecap="round" />
                )}
                {isSleeveless && (topType === 'chaleco_puffy' || topType === 'chaleco_lana') && (
                  <path d={`M ${bodyMods.shL - 1} 136 C ${bodyMods.shL - 5} 144, ${bodyMods.shL - 3} 156, ${bodyMods.shL + 4} 158`} stroke={topShadow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                )}
              </g>
            </g>

            {/* BRAZO DERECHO */}
            <g className="msr">
              <g className="mar">
                {/* 1. Brazo Base Anatómico */}
                <path
                  d={`M ${bodyMods.shR} 144 Q ${bodyMods.shR + 9} 172, ${bodyMods.shR + 13} 188 Q ${bodyMods.shR + 17} 204, ${bodyMods.shR + 19} 218`}
                  stroke={skin}
                  strokeWidth={bodyMods.armW - 1.5}
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx={bodyMods.shR} cy="144" r={(bodyMods.armW - 1.5) / 2} fill={skin} />
                {/* ── ACCESORIOS DE MUÑECA (Smartwatch, Reloj Clásico, Pulseras) ── */}
                {(() => {
                  const watchType = merged.accessories?.watchType || (merged.accessories?.watch ? 'watch_smart' : 'none');
                  const watchCol = merged.accessories?.watchColor || '#18181b';
                  const jewelCol = merged.accessories?.jewelryColor || '#d4af37';

                  if (watchType === 'watch_smart') {
                    return (
                      <g>
                        <rect x={bodyMods.shR + 14.5} y="208" width="9" height="5.5" rx="1.5" fill={watchCol} stroke={shadeColor(watchCol, -25)} strokeWidth=".7" />
                        <rect x={bodyMods.shR + 15.5} y="208.5" width="7" height="4.5" rx="1" fill="#0f172a" />
                        <line x1={bodyMods.shR + 17} y1="210.5" x2={bodyMods.shR + 21} y2="210.5" stroke="#38bdf8" strokeWidth="1" />
                        <circle cx={bodyMods.shR + 17.5} cy="211.5" r="0.6" fill="#10b981" />
                      </g>
                    );
                  }

                  if (watchType === 'watch_clasico') {
                    return (
                      <g>
                        <rect x={bodyMods.shR + 15} y="208" width="8" height="5" rx="1" fill={watchCol} />
                        <circle cx={bodyMods.shR + 19} cy="210.5" r="3.5" fill="#ffffff" stroke={jewelCol} strokeWidth="1.2" />
                        <line x1={bodyMods.shR + 19} y1="210.5" x2={bodyMods.shR + 19} y2="208.5" stroke="#18181b" strokeWidth="0.8" />
                        <line x1={bodyMods.shR + 19} y1="210.5" x2={bodyMods.shR + 20.5} y2="210.5" stroke="#18181b" strokeWidth="0.8" />
                      </g>
                    );
                  }

                  if (watchType === 'pulseras_boho') {
                    return (
                      <g>
                        <line x1={bodyMods.shR + 15} y1="207" x2={bodyMods.shR + 23} y2="207" stroke="#b45309" strokeWidth="1.4" />
                        <line x1={bodyMods.shR + 15} y1="209" x2={bodyMods.shR + 23} y2="209" stroke={jewelCol} strokeWidth="1.2" strokeDasharray="1.5,1.5" />
                        <line x1={bodyMods.shR + 15} y1="211" x2={bodyMods.shR + 23} y2="211" stroke="#059669" strokeWidth="1.4" />
                        <line x1={bodyMods.shR + 15} y1="213" x2={bodyMods.shR + 23} y2="213" stroke="#e08d8d" strokeWidth="1.2" />
                      </g>
                    );
                  }

                  return null;
                })()}
                {/* Mano derecha */}
                <ellipse cx={bodyMods.shR + 19} cy="222" rx="5.5" ry="7" fill={skin} />

                {/* 2. MANGA DE LA ROPA */}
                {/* MANGA LARGA */}
                {isLongSleeve && (
                  <g>
                    <path
                      d={`M ${bodyMods.shR} 144 Q ${bodyMods.shR + 9} 172, ${bodyMods.shR + 13} 188 Q ${bodyMods.shR + 17} 202, ${bodyMods.shR + 18} 205`}
                      stroke={topColor}
                      strokeWidth={bodyMods.armW + 2}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx={bodyMods.shR} cy="144" r={(bodyMods.armW + 2) / 2} fill={topColor} />
                    {/* Puño de la manga */}
                    <ellipse cx={bodyMods.shR + 18} cy="205" rx={(bodyMods.armW + 2) / 2} ry="3" fill={topShadow} stroke={topLight} strokeWidth="1" />
                    {topType === 'vestido_brillos' && (
                      <g opacity="0.95">
                        <circle cx={bodyMods.shR + 7} cy="166" r="1.3" fill="#ffffff" />
                        <circle cx={bodyMods.shR + 14} cy="192" r="1.3" fill="#fef08a" />
                      </g>
                    )}
                  </g>
                )}

                {/* MANGA CORTA */}
                {isShortSleeve && (
                  <g>
                    <path
                      d={`M ${bodyMods.shR} 144 Q ${bodyMods.shR + 5} 155, ${bodyMods.shR + 8} 166`}
                      stroke={topColor}
                      strokeWidth={bodyMods.armW + 2.5}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx={bodyMods.shR} cy="144" r={(bodyMods.armW + 2.5) / 2} fill={topColor} />
                    {/* Dobladillo de la manga */}
                    <ellipse cx={bodyMods.shR + 8} cy="166" rx={(bodyMods.armW + 2.5) / 2} ry="3.2" fill={topShadow} stroke={topLight} strokeWidth="0.8" />
                    {topType === 'vestido_estampado' && (
                      <circle cx={bodyMods.shR + 5} cy="155" r="1.8" fill="#fbcfe8" />
                    )}
                  </g>
                )}

                {/* SIN MANGAS / TIRANTES */}
                {isSleeveless && topType === 'vestido_tirantes' && (
                  <line x1={bodyMods.shR - 2} y1="134" x2={bodyMods.shR - 2} y2="148" stroke={topColor} strokeWidth="3" strokeLinecap="round" />
                )}
                {isSleeveless && (topType === 'chaleco_puffy' || topType === 'chaleco_lana') && (
                  <path d={`M ${bodyMods.shR + 1} 136 C ${bodyMods.shR + 5} 144, ${bodyMods.shR + 3} 156, ${bodyMods.shR - 4} 158`} stroke={topShadow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                )}
              </g>
            </g>

            {/* ── BOLSO BANDOLERA CRUZADO ── */}
            {merged.accessories?.crossbodyBag && (
              <g>
                <path d={`M ${bodyMods.shL + 3} 142 L ${bodyMods.waistR - 2} 210`} stroke={merged.accessories?.crossbodyBagColor || '#3d2314'} strokeWidth="5.5" strokeLinecap="round" />
                <path d={`M ${bodyMods.shL + 3} 142 L ${bodyMods.waistR - 2} 210`} stroke={shadeColor(merged.accessories?.crossbodyBagColor || '#3d2314', 25)} strokeWidth="1" strokeDasharray="3,3" fill="none" />
                <rect x={bodyMods.waistR - 8} y="206" width="18" height="22" rx="4" fill={merged.accessories?.crossbodyBagColor || '#3d2314'} stroke={shadeColor(merged.accessories?.crossbodyBagColor || '#3d2314', -30)} strokeWidth="1.2" />
                <rect x={bodyMods.waistR - 9} y="204" width="20" height="9" rx="2" fill={shadeColor(merged.accessories?.crossbodyBagColor || '#3d2314', 15)} />
                <circle cx={bodyMods.waistR + 1} cy="208.5" r="1.3" fill="#d4af37" />
              </g>
            )}

            {/* ── 4. CUELLO CILÍNDRICO ANATÓMICO (Bendy con la cabeza) ── */}
            <g className="mh">
              <rect
                x={150 - bodyMods.neckW / 2}
                y="110"
                width={bodyMods.neckW}
                height="26"
                rx="4"
                fill={skin}
              />
              <path
                d={`M ${150 - bodyMods.neckW / 2 - 2} 126 L 150 133 L ${150 + bodyMods.neckW / 2 + 2} 126`}
                stroke={skinShadow}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity=".4"
              />
              <path
                d={`M ${150 - bodyMods.neckW / 2 - 2} 136 Q 150 144, ${150 + bodyMods.neckW / 2 + 2} 136 Q 150 142, ${150 - bodyMods.neckW / 2 - 2} 136 Z`}
                fill={topShadow}
                stroke={topLight}
                strokeWidth=".8"
              />
            </g>

            {/* ── ACCESORIOS DE CUELLO (Bufandas, Collares, Gargantillas) ── */}
            {(() => {
              const neckType = merged.accessories?.necklaceType || (merged.accessories?.necklace ? 'collar_zen' : 'none');
              const scarfCol = merged.accessories?.scarfColor || '#dc2626';
              const jewelCol = merged.accessories?.jewelryColor || '#d4af37';

              if (neckType === 'bufanda_tejida') {
                return (
                  <g>
                    <path
                      d={`M ${150 - bodyMods.neckW / 2 - 8} 122 C ${150 - bodyMods.neckW / 2 - 8} 144, ${150 + bodyMods.neckW / 2 + 8} 144, ${150 + bodyMods.neckW / 2 + 8} 122 Q 150 114, ${150 - bodyMods.neckW / 2 - 8} 122 Z`}
                      fill={scarfCol}
                      stroke={shadeColor(scarfCol, -25)}
                      strokeWidth="1.2"
                    />
                    <path
                      d={`M ${150 - 6} 134 L ${150 - 10} 184 L ${150 + 6} 184 L ${150 + 8} 134 Z`}
                      fill={scarfCol}
                      stroke={shadeColor(scarfCol, -25)}
                      strokeWidth="1"
                    />
                    <line x1={150 - 9} y1="184" x2={150 - 9} y2="190" stroke={shadeColor(scarfCol, 30)} strokeWidth="1.5" />
                    <line x1={150 - 5} y1="184" x2={150 - 5} y2="191" stroke={shadeColor(scarfCol, 30)} strokeWidth="1.5" />
                    <line x1={150 - 1} y1="184" x2={150 - 1} y2="190" stroke={shadeColor(scarfCol, 30)} strokeWidth="1.5" />
                    <line x1={150 + 3} y1="184" x2={150 + 3} y2="191" stroke={shadeColor(scarfCol, 30)} strokeWidth="1.5" />
                    <line x1={150 + 7} y1="184" x2={150 + 7} y2="190" stroke={shadeColor(scarfCol, 30)} strokeWidth="1.5" />
                  </g>
                );
              }

              if (neckType === 'bufanda_seda') {
                return (
                  <g>
                    <path
                      d={`M ${150 - bodyMods.neckW / 2 - 4} 126 Q 150 138, ${150 + bodyMods.neckW / 2 + 4} 126 Q 150 120, ${150 - bodyMods.neckW / 2 - 4} 126 Z`}
                      fill={scarfCol}
                      stroke={shadeColor(scarfCol, -25)}
                      strokeWidth="1"
                    />
                    <ellipse cx="150" cy="133" rx="3.5" ry="3" fill={shadeColor(scarfCol, -20)} />
                    <path d="M 148 134 Q 142 144, 140 152 Q 145 146, 149 135 Z" fill={scarfCol} />
                    <path d="M 152 134 Q 158 144, 160 152 Q 155 146, 151 135 Z" fill={scarfCol} />
                  </g>
                );
              }

              if (neckType === 'gargantilla_choker') {
                return (
                  <g>
                    <path
                      d={`M ${150 - bodyMods.neckW / 2} 122 Q 150 128, ${150 + bodyMods.neckW / 2} 122`}
                      stroke="#18181b"
                      strokeWidth="3.2"
                      fill="none"
                    />
                    <path
                      d="M 150 127 C 147 124, 144 127, 147 130 L 150 133 L 153 130 C 156 127, 153 124, 150 127 Z"
                      fill={jewelCol}
                      stroke="#18181b"
                      strokeWidth="0.5"
                    />
                  </g>
                );
              }

              if (neckType === 'collar_perlas') {
                return (
                  <g>
                    <path
                      d={`M ${150 - bodyMods.neckW / 2 - 1} 125 Q 150 139, ${150 + bodyMods.neckW / 2 + 1} 125`}
                      stroke="#f8fafc"
                      strokeWidth="3.2"
                      strokeDasharray="4,4"
                      fill="none"
                    />
                    <path
                      d={`M ${150 - bodyMods.neckW / 2 - 2} 129 Q 150 145, ${150 + bodyMods.neckW / 2 + 2} 129`}
                      stroke="#e2e8f0"
                      strokeWidth="3"
                      strokeDasharray="3.8,3.8"
                      fill="none"
                    />
                  </g>
                );
              }

              if (neckType === 'cadena_oro') {
                return (
                  <g>
                    <path
                      d={`M ${150 - bodyMods.neckW / 2 - 2} 124 Q 150 142, ${150 + bodyMods.neckW / 2 + 2} 124`}
                      stroke={jewelCol}
                      strokeWidth="3.8"
                      strokeDasharray="5,2"
                      fill="none"
                    />
                    <path
                      d={`M ${150 - bodyMods.neckW / 2 - 2} 124 Q 150 142, ${150 + bodyMods.neckW / 2 + 2} 124`}
                      stroke={shadeColor(jewelCol, 40)}
                      strokeWidth="1.2"
                      fill="none"
                    />
                  </g>
                );
              }

              if (neckType === 'collar_zen') {
                return (
                  <g>
                    <path
                      d={`M ${150 - bodyMods.neckW / 2} 120 Q 150 138, ${150 + bodyMods.neckW / 2} 120`}
                      stroke="#27272a"
                      strokeWidth="1.2"
                      fill="none"
                    />
                    <ellipse cx="150" cy="139" rx="3" ry="4.5" fill="#7c3aed" stroke="#ede9fe" strokeWidth="0.8" />
                    <circle cx="150" cy="138" r="1.2" fill="#ffffff" opacity="0.8" />
                  </g>
                );
              }

              return null;
            })()}

            {/* ── 5. CABEZA, ROSTRO Y RASGOS (Totalmente Nítido) ── */}
            <g className="mh">
              {/* OREJAS */}
              <ellipse cx="117" cy="80" rx="5.5" ry="8.5" fill={skin} />
              <ellipse cx="183" cy="80" rx="5.5" ry="8.5" fill={skin} />

              {/* ── ARETES & JOYERÍA DE OREJA ── */}
              {(() => {
                const erType = merged.accessories?.earringsType || (merged.accessories?.earrings ? 'aretes_arracadas' : 'none');
                const jewelCol = merged.accessories?.jewelryColor || '#d4af37';

                if (erType === 'aretes_arracadas') {
                  return (
                    <g>
                      <circle cx="116" cy="87" r="4.2" fill="none" stroke={jewelCol} strokeWidth="1.8" />
                      <circle cx="184" cy="87" r="4.2" fill="none" stroke={jewelCol} strokeWidth="1.8" />
                    </g>
                  );
                }

                if (erType === 'aretes_colgantes') {
                  return (
                    <g>
                      <circle cx="116" cy="85" r="1.5" fill={jewelCol} />
                      <path d="M 116 87 C 114 90, 114 93, 116 94 C 118 93, 118 90, 116 87 Z" fill="#38bdf8" stroke={jewelCol} strokeWidth="0.8" />
                      <circle cx="115.5" cy="91" r="0.8" fill="#ffffff" />

                      <circle cx="184" cy="85" r="1.5" fill={jewelCol} />
                      <path d="M 184 87 C 182 90, 182 93, 184 94 C 186 93, 186 90, 184 87 Z" fill="#38bdf8" stroke={jewelCol} strokeWidth="0.8" />
                      <circle cx="183.5" cy="91" r="0.8" fill="#ffffff" />
                    </g>
                  );
                }

                if (erType === 'aretes_cruces') {
                  return (
                    <g>
                      <circle cx="116" cy="85" r="1.2" fill={jewelCol} />
                      <line x1="116" y1="87" x2="116" y2="95" stroke={jewelCol} strokeWidth="1.2" />
                      <line x1="113.5" y1="90" x2="118.5" y2="90" stroke={jewelCol} strokeWidth="1.2" />

                      <circle cx="184" cy="85" r="1.2" fill={jewelCol} />
                      <line x1="184" y1="87" x2="184" y2="95" stroke={jewelCol} strokeWidth="1.2" />
                      <line x1="181.5" y1="90" x2="186.5" y2="90" stroke={jewelCol} strokeWidth="1.2" />
                    </g>
                  );
                }

                return null;
              })()}

              {/* FORMA DE CARA (Dinámica según faceShape) */}
              {(() => {
                let facePath = "M 118 76 C 118 40, 132 28, 150 28 C 168 28, 182 40, 182 76 C 182 108, 166 122, 150 122 C 134 122, 118 108, 118 76 Z"; // oval

                if (merged.faceShape === 'round') {
                  // Redondo suave: mejillas más anchas y redondeadas
                  facePath = "M 112 75 C 112 42, 128 28, 150 28 C 172 28, 188 42, 188 75 C 188 106, 172 118, 150 118 C 128 118, 112 106, 112 75 Z";
                } else if (merged.faceShape === 'cuadrado' || merged.faceShape === 'square') {
                  // Cuadrado marcado: mandíbula angular definida
                  facePath = "M 114 74 C 114 40, 128 28, 150 28 C 172 28, 186 40, 186 74 C 186 98, 184 114, 170 120 C 160 123, 140 123, 130 120 C 116 114, 114 98, 114 74 Z";
                } else if (merged.faceShape === 'rectangular') {
                  // Rectangular: rostro alargado con mandíbula muy ancha y recta
                  facePath = "M 116 78 C 116 38, 128 26, 150 26 C 172 26, 184 38, 184 78 C 184 104, 182 118, 168 124 C 158 126, 142 126, 132 124 C 118 118, 116 104, 116 78 Z";
                } else if (merged.faceShape === 'corazon' || merged.faceShape === 'heart') {
                  // Corazón: sienes amplias y barbilla puntiaguda
                  facePath = "M 113 65 C 113 36, 128 26, 150 26 C 172 26, 187 36, 187 65 C 187 88, 168 112, 150 124 C 132 112, 113 88, 113 65 Z";
                } else if (merged.faceShape === 'alargado' || merged.faceShape === 'long') {
                  // Alargado: rostro fino y esbelto verticalmente
                  facePath = "M 121 78 C 121 38, 133 26, 150 26 C 167 26, 179 38, 179 78 C 179 112, 166 128, 150 128 C 134 128, 121 112, 121 78 Z";
                } else if (merged.faceShape === 'diamante' || merged.faceShape === 'diamond') {
                  // Diamante: pómulos angulares anchos y frente/mentón más estrechos
                  facePath = "M 112 72 C 124 38, 136 28, 150 28 C 164 28, 176 38, 188 72 C 188 92, 166 116, 150 124 C 134 116, 112 92, 112 72 Z";
                } else if (merged.faceShape === 'pera') {
                  // Pera: frente angosta y mandíbula ancha piramidal
                  facePath = "M 122 70 C 122 38, 134 28, 150 28 C 166 28, 178 38, 178 70 C 178 92, 188 112, 174 122 C 162 125, 138 125, 126 122 C 112 112, 122 92, 122 70 Z";
                } else if (merged.faceShape === 'hexagonal') {
                  // Hexagonal: sienes diagonales y mentón plano angular
                  facePath = "M 114 74 L 126 30 L 174 30 L 186 74 L 172 120 L 128 120 Z";
                } else if (merged.faceShape === 'trapecio') {
                  // Trapecio: mandíbula muy amplia y mentón cuadrado robusto
                  facePath = "M 120 72 C 120 38, 132 28, 150 28 C 168 28, 180 38, 180 72 C 180 94, 190 114, 176 122 C 166 126, 134 126, 124 122 C 110 114, 120 94, 120 72 Z";
                }

                return <path d={facePath} fill={skin} />;
              })()}

              {merged.blush && (
                <g>
                  <ellipse cx="131" cy="85" rx="6.5" ry="4" fill={skinBlush} opacity="0.75" />
                  <ellipse cx="169" cy="85" rx="6.5" ry="4" fill={skinBlush} opacity="0.75" />
                </g>
              )}

              {merged.freckles && (
                <g fill={freckleColor} opacity="0.85">
                  {/* Mejilla izquierda */}
                  <circle cx="127" cy="85" r="1.1" />
                  <circle cx="131" cy="83" r="1.3" />
                  <circle cx="133" cy="87" r="0.9" />
                  <circle cx="136" cy="84" r="1.1" />
                  <circle cx="130" cy="88" r="1.0" />
                  <circle cx="138" cy="87" r="0.8" />

                  {/* Puente de la nariz */}
                  <circle cx="145" cy="83" r="1.0" />
                  <circle cx="149" cy="82" r="1.2" />
                  <circle cx="151" cy="84" r="0.9" />
                  <circle cx="155" cy="83" r="1.0" />

                  {/* Mejilla derecha */}
                  <circle cx="162" cy="84" r="1.1" />
                  <circle cx="164" cy="87" r="0.8" />
                  <circle cx="167" cy="83" r="1.3" />
                  <circle cx="170" cy="88" r="1.0" />
                  <circle cx="173" cy="85" r="1.1" />
                  <circle cx="169" cy="86" r="0.9" />
                </g>
              )}

              {/* Cejas */}
              <path d="M 129 64 Q 137 60, 145 65" stroke={hairDark} strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 171 64 Q 163 60, 155 65" stroke={hairDark} strokeWidth="2.4" strokeLinecap="round" fill="none" />

              {/* Ojos Dinámicos */}
              {isEyesClosed ? (
                <g stroke={skinShadow} strokeWidth="2.4" strokeLinecap="round" fill="none">
                  <path d="M 130 76 Q 137 82, 144 76" />
                  <path d="M 156 76 Q 163 82, 170 76" />
                </g>
              ) : (
                <g>
                  {(() => {
                    let eyePathL = "M 129 74 Q 137 68, 145 74 Q 137 79, 129 74 Z"; // almendrados
                    let eyePathR = "M 155 74 Q 163 68, 171 74 Q 163 79, 155 74 Z";
                    let irisSize = 3.2;
                    let isWinking = false;

                    if (merged.eyes === 'grandes') {
                      eyePathL = "M 127 74 Q 137 63, 147 74 Q 137 83, 127 74 Z";
                      eyePathR = "M 153 74 Q 163 63, 173 74 Q 163 83, 153 74 Z";
                      irisSize = 4.3;
                    } else if (merged.eyes === 'enfoque') {
                      eyePathL = "M 128 75 Q 137 70, 146 75 Q 137 79, 128 75 Z";
                      eyePathR = "M 154 75 Q 163 70, 172 75 Q 163 79, 154 75 Z";
                      irisSize = 2.6;
                    } else if (merged.eyes === 'rasgados') {
                      eyePathL = "M 127 76 Q 137 67, 147 71 Q 138 78, 127 76 Z";
                      eyePathR = "M 153 71 Q 163 67, 173 76 Q 162 78, 153 71 Z";
                      irisSize = 3.0;
                    } else if (merged.eyes === 'redondos') {
                      eyePathL = "M 130 74 A 6.8 6.8 0 1 1 144 74 A 6.8 6.8 0 1 1 130 74 Z";
                      eyePathR = "M 156 74 A 6.8 6.8 0 1 1 170 74 A 6.8 6.8 0 1 1 156 74 Z";
                      irisSize = 4.0;
                    } else if (merged.eyes === 'caidos') {
                      eyePathL = "M 127 72 Q 137 67, 147 76 Q 137 80, 127 72 Z";
                      eyePathR = "M 153 76 Q 163 67, 173 72 Q 163 80, 153 76 Z";
                      irisSize = 3.3;
                    } else if (merged.eyes === 'sonadores') {
                      eyePathL = "M 128 74 Q 137 65, 146 74 Q 137 81, 128 74 Z";
                      eyePathR = "M 154 74 Q 163 65, 172 74 Q 163 81, 154 74 Z";
                      irisSize = 3.6;
                    } else if (merged.eyes === 'felinos') {
                      eyePathL = "M 126 77 Q 137 66, 147 72 Q 138 78, 126 77 Z";
                      eyePathR = "M 153 72 Q 163 66, 174 77 Q 162 78, 153 72 Z";
                      irisSize = 3.2;
                    } else if (merged.eyes === 'serena') {
                      eyePathL = "M 129 75 Q 137 72, 145 75 Q 137 78, 129 75 Z";
                      eyePathR = "M 155 75 Q 163 72, 171 75 Q 163 78, 155 75 Z";
                      irisSize = 2.8;
                    } else if (merged.eyes === 'guino') {
                      eyePathL = "M 128 74 Q 137 64, 146 74 Q 137 82, 128 74 Z";
                      irisSize = 4.0;
                      isWinking = true;
                    }

                    return (
                      <g>
                        {/* Ojo Izquierdo */}
                        <path d={eyePathL} fill="#ffffff" />
                        <circle cx="137" cy="74" r={irisSize} fill={eyeIrisColor} />
                        <circle cx="137" cy="74" r={irisSize * 0.45} fill="#000000" />
                        <circle cx={137 - irisSize*0.3} cy={74 - irisSize*0.3} r={irisSize * 0.28} fill="#ffffff" />
                        {merged.eyes === 'felinos' && (
                          <path d="M 125 77 L 129 75" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
                        )}

                        {/* Ojo Derecho: Normal o Guiño */}
                        {isWinking ? (
                          <path d="M 154 75 Q 163 82, 172 75" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        ) : (
                          <g>
                            <path d={eyePathR} fill="#ffffff" />
                            <circle cx="163" cy="74" r={irisSize} fill={eyeIrisColor} />
                            <circle cx="163" cy="74" r={irisSize * 0.45} fill="#000000" />
                            <circle cx={163 - irisSize*0.3} cy={74 - irisSize*0.3} r={irisSize * 0.28} fill="#ffffff" />
                            {merged.eyes === 'felinos' && (
                              <path d="M 175 77 L 171 75" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })()}
                </g>
              )}


              {/* Nariz */}
              <path d="M 148 76 Q 150 82, 148 85 Q 150 86, 152 85" stroke={skinShadow} strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Curita en la nariz (Bandaid kawaii) */}
              {merged.accessories?.bandaid && (
                <g>
                  <rect x="142" y="79" width="16" height="6" rx="2" fill="#fed7aa" stroke="#fb923c" strokeWidth="0.8" transform="rotate(-6 150 82)" />
                  <circle cx="146.5" cy="81.5" r="0.8" fill="#ef4444" transform="rotate(-6 150 82)" />
                  <circle cx="153.5" cy="81.5" r="0.8" fill="#ef4444" transform="rotate(-6 150 82)" />
                </g>
              )}

              {/* Piercing Nostril en la nariz */}
              {merged.accessories?.piercingNose && (
                <circle cx="154" cy="85" r="1.3" fill={merged.accessories?.piercingsColor || '#e2e8f0'} stroke="#18181b" strokeWidth="0.4" />
              )}

              {/* Piercing Septum circular */}
              {merged.accessories?.piercingSeptum && (
                <path d="M 148 87.5 C 148 91, 152 91, 152 87.5" stroke={merged.accessories?.piercingsColor || '#e2e8f0'} strokeWidth="1.3" fill="none" />
              )}

              {/* Piercing en la Ceja */}
              {merged.accessories?.piercingEyebrow && (
                <g>
                  <circle cx="127" cy="63" r="1.2" fill={merged.accessories?.piercingsColor || '#e2e8f0'} />
                  <line x1="127" y1="63" x2="129" y2="69" stroke={merged.accessories?.piercingsColor || '#e2e8f0'} strokeWidth="1" />
                  <circle cx="129" cy="69" r="1.2" fill={merged.accessories?.piercingsColor || '#e2e8f0'} />
                </g>
              )}

              {/* Piercing en el Labio (Labret) */}
              {merged.accessories?.piercingLip && (
                <circle cx="150" cy="99.5" r="1.3" fill={merged.accessories?.piercingsColor || '#e2e8f0'} stroke="#18181b" strokeWidth="0.4" />
              )}

              {/* Boca Dinámica con Color de Labios */}
              {(() => {
                const mType = merged.mouth || 'sonrisa_calida';

                if (mType === 'sonrisa_amplia') {
                  return (
                    <g>
                      <path d="M 140 92 Q 150 104, 160 92 Z" fill="#881337" />
                      <path d="M 141 92 Q 150 96.5, 159 92 Z" fill="#ffffff" />
                      <path d="M 140 92 Q 150 88, 160 92 Q 150 94, 140 92 Z" fill={lipstickColor} />
                      <path d="M 142 98 Q 150 104, 158 98 Q 150 101, 142 98 Z" fill={lipstickColor} />
                    </g>
                  );
                }

                if (mType === 'sonrisa_abierta') {
                  return (
                    <g>
                      <path d="M 141 92 Q 150 102, 159 92 Z" fill="#581c87" />
                      <path d="M 143 92 Q 150 96, 157 92 Z" fill="#ffffff" />
                      <path d="M 141 92 Q 150 89, 159 92" stroke={lipstickColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      <path d="M 143 97 Q 150 102, 157 97" stroke={lipstickColor} strokeWidth="2.4" strokeLinecap="round" fill="none" />
                    </g>
                  );
                }

                if (mType === 'labios_carnosos') {
                  return (
                    <g>
                      {/* Labio superior con arco de cupido marcado */}
                      <path d="M 141 93 Q 146 88, 150 90 Q 154 88, 159 93 Q 150 94, 141 93 Z" fill={lipstickColor} />
                      {/* Labio inferior grueso y sensual */}
                      <path d="M 141 93 Q 150 103, 159 93 Q 150 97, 141 93 Z" fill={lipstickColor} />
                      {/* Brillo highlight central */}
                      <ellipse cx="150" cy="98" rx="3.5" ry="1.2" fill="#ffffff" opacity="0.45" />
                    </g>
                  );
                }

                if (mType === 'labios_gloss') {
                  return (
                    <g>
                      <path d="M 141 93 Q 146 89, 150 91 Q 154 89, 159 93 Q 150 95, 141 93 Z" fill={lipstickColor} />
                      <path d="M 141 93 Q 150 102, 159 93 Q 150 96, 141 93 Z" fill={lipstickColor} />
                      {/* Destellos de brillo gloss */}
                      <ellipse cx="147" cy="97" rx="3" ry="1" fill="#ffffff" opacity="0.75" />
                      <circle cx="153" cy="96.5" r="1.1" fill="#ffffff" opacity="0.8" />
                    </g>
                  );
                }

                if (mType === 'labios_serenos') {
                  return (
                    <g>
                      <path d="M 142 93 Q 150 91.5, 158 93" stroke={lipShadow} strokeWidth="1.2" fill="none" />
                      <path d="M 142 93 Q 150 94, 158 93" stroke={lipstickColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    </g>
                  );
                }

                if (mType === 'sonrisa_picara') {
                  return (
                    <g>
                      {/* Sonrisa asimétrica ladeada */}
                      <path d="M 142 94 Q 150 95, 158 90" stroke={lipstickColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
                      <path d="M 157 88 Q 159 90, 158 92" stroke={lipShadow} strokeWidth="1.4" fill="none" />
                    </g>
                  );
                }

                if (mType === 'besito') {
                  return (
                    <g>
                      {/* Boquita de corazón / besito fruncido */}
                      <ellipse cx="150" cy="92.5" rx="3.5" ry="2.5" fill={lipstickColor} />
                      <ellipse cx="150" cy="95.5" rx="4" ry="2.8" fill={lipstickColor} />
                      <circle cx="150" cy="94" r="1" fill={lipShadow} />
                    </g>
                  );
                }

                if (mType === 'labios_ombre') {
                  return (
                    <g>
                      <path d="M 141 93 Q 146 88, 150 90 Q 154 88, 159 93 Q 150 102, 141 93 Z" fill={lipShadow} />
                      <path d="M 143 93 Q 150 92, 157 93 Q 150 100, 143 93 Z" fill={lipstickColor} />
                      <ellipse cx="150" cy="96.5" rx="3" ry="1.4" fill={lipLight} opacity="0.8" />
                    </g>
                  );
                }

                if (mType === 'sonrisa_timida') {
                  return (
                    <g>
                      <path d="M 144 93 Q 150 96.5, 156 93" stroke={lipstickColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      <circle cx="143" cy="92.5" r="0.8" fill={lipShadow} />
                      <circle cx="157" cy="92.5" r="0.8" fill={lipShadow} />
                    </g>
                  );
                }

                // sonrisa_calida por defecto
                return (
                  <g>
                    <path d="M 141 92.5 Q 150 99, 159 92.5" stroke={lipstickColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
                    <path d="M 144 94 Q 150 98, 156 94" fill={lipLight} opacity="0.5" />
                  </g>
                );
              })()}

              {/* Gafas */}
              {merged.glasses === 'round' && (
                <g stroke={frameColor} strokeWidth="2.2" fill="none">
                  <circle cx="137" cy="74" r="9" />
                  <circle cx="163" cy="74" r="9" />
                  <path d="M 146 73 Q 150 71, 154 73" />
                  <path d="M 128 73 L 122 71" />
                  <path d="M 172 73 L 178 71" />
                </g>
              )}

              {merged.glasses === 'square' && (
                <g stroke={frameColor} strokeWidth="2.5" fill="none">
                  <rect x="127" y="65" width="20" height="18" rx="3" />
                  <rect x="153" y="65" width="20" height="18" rx="3" />
                  <path d="M 147 72 Q 150 71, 153 72" />
                  <path d="M 127 72 L 122 71" />
                  <path d="M 173 72 L 178 71" />
                </g>
              )}

              {merged.glasses === 'rectangle' && (
                <g stroke={frameColor} strokeWidth="2.2" fill="none">
                  <rect x="126" y="68" width="22" height="12" rx="2" />
                  <rect x="152" y="68" width="22" height="12" rx="2" />
                  <path d="M 148 72 Q 150 71, 152 72" />
                  <path d="M 126 72 L 122 71" />
                  <path d="M 174 72 L 178 71" />
                </g>
              )}

              {merged.glasses === 'aviator' && (
                <g stroke={frameColor} strokeWidth="1.8" fill="none">
                  <path d="M 127 69 Q 137 65, 147 69 Q 148 78, 142 84 Q 137 87, 131 84 Q 126 78, 127 69 Z" />
                  <path d="M 153 69 Q 163 65, 173 69 Q 174 78, 168 84 Q 163 87, 157 84 Q 152 78, 153 69 Z" />
                  <path d="M 147 71 Q 150 69, 153 71" />
                  <path d="M 145 67 Q 150 65, 155 67" />
                  <path d="M 127 70 L 122 69" />
                  <path d="M 173 70 L 178 69" />
                </g>
              )}

              {merged.glasses === 'cat_eye' && (
                <g stroke={frameColor} strokeWidth="2.5" fill="none">
                  {/* Cat eye pointy corners */}
                  <path d="M 126 65 L 146 69 Q 148 78, 142 82 Q 134 85, 128 78 Z" strokeLinejoin="round" />
                  <path d="M 174 65 L 154 69 Q 152 78, 158 82 Q 166 85, 172 78 Z" strokeLinejoin="round" />
                  {/* Accent triangles */}
                  <path d="M 126 65 L 132 66 L 128 72 Z" fill={frameColor} />
                  <path d="M 174 65 L 168 66 L 172 72 Z" fill={frameColor} />
                  <path d="M 146 72 Q 150 71, 154 72" />
                  <path d="M 126 68 L 122 69" />
                  <path d="M 174 68 L 178 69" />
                </g>
              )}

              {merged.glasses === 'sunglasses_dark' && (
                <g>
                  {/* Lenses */}
                  <rect x="125" y="66" width="22" height="16" rx="4" fill="#1f2937" />
                  <rect x="153" y="66" width="22" height="16" rx="4" fill="#1f2937" />
                  {/* Reflections */}
                  <path d="M 128 68 L 134 68 L 130 76 L 127 76 Z" fill="#4b5563" opacity="0.6" />
                  <path d="M 156 68 L 162 68 L 158 76 L 155 76 Z" fill="#4b5563" opacity="0.6" />
                  {/* Frame */}
                  <g stroke={frameColor} strokeWidth="2.5" fill="none">
                    <rect x="125" y="66" width="22" height="16" rx="4" />
                    <rect x="153" y="66" width="22" height="16" rx="4" />
                    <path d="M 147 72 Q 150 71, 153 72" />
                    <path d="M 125 70 L 120 69" />
                    <path d="M 175 70 L 180 69" />
                  </g>
                </g>
              )}

              {merged.glasses === 'sunglasses_color' && (
                <g>
                  {/* Colored Lenses using frameColor with opacity */}
                  <circle cx="137" cy="74" r="10" fill={frameColor} opacity="0.75" />
                  <circle cx="163" cy="74" r="10" fill={frameColor} opacity="0.75" />
                  {/* Reflections */}
                  <path d="M 131 68 Q 134 66, 137 68" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M 157 68 Q 160 66, 163 68" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
                  {/* Frame */}
                  <g stroke={frameColor === '#ffffff' ? '#cbd5e1' : shadeColor(frameColor, -35)} strokeWidth="2" fill="none">
                    <circle cx="137" cy="74" r="10" />
                    <circle cx="163" cy="74" r="10" />
                    <path d="M 147 73 Q 150 71, 153 73" />
                    <path d="M 127 73 L 122 71" />
                    <path d="M 173 73 L 178 71" />
                  </g>
                </g>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* ═══ 6. CORONA FRONTAL Y RIZOS EN PRIMER PLANO ═══ */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <g>

                {/* ── CORONILLA: RIZOS VOLUMINOSOS SALVAJES ── */}
                {hStyle === 'rizos_leona' && (
                  <g>
                    {/* Cúpula base — ancha */}
                    <path d="M114 56 C108 34,120 16,150 16 C180 16,192 34,186 56 C180 44,164 36,150 38 C136 36,120 44,114 56Z" fill={hair} />
                    {/* Mechón L frontal — relleno, cae sobre sien */}
                    <path d="M118 50 C112 62,110 78,116 90 C118 82,122 68,118 50Z" fill={hairDark} opacity="0.9" />
                    <path d="M120 52 C116 64,114 80,120 92 C122 84,124 70,122 52Z" fill={hairMid} />
                    <path d="M124 62 C122 72,120 86,124 96 C126 88,128 76,126 62Z" fill={hairLight} opacity="0.58" />
                    {/* Mechón R frontal */}
                    <path d="M182 50 C188 62,190 78,184 90 C182 82,178 68,182 50Z" fill={hairDark} opacity="0.9" />
                    <path d="M180 52 C184 64,186 80,180 92 C178 84,176 70,178 52Z" fill={hairMid} />
                    <path d="M176 62 C178 72,180 86,176 96 C174 88,172 76,174 62Z" fill={hairLight} opacity="0.58" />
                    {/* Mechón L lateral cayendo */}
                    <path d="M116 58 C108 78,114 96,106 116 C100 132,106 148,100 166 C100 178,106 184,114 186 C114 174,110 162,114 146 C120 128,114 112,118 92 C120 78,120 64,116 58Z" fill={hairDark} opacity="0.88" />
                    <path d="M118 62 C112 82,118 100,110 120 C104 138,110 154,104 172 C104 182,110 188,120 190 C120 178,116 166,120 148 C126 130,120 114,124 94 C124 80,122 66,120 62Z" fill={hair} />
                    {/* Mechón R lateral cayendo */}
                    <path d="M184 58 C192 78,186 96,194 116 C200 132,194 148,200 166 C200 178,194 184,186 186 C186 174,190 162,184 146 C180 128,186 112,182 92 C180 78,180 64,184 58Z" fill={hairDark} opacity="0.88" />
                    <path d="M182 62 C188 82,182 100,190 120 C196 138,190 154,196 172 C196 182,190 188,180 190 C180 178,184 166,178 148 C174 130,180 114,176 94 C176 80,176 66,180 62Z" fill={hair} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS DEFINIDOS NATURALES ── */}
                {hStyle === 'rizos_definidos' && (
                  <g>
                    {/* Cúpula compacta */}
                    <path d="M116 58 C114 36,126 22,150 22 C174 22,186 36,184 58 C178 46,164 40,150 42 C136 40,122 46,116 58Z" fill={hair} />
                    {/* Flequillo abundante a los lados */}
                    <path d="M 116 46 C 100 60, 104 84, 114 100 C 110 80, 116 66, 126 56 Z" fill={hairDark} opacity="0.9" />
                    <path d="M 118 48 C 104 60, 108 80, 116 96 C 114 78, 118 64, 126 56 Z" fill={hairMid} />
                    <path d="M 184 46 C 200 60, 196 84, 186 100 C 190 80, 184 66, 174 56 Z" fill={hairDark} opacity="0.9" />
                    <path d="M 182 48 C 196 60, 192 80, 184 96 C 186 78, 182 64, 174 56 Z" fill={hairMid} />
                    {/* Pequeños rizos sobre la frente para volumen */}
                    <path d="M126 44 C122 54,124 66,130 74 C132 66,130 54,126 44Z" fill={hairDark} opacity="0.9" />
                    <path d="M128 46 C124 56,126 66,132 74 C134 66,132 56,128 46Z" fill={hairMid} />
                    <path d="M136 40 C132 50,134 62,140 70 C142 62,142 50,136 40Z" fill={hairDark} opacity="0.9" />
                    <path d="M138 42 C134 52,136 62,142 70 C144 62,144 52,138 42Z" fill={hairMid} />
                    <path d="M164 40 C168 50,168 62,162 70 C160 62,160 50,164 40Z" fill={hairDark} opacity="0.9" />
                    <path d="M162 42 C166 52,164 62,158 70 C156 62,156 52,162 42Z" fill={hairMid} />
                    <path d="M174 44 C178 54,176 66,170 74 C168 66,168 54,174 44Z" fill={hairDark} opacity="0.9" />
                    <path d="M172 46 C176 56,174 66,168 74 C166 66,166 56,172 46Z" fill={hairMid} />
                    {/* Mechones laterales compactos */}
                    <path d="M118 60 C112 74,116 88,110 102 C106 114,112 124,108 138 C106 148,114 158,122 162 C122 150,120 140,122 126 C126 112,120 100,122 86 C124 74,122 66,118 60Z" fill={hairDark} opacity="0.88" />
                    <path d="M120 64 C116 78,120 92,114 106 C110 118,116 128,112 142 C110 152,118 162,126 166 C126 154,124 144,126 130 C130 116,124 104,126 90 C128 78,126 68,122 64Z" fill={hair} />
                    <path d="M182 60 C188 74,184 88,190 102 C194 114,188 124,192 138 C194 148,186 158,178 162 C178 150,180 140,178 126 C176 112,182 100,180 86 C178 74,178 66,182 60Z" fill={hairDark} opacity="0.88" />
                    <path d="M180 64 C184 78,180 92,186 106 C190 118,184 128,188 142 C190 152,182 162,174 166 C174 154,176 144,174 130 C172 116,178 104,176 90 C174 78,176 68,180 64Z" fill={hair} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS SUELTOS CON VOLUMEN ── */}
                {hStyle === 'rizos_sueltos' && (
                  <g>
                    {/* Cúpula ancha y redondeada */}
                    <path d="M112 58 C108 32,120 18,150 18 C180 18,192 32,188 58 C182 42,166 34,150 36 C134 34,118 42,112 58Z" fill={hair} />
                    {/* Mechones frontales en S */}
                    <path d="M116 50 C108 66,110 86,116 100 C120 90,122 72,116 50Z" fill={hairDark} opacity="0.8" />
                    <path d="M120 54 C114 70,116 90,122 104 C126 94,126 76,122 54Z" fill={hairMid} />
                    <path d="M184 50 C192 66,190 86,184 100 C180 90,178 72,184 50Z" fill={hairDark} opacity="0.8" />
                    <path d="M180 54 C186 70,184 90,178 104 C174 94,174 76,178 54Z" fill={hairMid} />
                    {/* Mechones laterales en S */}
                    <path d="M112 60 C102 82,106 108,96 132 C90 152,98 172,92 194 C92 206,98 212,108 214 C108 200,104 186,110 166 C116 144,110 124,114 102 C116 86,116 68,112 60Z" fill={hairDark} opacity="0.8" />
                    <path d="M116 66 C108 88,112 114,102 138 C96 158,104 178,98 200 C98 210,104 216,114 218 C114 204,110 190,116 170 C122 148,116 128,120 106 C122 90,120 72,118 66Z" fill={hair} />
                    <path d="M188 60 C198 82,194 108,204 132 C210 152,202 172,208 194 C208 206,202 212,192 214 C192 200,196 186,190 166 C184 144,190 124,186 102 C184 86,184 68,188 60Z" fill={hairDark} opacity="0.8" />
                    <path d="M184 66 C192 88,188 114,198 138 C204 158,196 178,202 200 C202 210,196 216,186 218 C186 204,190 190,184 170 C178 148,184 128,180 106 C178 90,180 72,184 66Z" fill={hair} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS EN CAPAS ── */}
                {hStyle === 'rizos_capas' && (
                  <g>
                    {/* Cúpula normal */}
                    <path d="M116 58 C114 36,126 22,150 22 C174 22,186 36,184 58 C178 46,164 40,150 42 C136 40,122 46,116 58Z" fill={hair} />
                    {/* Capa corta — terminan pronto */}
                    <path d="M120 48 C116 58,118 70,124 80 C126 70,126 58,120 48Z" fill={hairDark} opacity="0.92" />
                    <path d="M122 50 C118 60,122 72,128 82 C130 72,130 60,124 50Z" fill={hairMid} />
                    <path d="M178 48 C182 58,180 70,174 80 C172 70,172 58,178 48Z" fill={hairDark} opacity="0.92" />
                    <path d="M176 50 C180 60,178 72,172 82 C170 72,170 60,174 50Z" fill={hairMid} />
                    {/* Capa media */}
                    <path d="M116 60 C110 76,114 94,108 110 C104 124,110 136,106 150 C110 142,114 130,116 116 C120 100,116 86,120 70 C120 66,118 60,116 60Z" fill={hairDark} opacity="0.88" />
                    <path d="M118 64 C114 80,118 98,112 114 C108 128,114 140,110 154 C112 146,116 134,118 120 C122 104,118 90,122 74 C122 68,120 64,118 64Z" fill={hair} />
                    <path d="M184 60 C190 76,186 94,192 110 C196 124,190 136,194 150 C190 142,186 130,184 116 C180 100,184 86,180 70 C180 66,182 60,184 60Z" fill={hairDark} opacity="0.88" />
                    <path d="M182 64 C188 80,184 98,190 114 C194 128,188 140,192 154 C188 146,184 134,182 120 C178 104,182 90,178 74 C178 68,180 64,182 64Z" fill={hair} />
                    {/* Capa larga reducida en volumen y caída */}
                    <path d="M112 62 C104 84,106 110,98 134 C92 154,100 174,96 190 C96 200,104 206,114 206 C114 194,110 180,116 160 C122 142,116 120,118 96 C118 80,116 66,112 62Z" fill={hairDark} opacity="0.84" />
                    <path d="M116 68 C110 90,112 116,104 140 C98 160,106 180,102 196 C102 206,110 210,120 210 C120 198,116 184,122 166 C128 144,122 122,124 98 C124 82,120 72,116 68Z" fill={hair} />
                    <path d="M188 62 C196 84,194 110,202 134 C208 154,200 174,204 190 C204 200,196 206,186 206 C186 194,190 180,184 160 C178 142,184 120,182 96 C182 80,184 66,188 62Z" fill={hairDark} opacity="0.84" />
                    <path d="M184 68 C190 90,188 116,196 140 C202 160,194 180,198 196 C198 206,190 210,180 210 C180 198,184 184,178 166 C172 144,178 122,176 98 C176 82,180 72,184 68Z" fill={hair} />
                  </g>
                )}

                {/* ── CORONILLA: RIZOS LARGOS — FLEQUILLO ESTILO CORTINA ── */}
                {hStyle === 'rizos_largos_flequillo' && (
                  <g>
                    {/* Cúpula base */}
                    <path d="M114 58 C110 30,122 16,150 16 C178 16,190 30,186 58 C182 42,166 36,150 38 C134 36,118 42,114 58Z" fill={hair} />
                    {/* ── FLEQUILLO CORTINA: partido en el centro, cae a los lados ── */}
                    {/* Cortina IZQUIERDA — mechones caen hacia la izquierda */}
                    <path d="M148 36 C144 44,138 52,132 58 C128 52,128 44,134 36 C138 32,144 32,148 36Z" fill={hairDark} opacity="0.9" />
                    <path d="M146 38 C142 46,136 54,130 60 C128 54,128 46,134 38 C138 34,144 34,146 38Z" fill={hairMid} />
                    <path d="M140 38 C136 46,130 54,124 62 C122 56,122 48,128 40 C132 34,138 34,140 38Z" fill={hairDark} opacity="0.88" />
                    <path d="M138 40 C134 48,128 56,122 64 C120 58,120 50,126 42 C130 36,136 36,138 40Z" fill={hairMid} />
                    <path d="M132 42 C126 52,120 62,116 70 C114 62,114 54,120 46 C124 38,130 38,132 42Z" fill={hairDark} opacity="0.85" />
                    <path d="M130 44 C124 54,118 64,114 72 C112 64,114 56,120 48 C124 40,128 40,130 44Z" fill={hairMid} />
                    {/* Cortina DERECHA — mechones caen hacia la derecha */}
                    <path d="M152 36 C156 44,162 52,168 58 C172 52,172 44,166 36 C162 32,156 32,152 36Z" fill={hairDark} opacity="0.9" />
                    <path d="M154 38 C158 46,164 54,170 60 C172 54,172 46,166 38 C162 34,156 34,154 38Z" fill={hairMid} />
                    <path d="M160 38 C164 46,170 54,176 62 C178 56,178 48,172 40 C168 34,162 34,160 38Z" fill={hairDark} opacity="0.88" />
                    <path d="M162 40 C166 48,172 56,178 64 C180 58,180 50,174 42 C170 36,164 36,162 40Z" fill={hairMid} />
                    <path d="M168 42 C174 52,180 62,184 70 C186 62,186 54,180 46 C176 38,170 38,168 42Z" fill={hairDark} opacity="0.85" />
                    <path d="M170 44 C176 54,182 64,186 72 C188 64,186 56,180 48 C176 40,172 40,170 44Z" fill={hairMid} />
                    {/* Mechones laterales en S */}
                    <path d="M114 60 C106 84,110 110,102 136 C96 158,104 182,98 206 C98 222,106 236,118 242 C118 224,114 206,120 186 C126 162,120 138,124 112 C126 92,122 72,114 60Z" fill={hairDark} opacity="0.88" />
                    <path d="M118 66 C112 90,116 116,108 142 C102 164,110 188,104 212 C104 228,112 242,124 248 C124 230,120 212,126 190 C132 166,126 142,130 116 C130 96,126 78,120 66Z" fill={hair} />
                    <path d="M186 60 C194 84,190 110,198 136 C204 158,196 182,202 206 C202 222,194 236,182 242 C182 224,186 206,180 186 C174 162,180 138,176 112 C174 92,178 72,186 60Z" fill={hairDark} opacity="0.88" />
                    <path d="M182 66 C188 90,184 116,192 142 C198 164,190 188,196 212 C196 228,188 242,176 248 C176 230,180 212,174 190 C168 166,174 142,170 116 C170 96,174 78,180 66Z" fill={hair} />
                  </g>
                )}
                {/* ── 2. AFRO CORTO ESCULPIDO ── */}
                {hStyle === 'afro_corto' && (
                  <g>
                    <path
                      d="M 116 60 C 114 34, 126 18, 150 18 C 174 18, 186 34, 184 60 C 178 50, 166 44, 150 46 C 134 44, 122 50, 116 60 Z"
                      fill={hair}
                    />
                    <g stroke={hairLight} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".8">
                      <path d="M 124 38 Q 134 26, 150 26 Q 166 26, 176 38" />
                      <path d="M 132 44 Q 150 36, 168 44" />
                      <path d="M 122 52 Q 134 48, 142 50" />
                      <path d="M 178 52 Q 166 48, 158 50" />
                    </g>
                  </g>
                )}

                {/* ── 3. BOB RIZADO CON FLEQUILLO ── */}
                {hStyle === 'curly_bob_flequillo' && (
                  <g>
                    <path
                      d="M 115 54 C 112 32, 126 20, 150 20 C 174 20, 188 32, 185 54 C 176 44, 164 38, 150 40 C 136 38, 124 44, 115 54 Z"
                      fill={hair}
                    />
                    <g stroke={hairLight} strokeWidth="2.4" strokeLinecap="round" fill="none">
                      <path d="M 130 38 Q 136 48, 132 54" />
                      <path d="M 140 36 Q 146 48, 142 54" />
                      <path d="M 150 36 Q 146 48, 150 54" />
                      <path d="M 160 36 Q 156 48, 160 54" />
                      <path d="M 170 38 Q 164 48, 168 54" />
                    </g>
                    <path d="M 116 54 Q 112 70, 118 86 Q 114 96, 120 106" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M 184 54 Q 188 70, 182 86 Q 186 96, 180 106" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M 116 54 Q 112 70, 118 86" stroke={hairLight} strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    <path d="M 184 54 Q 188 70, 182 86" stroke={hairLight} strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  </g>
                )}

                {/* ── 4. RIZOS MEDIOS ELÁSTICOS ── */}
                {hStyle === 'curly_3b_angie' && (
                  <g>
                    <path
                      d="M 115 54 C 112 32, 126 20, 150 20 C 174 20, 188 32, 185 54 C 176 44, 164 38, 150 40 C 136 38, 124 44, 115 54 Z"
                      fill={hair}
                    />
                    <g stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" fill="none">
                      <path d="M 126 36 Q 138 28, 150 34 Q 162 28, 174 36" />
                      <path d="M 120 46 Q 114 62, 122 76 Q 116 88, 122 98" />
                      <path d="M 180 46 Q 186 62, 178 76 Q 184 88, 178 98" />
                      <path d="M 134 40 Q 142 48, 138 56" />
                      <path d="M 166 40 Q 158 48, 162 56" />
                    </g>
                  </g>
                )}

                {/* ── 5. AFRO VOLUMINOSO CON FLECO CORTINA ── */}
                {(hStyle === 'afro_voluminoso' || hStyle === 'afro_4b_volumen') && (
                  <g>
                    <path
                      d="M 115 54 C 112 30, 126 18, 150 18 C 174 18, 188 30, 185 54 C 176 44, 164 38, 150 40 C 136 38, 124 44, 115 54 Z"
                      fill={hair}
                    />
                    <g stroke={hairLight} strokeWidth="2.8" strokeLinecap="round" fill="none">
                      <path d="M 150 36 Q 140 42, 126 58" />
                      <path d="M 150 36 Q 160 42, 174 58" />
                      <path d="M 146 38 Q 136 46, 130 56" opacity=".7" />
                      <path d="M 154 38 Q 164 46, 170 56" opacity=".7" />
                    </g>
                  </g>
                )}

                {/* ── 6. ONDAS LARGAS GLAMOUR ── */}
                {hStyle === 'ondas_largas' && (
                  <g>
                    <path
                      d="M 115 54 C 114 30, 128 20, 150 20 C 172 20, 186 30, 185 54 C 176 42, 164 34, 150 36 C 136 34, 124 42, 115 54 Z"
                      fill={hair}
                    />
                    <path d="M 134 26 Q 152 22, 170 26" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".4" />
                    <path d="M 120 48 Q 114 68, 122 90" stroke={hairLight} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".85" />
                    <path d="M 180 48 Q 186 68, 178 90" stroke={hairLight} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".85" />
                  </g>
                )}

                {/* ── 7. ONDAS PLAYERAS MEDIAS ── */}
                {hStyle === 'ondas_medias' && (
                  <g>
                    <path
                      d="M 115 54 C 114 30, 128 20, 150 20 C 172 20, 186 30, 185 54 C 176 42, 164 34, 150 36 C 136 34, 124 42, 115 54 Z"
                      fill={hair}
                    />
                    <path d="M 122 48 Q 116 68, 122 88" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".8" />
                    <path d="M 178 48 Q 184 68, 178 88" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".8" />
                  </g>
                )}

                {/* ── 8. LISO LARGO CON FLEQUILLO RECTO ── */}
                {hStyle === 'liso_largo_flequillo' && (
                  <g>
                    <path d="M 115 56 C 114 30, 130 20, 150 20 C 170 20, 186 30, 185 56 Q 150 50, 115 56 Z" fill={hair} />
                    <path d="M 124 38 L 124 58 Q 150 60, 176 58 L 176 38 Z" fill={hair} />
                    <line x1="126" y1="58" x2="174" y2="58" stroke={hairDark} strokeWidth="1.5" />
                    <path d="M 136 44 L 144 56" stroke={hairLight} strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
                    <path d="M 156 44 L 164 56" stroke={hairLight} strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
                  </g>
                )}

                {/* ── 9. LISO LARGO CON FLEQUILLO CORTINA ── */}
                {hStyle === 'liso_cortina' && (
                  <g>
                    <path d="M 116 54 C 114 30, 130 20, 150 20 C 170 20, 186 30, 184 54 C 178 42, 166 36, 150 38 C 134 36, 122 42, 116 54 Z" fill={hair} />
                    <path d="M 150 36 Q 140 44, 128 62" stroke={hairLight} strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M 150 36 Q 160 44, 172 62" stroke={hairLight} strokeWidth="3" strokeLinecap="round" fill="none" />
                  </g>
                )}

                {/* ── 10. LISO LARGO SEDOSO ── */}
                {hStyle === 'liso_largo_sedoso' && (
                  <g>
                    <path d="M 116 56 C 114 30, 130 20, 150 20 C 170 20, 186 30, 184 56 C 178 44, 166 36, 150 38 C 134 36, 122 44, 116 56 Z" fill={hair} />
                    <line x1="150" y1="22" x2="150" y2="38" stroke={hairDark} strokeWidth="2" strokeLinecap="round" />
                    <path d="M 132 26 Q 146 22, 160 26" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".35" />
                  </g>
                )}

                {/* ── 11. MODERN CURTAINS (KENNY) ── */}
                {hStyle === 'curtains' && (
                  <g>
                    <path d="M 118 64 C 114 32, 128 20, 150 20 C 172 20, 186 32, 182 64 C 180 50, 170 42, 150 44 C 130 42, 120 50, 118 64 Z" fill={hair} />
                    <path d="M 150 44 C 144 50, 132 54, 124 58 C 120 50, 122 40, 132 32 Q 142 38, 150 44 Z" fill={hairLight} />
                    <path d="M 150 44 C 156 50, 168 54, 176 58 C 180 50, 178 40, 168 32 Q 158 38, 150 44 Z" fill={hairDark} />
                  </g>
                )}

                {/* ── 12. BOX BRAIDS CON CORNROWS ── */}
                {hStyle === 'box_braids' && (
                  <g>
                    <path d="M 116 56 C 114 32, 128 22, 150 22 C 172 22, 186 32, 184 56 Q 150 48, 116 56 Z" fill={hairDark} />
                    <path d="M 150 24 L 150 48" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 140 26 Q 134 38, 126 52" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 160 26 Q 166 38, 174 52" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="138" cy="48" r="2.2" fill="#d4af37" />
                    <circle cx="162" cy="48" r="2.2" fill="#d4af37" />
                  </g>
                )}

                {/* ── 13. DREADLOCKS CON RAÍZ ── */}
                {hStyle === 'dreadlocks' && (
                  <g>
                    <path d="M 116 54 C 114 30, 128 20, 150 20 C 172 20, 186 30, 184 54 Q 150 46, 116 54 Z" fill={hairDark} />
                    <path d="M 132 24 Q 124 38, 118 54" stroke={hairLight} strokeWidth="3" strokeLinecap="round" />
                    <path d="M 168 24 Q 176 38, 182 54" stroke={hairLight} strokeWidth="3" strokeLinecap="round" />
                  </g>
                )}

                {/* ── 14. CHONGO BONITO ── */}
                {(hStyle === 'chongo_bonito' || hStyle === 'messy_bun') && (
                  <g>
                    <path d="M 116 58 C 114 34, 128 22, 150 22 C 172 22, 186 34, 184 58 C 176 46, 164 40, 150 42 C 136 40, 124 46, 116 58 Z" fill={hair} />
                    <path d="M 118 60 Q 116 74, 118 86" stroke={hair} strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    <path d="M 182 60 Q 184 74, 182 86" stroke={hair} strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  </g>
                )}

                {/* ── 15. COLETA ALTA DINÁMICA ── */}
                {hStyle === 'high_ponytail' && (
                  <g>
                    <path d="M 116 56 C 114 34, 128 22, 150 22 C 172 22, 186 34, 184 56 C 176 46, 164 40, 150 42 C 136 40, 124 46, 116 56 Z" fill={hair} />
                    <path d="M 126 50 Q 138 32, 150 24" stroke={hairLight} strokeWidth="1.8" fill="none" opacity=".6" />
                    <path d="M 174 50 Q 162 32, 150 24" stroke={hairLight} strokeWidth="1.8" fill="none" opacity=".6" />
                  </g>
                )}

                {/* ── 16. BOB CON FLEQUILLO RECTO ── */}
                {hStyle === 'bob_flequillo' && (
                  <g>
                    <path d="M 114 54 C 112 80, 114 96, 116 106 L 126 104 C 122 92, 120 76, 124 58 Q 150 48, 176 58 C 180 76, 178 92, 174 104 L 184 106 C 186 96, 188 80, 186 54 C 182 30, 168 22, 150 22 C 132 22, 118 30, 114 54 Z" fill={hair} />
                    <path d="M 124 38 L 124 58 Q 150 60, 176 58 L 176 38 Z" fill={hair} />
                  </g>
                )}

                {/* ── 17. BOB CLÁSICO FRANCÉS ── */}
                {hStyle === 'sleek_bob' && (
                  <g>
                    <path d="M 114 54 C 112 80, 114 96, 116 106 L 126 104 C 122 92, 120 76, 124 58 Q 150 48, 176 58 C 180 76, 178 92, 174 104 L 184 106 C 186 96, 188 80, 186 54 C 182 30, 168 22, 150 22 C 132 22, 118 30, 114 54 Z" fill={hair} />
                  </g>
                )}

                {/* ── 18. CORONA AFRO IMPERIAL ── */}
                {hStyle === 'afro_corona' && (
                  <g>
                    <ellipse cx="150" cy="36" rx="34" ry="28" fill={hair} />
                    <circle cx="126" cy="34" r="13" fill={hairDark} />
                    <circle cx="174" cy="34" r="13" fill={hairDark} />
                    <circle cx="150" cy="22" r="14" fill={hairLight} />
                    <ellipse cx="150" cy="48" rx="31" ry="6" fill="#fbbf24" opacity=".8" />
                  </g>
                )}

                {/* ── 19. PIXIE CHIC ── */}
                {hStyle === 'pixie' && (
                  <g>
                    <path d="M 118 58 C 116 34, 130 24, 150 24 C 170 24, 184 34, 182 58 C 178 48, 164 44, 150 46 C 136 44, 122 48, 118 58 Z" fill={hair} />
                    <path d="M 140 28 L 148 40 L 144 28 Z" fill={hairLight} />
                  </g>
                )}

                {/* ── 20. WOLF CUT SHAGGY ── */}
                {hStyle === 'wolf_cut' && (
                  <g>
                    <path d="M 114 56 C 112 30, 128 20, 150 20 C 172 20, 188 30, 186 56 C 176 46, 164 40, 150 42 C 136 40, 124 46, 114 56 Z" fill={hair} />
                    <path d="M 120 54 L 112 70 L 122 66" fill={hairLight} />
                    <path d="M 180 54 L 188 70 L 178 66" fill={hairLight} />
                  </g>
                )}

                {/* ── 21. CLEAN TEMPLE FADE ── */}
                {hStyle === 'fade' && (
                  <g>
                    <path d="M 118 60 C 116 34, 130 24, 150 24 C 170 24, 184 34, 182 60 Q 150 52, 118 60 Z" fill={hair} />
                    <path d="M 120 58 Q 150 48, 180 58" stroke={hairDark} strokeWidth="3" fill="none" />
                  </g>
                )}

                {/* ── 22. TEXTURED UNDERCUT ── */}
                {hStyle === 'undercut' && (
                  <g>
                    <path d="M 116 56 C 118 26, 136 18, 156 20 C 174 22, 184 34, 182 54 Q 150 46, 116 56 Z" fill={hair} />
                    <path d="M 130 26 Q 154 22, 174 32" stroke={hairLight} strokeWidth="3.2" fill="none" strokeLinecap="round" />
                  </g>
                )}

                {/* ── COLECCIÓN DE SOMBREROS & GORROS ── */}
                {(() => {
                  const hwType = merged.accessories?.headwearType || (merged.accessories?.cap ? 'cap' : (merged.accessories?.beanie ? 'beanie' : 'none'));
                  const hwCol = merged.accessories?.headwearColor || merged.accessories?.capColor || merged.accessories?.beanieColor || '#18181b';

                  if (hwType === 'cap') {
                    return (
                      <g>
                        <path d="M 118 48 C 120 26, 140 20, 150 20 C 160 20, 180 26, 182 48 Z" fill={hwCol} />
                        <circle cx="150" cy="20" r="2.5" fill={shadeColor(hwCol, -25)} />
                        <path d="M 120 48 Q 150 52, 180 48 Q 188 52, 198 54 Q 150 58, 112 52 Z" fill={shadeColor(hwCol, 15)} />
                      </g>
                    );
                  }

                  if (hwType === 'beanie') {
                    return (
                      <g>
                        <ellipse cx="150" cy="42" rx="34" ry="24" fill={hwCol} />
                        <rect x="116" y="40" width="68" height="12" rx="4" fill={shadeColor(hwCol, -20)} />
                        <circle cx="150" cy="16" r="6.5" fill={shadeColor(hwCol, 20)} />
                      </g>
                    );
                  }

                  if (hwType === 'bucket_hat') {
                    return (
                      <g>
                        <path d="M 124 42 L 127 22 L 173 22 L 176 42 Z" fill={hwCol} />
                        <ellipse cx="150" cy="22" rx="23" ry="4.5" fill={shadeColor(hwCol, 15)} />
                        <path d="M 112 48 L 124 40 L 176 40 L 188 48 Q 150 54, 112 48 Z" fill={shadeColor(hwCol, -15)} />
                        <path d="M 124 40 L 176 40" stroke={shadeColor(hwCol, 25)} strokeWidth="1.2" />
                      </g>
                    );
                  }

                  if (hwType === 'sombrero_fedora') {
                    return (
                      <g>
                        <ellipse cx="150" cy="44" rx="44" ry="11" fill={hwCol} stroke={shadeColor(hwCol, -25)} strokeWidth="1" />
                        <path d="M 128 42 C 126 22, 134 16, 150 19 C 166 16, 174 22, 172 42 Z" fill={shadeColor(hwCol, 10)} />
                        <rect x="128" y="38" width="44" height="6" fill="#18181b" />
                        <circle cx="132" cy="41" r="1.5" fill="#d4af37" />
                      </g>
                    );
                  }

                  if (hwType === 'sombrero_vaquero') {
                    return (
                      <g>
                        <path d="M 106 42 C 114 48, 126 44, 150 44 C 174 44, 186 48, 194 42 C 196 38, 186 40, 150 40 C 114 40, 104 38, 106 42 Z" fill={shadeColor(hwCol, -20)} />
                        <ellipse cx="150" cy="42" rx="42" ry="7" fill={hwCol} />
                        <path d="M 128 40 C 126 18, 136 14, 150 18 C 164 14, 174 18, 172 40 Z" fill={hwCol} />
                        <path d="M 128 36 L 172 36" stroke="#3d2314" strokeWidth="3" />
                        <circle cx="150" cy="36" r="2" fill="#d4af37" />
                      </g>
                    );
                  }

                  if (hwType === 'boina') {
                    return (
                      <g>
                        <ellipse cx="146" cy="34" rx="36" ry="18" fill={hwCol} transform="rotate(-12 146 34)" />
                        <path d="M 143 14 L 142 9" stroke={shadeColor(hwCol, -30)} strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                    );
                  }

                  if (hwType === 'tiara') {
                    return (
                      <g>
                        <path d="M 126 44 L 130 30 L 138 38 L 150 24 L 162 38 L 170 30 L 174 44 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
                        <circle cx="150" cy="24" r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
                        <circle cx="130" cy="30" r="2" fill="#ec4899" stroke="#ffffff" strokeWidth="0.6" />
                        <circle cx="170" cy="30" r="2" fill="#ec4899" stroke="#ffffff" strokeWidth="0.6" />
                        <line x1="126" y1="43" x2="174" y2="43" stroke="#b45309" strokeWidth="2" />
                      </g>
                    );
                  }

                  return null;
                })()}

                {/* ── COLECCIÓN DE AUDÍFONOS & AUDIO ── */}
                {(() => {
                  const hpType = merged.accessories?.headphonesType || (merged.accessories?.headphones ? 'headphones_overear' : 'none');
                  const hpCol = merged.accessories?.headphonesColor || '#18181b';

                  if (hpType === 'headphones_overear') {
                    return (
                      <g stroke="#3f3f46" strokeWidth="3.5" fill="none">
                        <path d="M 116 80 C 114 36, 130 24, 150 24 C 170 24, 186 36, 184 80" />
                        <ellipse cx="116" cy="80" rx="7" ry="13" fill={hpCol} stroke="#71717a" strokeWidth="1.5" />
                        <ellipse cx="184" cy="80" rx="7" ry="13" fill={hpCol} stroke="#71717a" strokeWidth="1.5" />
                      </g>
                    );
                  }

                  if (hpType === 'headphones_neck') {
                    return (
                      <g>
                        <path d="M 124 126 C 122 144, 142 148, 150 148 C 158 148, 178 144, 176 126" stroke="#3f3f46" strokeWidth="4" fill="none" />
                        <ellipse cx="125" cy="126" rx="6" ry="10" fill={hpCol} stroke="#71717a" strokeWidth="1.2" transform="rotate(-20 125 126)" />
                        <ellipse cx="175" cy="126" rx="6" ry="10" fill={hpCol} stroke="#71717a" strokeWidth="1.2" transform="rotate(20 175 126)" />
                      </g>
                    );
                  }

                  if (hpType === 'airpods') {
                    return (
                      <g>
                        <circle cx="118" cy="80" r="2.8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
                        <rect x="117" y="81" width="1.8" height="6" rx="0.9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" transform="rotate(15 118 84)" />
                        <circle cx="182" cy="80" r="2.8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
                        <rect x="181" y="81" width="1.8" height="6" rx="0.9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" transform="rotate(-15 182 84)" />
                      </g>
                    );
                  }

                  if (hpType === 'gaming_headset') {
                    return (
                      <g>
                        <path d="M 114 80 C 112 34, 128 22, 150 22 C 172 22, 188 34, 186 80" stroke="#18181b" strokeWidth="5" fill="none" />
                        <ellipse cx="114" cy="80" rx="8" ry="14" fill={hpCol} stroke="#00ffff" strokeWidth="1.5" />
                        <ellipse cx="186" cy="80" rx="8" ry="14" fill={hpCol} stroke="#00ffff" strokeWidth="1.5" />
                        <circle cx="114" cy="80" r="3.5" fill="#00ffff" opacity="0.8" />
                        <circle cx="186" cy="80" r="3.5" fill="#00ffff" opacity="0.8" />
                        {/* Micrófono de brazo */}
                        <path d="M 114 84 Q 124 104, 142 98" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <ellipse cx="143" cy="98" rx="2.5" ry="2" fill="#00ffff" />
                      </g>
                    );
                  }

                  return null;
                })()}
              </g>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default ModularAvatar;
