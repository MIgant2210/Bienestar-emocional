import React from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 * KENNY — EquilibrIA Master Avatar (Modelo Maestro Oficial)
 * ═══════════════════════════════════════════════════════════════
 * Personaje oficial definitivo para la plataforma de bienestar EquilibrIA.
 * 
 * ESPECIFICACIONES MAESTRAS:
 * - Identidad: Joven adulto (23 años), amigable, atlético, empático y profesional.
 * - Rostro: Ojos grandes expresivos Pixar style, iris café cálido, cejas expresivas y sonrisa amable.
 * - Cabello: Modern Textured Curtains en castaño oscuro (#2b1b17), volumen superior orgánico,
 *            raya ligeramente desplazada, mechones ondulados y cuello 100% despejado y visible.
 * - Anatomía & Rigging: Jerarquía visual estricta Cabeza -> Cuello -> Hombros -> Torso -> Brazos -> Manos.
 * - Articulaciones Preparadas para Animación: Hombro, codo, antebrazo, muñeca, dedos/palmas.
 * - Outfit Oficial: Hoodie púrpura EquilibrIA (#634882) con colibrí blanco bordado,
 *                   pantalón cargo khaki (#b8a88a) con bolsillos laterales de solapa,
 *                   zapatillas skate negras (#232328) con puntera/suela blanca y smartwatch negro.
 */
export const KennyAvatar = ({
  pose = 'neutral',
  duration = 4,
  compact = false,
  isActive = false,
  secondsLeft = null,
  className = '',
  style = {}
}) => {
  const p = (pose || 'neutral').toLowerCase();

  // ── Mapeo de Estados y Animaciones ──
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
  const isEyesClosed = isInhale || isHold || isExhale || isShoulderDrop || isNeckRight || isNeckLeft || isNeckFront || isSeated || p.includes('eyes_closed') || p.includes('anclaje') || p.includes('observa');
  const isTension = isShrug || isFistClench || p.includes('concentrado') || p.includes('mandibula');

  const dur = `${Math.max(duration, 1.5)}s`;

  /* ── Paleta Maestra Oficial Kenny ── */
  const skin = '#e5ad82';
  const skinShadow = '#c98a5e';
  const skinLight = '#f5c6a3';
  const blush = 'rgba(230, 110, 90, 0.16)';
  
  // Cabello Castaño Oscuro 3D
  const hair = '#2b1b17';
  const hairDark = '#1a0e0b';
  const hairMid = '#422a22';
  const hairHighlight = '#654336';
  
  // Hoodie Púrpura / Violeta EquilibrIA
  const hoodieColor = '#634882';
  const hoodieLight = '#7e5ea5';
  const hoodieShadow = '#493362';
  const colibriColor = '#ffffff';
  
  // Pantalón Cargo Khaki
  const pantsColor = '#b8a88a';
  const pantsDark = '#918062';
  const pantsHighlight = '#ccbfa4';
  
  // Zapatillas Skate Negras Oficiales
  const shoeBlack = '#232328';
  const shoeWhite = '#ffffff';
  const shoeGrey = '#cbd5e1';
  const lipsColor = '#c76258';
  const eyeColor = '#2b160e';

  return (
    <div
      className={`kenny-master-avatar ${className}`}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        width: compact ? '180px' : '230px',
        height: compact ? '270px' : '340px',
        userSelect: 'none', perspective: '1200px', ...style
      }}
    >
      <style>{`
        @keyframes kBreathIn{0%{transform:scale(1) translateY(0)}50%{transform:scale(1.05,1.03) translateY(-4px)}100%{transform:scale(1.07,1.045) translateY(-6px)}}
        @keyframes kBreathOut{0%{transform:scale(1.07,1.045) translateY(-6px)}55%{transform:scale(1.01) translateY(-1px)}100%{transform:scale(.97) translateY(3px)}}
        
        /* Hombros: Elevación, Rotación y Soltado de Kenny */
        @keyframes kShrugTorso{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes kHeadSink{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
        @keyframes kRollTorsoL{0%{transform:translate(0,0)}25%{transform:translate(-3px,-15px)}50%{transform:translate(4px,-6px)}75%{transform:translate(1px,6px)}100%{transform:translate(0,0)}}
        @keyframes kRollTorsoR{0%{transform:translate(0,0)}25%{transform:translate(3px,-15px)}50%{transform:translate(-4px,-6px)}75%{transform:translate(-1px,6px)}100%{transform:translate(0,0)}}
        @keyframes kDropTorso{0%{transform:translateY(-16px)}30%{transform:translateY(6px)}65%{transform:translateY(-2px)}100%{transform:translateY(0)}}
        
        /* Cuello y Cabeza */
        @keyframes kNeckR{0%,100%{transform:rotate(18deg) translateY(2px)}50%{transform:rotate(24deg) translateY(4px)}}
        @keyframes kNeckL{0%,100%{transform:rotate(-18deg) translateY(2px)}50%{transform:rotate(-24deg) translateY(4px)}}
        @keyframes kNeckF{0%,100%{transform:translateY(6px) rotateX(-14deg)}50%{transform:translateY(12px) rotateX(-22deg)}}
        
        /* Brazos y Muñecas */
        @keyframes kWristRoll{0%{transform:rotate(0deg)}50%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}
        @keyframes kStretchPulse{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.04) translateY(-8px)}}
        @keyframes kTremor{0%,100%{transform:translate(0,0)}25%{transform:translate(1px,-1px)}75%{transform:translate(-1px,1px)}}
        @keyframes kJump{0%,100%{transform:translateY(0) scale(1)}25%{transform:translateY(-22px) scale(1.02)}55%{transform:translateY(-3px) scale(.98)}75%{transform:translateY(-10px) scale(1.01)}}
        @keyframes kVapor{0%{opacity:0;transform:translate(0,0) scale(.5)}30%{opacity:.85;transform:translate(12px,-8px) scale(1)}80%{opacity:.4;transform:translate(22px,-18px) scale(1.3)}100%{opacity:0;transform:translate(30px,-24px) scale(1.5)}}
        @keyframes kSpark{0%,100%{opacity:.2;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(180deg)}}
        
        .kb{transform-origin:150px 200px;animation:${isInhale?`kBreathIn ${dur} ease-out forwards`:isExhale?`kBreathOut ${dur} ease-in-out forwards`:'none'};}
        
        .ksh{transform-origin:150px 144px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'kShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'kDropTorso .8s ease-out':isRoll?'kRollTorsoL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        
        .kh{transform-origin:150px 118px;transition:transform .5s cubic-bezier(.34,1.4,.64,1);transform:${isLookUp?'translateY(-8px) rotateX(14deg)':isNeckRight?'rotate(20deg) translateY(3px)':isNeckLeft?'rotate(-20deg) translateY(3px)':isNeckFront?'translateY(10px) rotateX(-18deg)':isCelebrate?'translateY(-5px) rotate(2deg)':'none'};animation:${isShrug?'kHeadSink 2.2s ease-in-out infinite':isNeckRight?'kNeckR 2.8s ease-in-out infinite':isNeckLeft?'kNeckL 2.8s ease-in-out infinite':isNeckFront?'kNeckF 2.8s ease-in-out infinite':'none'};}
        
        .ksl{transform-origin:116px 144px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'kShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'kDropTorso .8s ease-out':isRoll?'kRollTorsoL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        .ksr{transform-origin:184px 144px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'kShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'kDropTorso .8s ease-out':isRoll?'kRollTorsoR 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        
        .kal{transform-origin:116px 144px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(-145deg) translate(-6px,-20px)':isStretchUp?'rotate(-168deg) translate(-8px,-30px)':isInhale?'rotate(-24deg) translate(10px,6px)':isPalmLeft?'rotate(-75deg) translate(12px,-6px)':isPalmRight?'rotate(-38deg) translate(22px,4px)':isWristRoll?'rotate(-50deg) translate(16px,2px)':isTwistRight?'rotate(-38deg) translate(16px,8px)':isTwistLeft?'rotate(-26deg) translate(10px,4px)':isSeated?'rotate(-16deg) translate(4px,14px)':isFistClench?'rotate(-32deg) translate(8px,-4px)':'rotate(0)'};animation:${isWristRoll?'kWristRoll 1.4s linear infinite':isStretchUp?'kStretchPulse 2.2s ease-in-out infinite':isFistClench?'kTremor 0.15s infinite':'none'};}
        .kar{transform-origin:184px 144px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(145deg) translate(6px,-20px)':isStretchUp?'rotate(168deg) translate(8px,-30px)':isInhale?'rotate(24deg) translate(-10px,6px)':isPalmRight?'rotate(75deg) translate(-12px,-6px)':isPalmLeft?'rotate(38deg) translate(-22px,4px)':isWristRoll?'rotate(50deg) translate(-16px,2px)':isTwistRight?'rotate(26deg) translate(-10px,4px)':isTwistLeft?'rotate(38deg) translate(-16px,8px)':isSeated?'rotate(16deg) translate(-4px,14px)':isFistClench?'rotate(32deg) translate(-8px,-4px)':'rotate(0)'};animation:${isWristRoll?'kWristRoll 1.4s linear infinite':isStretchUp?'kStretchPulse 2.2s ease-in-out infinite':isFistClench?'kTremor 0.15s infinite':'none'};}
      `}</style>

      {/* Sombra de suelo anatómica */}
      <div style={{position:'absolute',bottom:4,width:isSeated?'145px':'115px',height:'14px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(73,51,98,.34) 0%,transparent 70%)',filter:'blur(3px)',transition:'all .4s',zIndex:1,transform:isCelebrate?'scale(.7) translateY(12px)':'scale(1)'}}/>

      {/* Efecto de vapor al exhalar */}
      {(isShoulderDrop||isExhale)&&<div style={{position:'absolute',top:72,right:38,pointerEvents:'none',zIndex:15,animation:'kVapor 2s ease-out infinite'}}><svg width="36" height="26" viewBox="0 0 36 26"><path d="M5 18C5 12 12 10 15 14C16 9 25 9 27 14C30 12 33 15 31 19C33 22 28 24 25 22C22 25 13 24 11 22C8 24 4 22 5 18Z" fill="#e0e0e0" opacity=".85"/></svg></div>}

      {/* Destellos de celebración */}
      {isCelebrate&&<div style={{position:'absolute',inset:-12,pointerEvents:'none',zIndex:15}}><svg viewBox="0 0 300 400" style={{width:'100%',height:'100%'}}><path d="M50 55L56 43L68 39L56 35L50 23L44 35L32 39L44 43Z" fill="#fbbf24" style={{animation:'kSpark 1.2s ease-in-out infinite'}}/><path d="M250 65L255 54L268 51L255 48L250 37L245 48L232 51L245 54Z" fill="#c084fc" style={{animation:'kSpark 1.3s ease-in-out infinite .3s'}}/><path d="M150 12L154 4L164 1L154-2L150-10L146-2L136 1L146 4Z" fill="#e9d5ff" style={{animation:'kSpark 1.1s ease-in-out infinite .6s'}}/></svg></div>}

      <svg viewBox="0 0 300 400" style={{width:'100%',height:'100%',overflow:'visible',filter:'drop-shadow(0 10px 20px rgba(73,51,98,.15))',transition:'transform .55s cubic-bezier(.34,1.4,.64,1)',animation:isCelebrate?'kJump 2.2s ease-in-out infinite':'none',transform:isCelebrate?'none':isTwistRight?'rotateY(24deg) scale(.98)':isTwistLeft?'rotateY(-24deg) scale(.98)':isSeated?'translateY(38px)':'none'}}>

        {isBack ? (
          <g className="kb">
            {/* ═══ VISTA TRASERA MAESTRA DE KENNY (APERTURA DE PECHO / OMÓPLATOS) ═══ */}
            
            {/* 1. Pantalón cargo khaki posterior */}
            <path d="M 120 210 L 118 348 C 118 356, 122 362, 136 362 L 148 362 L 148 266 L 150 210 Z" fill={pantsColor}/>
            <path d="M 180 210 L 182 348 C 182 356, 178 362, 164 362 L 152 362 L 152 266 L 150 210 Z" fill={pantsColor}/>
            
            {/* Bolsillos cargo laterales */}
            <rect x="114" y="248" width="8" height="22" rx="2" fill={pantsDark}/>
            <rect x="178" y="248" width="8" height="22" rx="2" fill={pantsDark}/>

            {/* Zapatillas skate negras */}
            <ellipse cx="132" cy="362" rx="16" ry="8" fill={shoeBlack}/>
            <ellipse cx="168" cy="362" rx="16" ry="8" fill={shoeBlack}/>
            <path d="M 116 364 Q 132 368, 148 364" stroke={shoeWhite} strokeWidth="2.5" fill="none"/>
            <path d="M 152 364 Q 168 368, 184 364" stroke={shoeWhite} strokeWidth="2.5" fill="none"/>

            {/* 2. Cuello y Trapecios Posteriores (Proporción exacta con el frente) */}
            <path d="M 134 140 L 138 106 L 162 106 L 166 140 Z" fill={skin}/>
            <path d="M 142 118 L 150 125 L 158 118" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".4"/>

            {/* 3. Espalda de Hoodie Púrpura con apertura escapular */}
            <path d="M 116 144 C 114 168, 120 196, 126 208 L 174 208 C 180 196, 186 168, 184 144 Q 164 132, 150 134 Q 136 132, 116 144 Z" fill={hoodieColor}/>
            {/* Pliegues de tensión escapular en la espalda */}
            <path d="M 136 156 Q 150 166, 164 156" stroke={hoodieShadow} strokeWidth="2" fill="none" opacity=".7"/>
            {/* Capucha caída en nuca/espalda alta */}
            <path d="M 130 136 Q 150 148, 170 136 Q 160 162, 150 164 Q 140 162, 130 136 Z" fill={hoodieShadow} stroke={hoodieLight} strokeWidth="1.5"/>

            {/* 4. Brazos extendidos hacia atrás (Apertura de pecho) */}
            {/* Brazo Izquierdo */}
            <path d="M 116 144 Q 124 180, 142 220" stroke={hoodieColor} strokeWidth="15" strokeLinecap="round" fill="none"/>
            <circle cx="128" cy="180" r="7.5" fill={hoodieShadow}/>
            <path d="M 128 180 Q 136 204, 144 220" stroke={skin} strokeWidth="11" strokeLinecap="round" fill="none"/>

            {/* Brazo Derecho con Smartwatch */}
            <path d="M 184 144 Q 176 180, 158 220" stroke={hoodieColor} strokeWidth="15" strokeLinecap="round" fill="none"/>
            <circle cx="172" cy="180" r="7.5" fill={hoodieShadow}/>
            <path d="M 172 180 Q 164 204, 156 220" stroke={skin} strokeWidth="11" strokeLinecap="round" fill="none"/>
            {/* Reloj deportivo en muñeca derecha posterior */}
            <rect x="156" y="212" width="10" height="5" rx="1.5" fill="#18181b" stroke="#3f3f46" strokeWidth=".8"/>

            {/* 5. MANOS CLARAMENTE ENTRELAZADAS DETRÁS DE LA ESPALDA (CLAVE DEL EJERCICIO) */}
            <g transform="translate(150, 222)">
              {/* Bloque base de manos entrelazadas */}
              <ellipse cx="0" cy="2" rx="13" ry="9" fill={skin}/>
              <ellipse cx="0" cy="2" rx="11" ry="7.5" fill={skinLight} opacity=".4"/>
              
              {/* Dedos entrelazados visibles */}
              <path d="M-9-2 Q-7 3,-9 7" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M-4-3 Q-2 3,-4 8" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M 1-3 Q 3 3, 1 8" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M 6-3 Q 8 3, 6 8" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              
              {/* Pulgares apoyados */}
              <ellipse cx="-7" cy="-2" rx="3.5" ry="2.5" fill={skinLight} opacity=".8"/>
              <ellipse cx="7" cy="-2" rx="3.5" ry="2.5" fill={skinLight} opacity=".8"/>
            </g>

            {/* 6. Cabeza y Cabello Trasero Modern Textured Curtains */}
            <g transform="translate(0, 0)">
              {/* Base posterior del cráneo y orejas traseras */}
              <ellipse cx="118" cy="80" rx="4.5" ry="7" fill={skin}/>
              <ellipse cx="182" cy="80" rx="4.5" ry="7" fill={skin}/>

              {/* Cabello trasero con volumen y nuca cónica natural (alineada a y=106) */}
              <path d="M 118 70 C 114 30, 130 20, 150 20 C 170 20, 186 30, 182 70 C 182 88, 176 102, 168 106 Q 150 110, 132 106 C 124 102, 118 88, 118 70 Z" fill={hair}/>
              <path d="M 124 72 Q 150 98, 176 72 Q 168 108, 150 110 Q 132 108, 124 72 Z" fill={hairDark}/>
              <path d="M 136 28 Q 150 24, 164 28" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".25"/>
            </g>
          </g>
        ) : (
          <g className="kb">
            {/* ═══ VISTA FRONTAL MAESTRA DE KENNY ═══ */}

            {/* ── 1. Pantalón Cargo Khaki Oficial con Bolsillos Laterales ── */}
            <g transform={isSeated ? "translate(0,-30)" : "none"}>
              {isSeated ? (
                <g>
                  {/* 1. Sombra de contacto en el suelo */}
                  <ellipse cx="150" cy="314" rx="96" ry="14" fill="#000000" opacity="0.16" />

                  {/* 2. Base de Pelvis y Cadera Cargo */}
                  <path 
                    d="M 124 206 C 110 220, 100 238, 106 256 C 114 276, 136 288, 150 288 C 164 288, 186 276, 194 256 C 200 238, 190 220, 176 206 Z" 
                    fill={pantsDark} 
                  />

                  {/* 3. Muslo y Rodilla Izquierda apoyada y flexionada hacia afuera */}
                  <path 
                    d="M 124 206 C 94 210, 62 232, 54 258 C 46 282, 58 300, 84 304 C 110 306, 142 292, 160 278 C 132 274, 110 254, 116 230 C 120 216, 122 208, 124 206 Z" 
                    fill={pantsColor} 
                  />
                  <path 
                    d="M 56 268 C 62 290, 82 300, 106 302 C 90 298, 74 286, 68 268 Z" 
                    fill={pantsDark} 
                    opacity="0.4" 
                  />

                  {/* 4. Muslo y Rodilla Derecha apoyada y flexionada hacia afuera */}
                  <path 
                    d="M 176 206 C 206 210, 238 232, 246 258 C 254 282, 242 300, 216 304 C 190 306, 158 292, 140 278 C 168 274, 190 254, 184 230 C 180 216, 178 208, 176 206 Z" 
                    fill={pantsColor} 
                  />
                  <path 
                    d="M 244 268 C 238 290, 218 300, 194 302 C 210 298, 226 286, 232 268 Z" 
                    fill={pantsDark} 
                    opacity="0.4" 
                  />

                  {/* 5. Pantorrilla Cruzada Inferior */}
                  <path 
                    d="M 226 286 C 210 300, 178 308, 145 308 C 120 308, 96 300, 86 288 C 96 282, 120 286, 145 288 C 176 290, 206 284, 226 286 Z" 
                    fill={pantsDark} 
                  />

                  {/* 6. Pantorrilla Cruzada Superior en Flor de Loto */}
                  <path 
                    d="M 72 284 C 88 296, 118 306, 150 306 C 182 306, 212 296, 228 284 C 216 274, 186 278, 150 278 C 114 278, 84 274, 72 284 Z" 
                    fill={pantsColor} 
                  />

                  {/* Costuras y pliegues Cargo */}
                  <path 
                    d="M 90 288 C 122 300, 178 300, 210 288" 
                    stroke={pantsDark} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.5" 
                  />
                  <path 
                    d="M 120 274 C 138 282, 162 282, 180 274" 
                    stroke={pantsDark} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.35" 
                  />

                  {/* Calzado Izquierdo (Sneakers Kenny) */}
                  <g transform="translate(180, 295) rotate(-12)">
                    <path d="M 0 12 Q 18 16 36 11 L 35 15 Q 18 19 0 15 Z" fill={shoeWhite} />
                    <path d="M 0 15 Q 18 19 35 15" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <path d="M 2 12 C 2 6, 8 2, 16 3 C 24 4, 30 7, 34 11 Z" fill={shoeBlack} />
                    <ellipse cx="6" cy="11" rx="4.5" ry="2.5" fill={shoeWhite} opacity="0.9" />
                    <line x1="14" y1="5" x2="18" y2="9" stroke={shoeWhite} strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="18" y1="6" x2="22" y2="10" stroke={shoeWhite} strokeWidth="1.2" strokeLinecap="round" />
                  </g>

                  {/* Calzado Derecho (Sneakers Kenny) */}
                  <g transform="translate(84, 295) rotate(12)">
                    <path d="M 0 11 Q 18 16 36 12 L 36 15 Q 18 19 1 15 Z" fill={shoeWhite} />
                    <path d="M 1 15 Q 18 19 36 15" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <path d="M 2 11 C 6 7, 12 4, 20 3 C 28 2, 34 6, 34 12 Z" fill={shoeBlack} />
                    <ellipse cx="30" cy="11" rx="4.5" ry="2.5" fill={shoeWhite} opacity="0.9" />
                    <line x1="18" y1="5" x2="14" y2="9" stroke={shoeWhite} strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="22" y1="6" x2="18" y2="10" stroke={shoeWhite} strokeWidth="1.2" strokeLinecap="round" />
                  </g>
                </g>
              ) : (
                <g>
                  {/* Pierna Izquierda Recta Cargo */}
                  <path d="M 120 210 L 118 346 C 118 354, 122 358, 134 358 L 148 358 L 148 264 L 150 210 Z" fill={pantsColor}/>
                  {/* Pierna Derecha Recta Cargo */}
                  <path d="M 180 210 L 182 346 C 182 354, 178 358, 166 358 L 152 358 L 152 264 L 150 210 Z" fill={pantsColor}/>
                  
                  {/* Costuras estructuradas */}
                  <line x1="133" y1="216" x2="133" y2="346" stroke={pantsHighlight} strokeWidth="1.4" opacity=".5"/>
                  <line x1="167" y1="216" x2="167" y2="346" stroke={pantsHighlight} strokeWidth="1.4" opacity=".5"/>
                  
                  {/* ── Bolsillos Cargo con Solapa ── */}
                  {/* Bolsillo Cargo Izquierdo */}
                  <g transform="translate(113,248)">
                    <rect x="0" y="0" width="10" height="22" rx="2" fill={pantsColor} stroke={pantsDark} strokeWidth="1.2"/>
                    <path d="M-1 0 L 11 0 L 11 6 L 5 8 L-1 6 Z" fill={pantsDark}/>
                  </g>

                  {/* Bolsillo Cargo Derecho */}
                  <g transform="translate(177,248)">
                    <rect x="0" y="0" width="10" height="22" rx="2" fill={pantsColor} stroke={pantsDark} strokeWidth="1.2"/>
                    <path d="M-1 0 L 11 0 L 11 6 L 5 8 L-1 6 Z" fill={pantsDark}/>
                  </g>

                  {/* Dobladillos de botamanga */}
                  <rect x="118" y="344" width="30" height="3.5" rx="1.2" fill={pantsDark}/>
                  <rect x="152" y="344" width="30" height="3.5" rx="1.2" fill={pantsDark}/>

                  {/* ── Zapatillas Skate Negras Oficiales (Canvas + Puntera de Goma y Suela Blanca) ── */}
                  <g transform="translate(108,350)">
                    <ellipse cx="20" cy="10" rx="19" ry="8" fill={shoeWhite}/>
                    <path d="M 2 10 Q 20 6 38 10 Q 36 2 20 2 Q 4 2 2 10 Z" fill={shoeBlack}/>
                    <path d="M 2 9 C 2 5, 8 4, 12 7 C 8 10, 4 10, 2 9 Z" fill={shoeWhite}/>
                    <line x1="16" y1="4" x2="24" y2="4" stroke={shoeWhite} strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="17" y1="6.5" x2="23" y2="6.5" stroke={shoeWhite} strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M 2 12 Q 20 16 38 12" stroke={shoeGrey} strokeWidth="1.8" fill="none"/>
                  </g>

                  <g transform="translate(152,350)">
                    <ellipse cx="20" cy="10" rx="19" ry="8" fill={shoeWhite}/>
                    <path d="M 2 10 Q 20 6 38 10 Q 36 2 20 2 Q 4 2 2 10 Z" fill={shoeBlack}/>
                    <path d="M 28 7 C 32 4, 38 5, 38 9 C 36 10, 32 10, 28 7 Z" fill={shoeWhite}/>
                    <line x1="16" y1="4" x2="24" y2="4" stroke={shoeWhite} strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="17" y1="6.5" x2="23" y2="6.5" stroke={shoeWhite} strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M 2 12 Q 20 16 38 12" stroke={shoeGrey} strokeWidth="1.8" fill="none"/>
                  </g>
                </g>
              )}
            </g>

            {/* ── 2. Torso con Hoodie Púrpura / Violeta EquilibrIA ── */}
            <g className="ksh">
              {/* Torso juvenil atlético */}
              <path d="M 116 144 C 114 166, 120 194, 126 210 L 174 210 C 180 194, 186 166, 184 144 Q 164 132, 150 134 Q 136 132, 116 144 Z" fill={hoodieColor}/>
              
              {/* Sombreado anatómico en el pecho */}
              <path d="M 126 156 Q 150 166, 174 156" stroke={hoodieLight} strokeWidth="2.5" fill="none" opacity=".5"/>
              
              {/* Cuello cruzado de la sudadera con clara separación anatómica */}
              <path d="M 134 132 C 134 126, 166 126, 166 132 C 166 140, 134 140, 134 132 Z" fill={hoodieShadow}/>
              <path d="M 138 132 Q 150 142, 162 132" stroke={hoodieLight} strokeWidth="1.5" fill="none"/>
              
              {/* Cordones blancos de la sudadera */}
              <line x1="144" y1="136" x2="142" y2="152" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity=".95"/>
              <line x1="156" y1="136" x2="158" y2="152" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity=".95"/>
              <circle cx="142" cy="152" r="1.6" fill="#ffffff"/>
              <circle cx="158" cy="152" r="1.6" fill="#ffffff"/>
              
              {/* Bolsillo canguro frontal */}
              <path d="M 132 184 L 140 200 L 160 200 L 168 184 Z" fill={hoodieShadow} opacity=".4"/>
              
              {/* ── Bordado del Colibrí en el pecho en Blanco Puro Oficial ── */}
              <g transform="translate(164,152) scale(.52)">
                <path d="M 0 0 C 6-8 15-6 12 2 C 9 6 4 8 0 11 C-4 8-9 6-12 2 C-15-6-6-8 0 0 Z" fill={colibriColor}/>
                <circle cx="0" cy="2" r="2.2" fill={hoodieLight}/>
                <line x1="0" y1="11" x2="2" y2="16" stroke={colibriColor} strokeWidth="1.5"/>
              </g>
              
              {/* Cinturilla inferior */}
              <rect x="126" y="206" width="48" height="5" rx="2" fill={hoodieShadow}/>
            </g>

            {/* ── 3. Brazo izquierdo articulado (Pivote de hombro 116, 144) ── */}
            <g className="kal">
              <g className="ksl">
                {/* Manga / Brazo superior */}
                <path d="M 116 144 Q 96 170, 102 204" stroke={hoodieColor} strokeWidth="16" strokeLinecap="round" fill="none"/>
                {/* Codo / Puño de sudadera */}
                <circle cx="102" cy="204" r="8" fill={hoodieShadow}/>
                {/* Antebrazo anatómico */}
                <path d="M 102 204 Q 100 218, 100 228" stroke={skin} strokeWidth="12" strokeLinecap="round" fill="none"/>
                {/* Mano / Muñeca con detalle articular */}
                {isFistClench ? (
                  <g transform="translate(100,230)">
                    <circle cx="0" cy="0" r="7" fill={skinShadow}/>
                    <path d="M-4-2 Q 0 2, 4-2" stroke={skin} strokeWidth="1.5" fill="none"/>
                  </g>
                ) : isPalmLeft || isPalmRight ? (
                  <g transform="translate(100,230)">
                    <ellipse cx="0" cy="2" rx="7" ry="5.5" fill={skin}/>
                    <path d="M-5-1 L-5 5 M-2-2 L-2 6 M 1-2 L 1 6 M 4-1 L 4 5" stroke={skinShadow} strokeWidth="1" opacity=".6"/>
                  </g>
                ) : (
                  <g transform="translate(100,232)">
                    <ellipse cx="0" cy="0" rx="6" ry="5.5" fill={skin}/>
                    {/* Pulgar natural */}
                    <ellipse cx="4" cy="-2" rx="2.5" ry="3" fill={skinLight} opacity=".7"/>
                  </g>
                )}
              </g>
            </g>

            {/* ── 4. Brazo derecho articulado (Pivote de hombro 184, 144 con Smartwatch) ── */}
            <g className="kar">
              <g className="ksr">
                {/* Manga / Brazo superior */}
                <path d="M 184 144 Q 204 170, 198 204" stroke={hoodieColor} strokeWidth="16" strokeLinecap="round" fill="none"/>
                {/* Codo / Puño de sudadera */}
                <circle cx="198" cy="204" r="8" fill={hoodieShadow}/>
                {/* Antebrazo anatómico */}
                <path d="M 198 204 Q 200 218, 200 228" stroke={skin} strokeWidth="12" strokeLinecap="round" fill="none"/>
                {/* Reloj deportivo negro de Kenny */}
                <rect x="194" y="212" width="11" height="5.5" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth=".8"/>
                {/* Mano / Muñeca con detalle articular */}
                {isFistClench ? (
                  <g transform="translate(200,230)">
                    <circle cx="0" cy="0" r="7" fill={skinShadow}/>
                    <path d="M-4-2 Q 0 2, 4-2" stroke={skin} strokeWidth="1.5" fill="none"/>
                  </g>
                ) : isPalmLeft || isPalmRight ? (
                  <g transform="translate(200,230)">
                    <ellipse cx="0" cy="2" rx="7" ry="5.5" fill={skin}/>
                    <path d="M-4-1 L-4 5 M-1-2 L-1 6 M 2-2 L 2 6 M 5-1 L 5 5" stroke={skinShadow} strokeWidth="1" opacity=".6"/>
                  </g>
                ) : (
                  <g transform="translate(200,232)">
                    <ellipse cx="0" cy="0" rx="6" ry="5.5" fill={skin}/>
                    {/* Pulgar natural */}
                    <ellipse cx="-4" cy="-2" rx="2.5" ry="3" fill={skinLight} opacity=".7"/>
                  </g>
                )}
              </g>
            </g>

            {/* ── 5. CUELLO ANATÓMICO (Separación clara Cabeza -> Cuello -> Hombros -> Torso) ── */}
            <g className="kh">
              <rect x="140" y="110" width="20" height="26" rx="4" fill={skin}/>
              {/* Sombra de mandíbula y relieve del cuello */}
              <path d="M 136 126 L 150 134 L 164 126" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".45"/>
            </g>

            {/* ── 6. CABEZA, ROSTRO Y CABELLO OFICIAL (Kenny — Master Rig) ── */}
            <g className="kh">
              {/* Base Trasera del Cabello (Limpia y con nuca visible sin caer sobre el cuello) */}
              <path d="M 116 68 C 114 24, 130 14, 148 14 C 168 14, 184 22, 184 68 C 184 84, 178 94, 170 96 Q 148 98, 128 96 C 120 94, 116 84, 116 68 Z" fill={hairDark}/>

              {/* Orejas Proporcionadas */}
              <ellipse cx="114" cy="80" rx="6" ry="8.5" fill={skin}/>
              <ellipse cx="114" cy="80" rx="3" ry="4.5" fill={skinShadow} opacity=".35"/>
              <ellipse cx="186" cy="80" rx="6" ry="8.5" fill={skin}/>
              <ellipse cx="186" cy="80" rx="3" ry="4.5" fill={skinShadow} opacity=".35"/>

              {/* Contorno Facial Masculino Armónico (Mandíbula definida, barbilla atlética) */}
              <path d="M 116 70 C 116 48, 184 48, 184 70 C 184 96, 174 118, 150 122 C 126 118, 116 96, 116 70 Z" fill={skin}/>
              <path d="M 118 70 C 118 52, 182 52, 182 70 C 182 94, 172 115, 150 119 C 128 115, 118 94, 118 70 Z" fill={skinLight} opacity=".25"/>

              {/* Cejas Masculinas Definidas y Expresivas */}
              <path d={isTension?"M 122 66 Q 132 69, 142 66":"M 122 62 Q 132 57, 143 62"} stroke={hairDark} strokeWidth="3.6" strokeLinecap="round" fill="none"/>
              <path d={isTension?"M 178 66 Q 168 69, 158 66":"M 178 62 Q 168 57, 157 62"} stroke={hairDark} strokeWidth="3.6" strokeLinecap="round" fill="none"/>

              {/* Ojos Grandes Expresivos Pixar Style (11 Expresiones Adaptables) */}
              {isEyesClosed ? (
                <g>
                  <path d="M 123 78 Q 132 86, 141 78" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
                  <path d="M 159 78 Q 168 86, 177 78" stroke={eyeColor} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
                </g>
              ) : (
                <g>
                  {/* Ojo Izquierdo */}
                  <ellipse cx="132" cy="77" rx="7.5" ry="8.6" fill="#ffffff"/>
                  <ellipse cx="132" cy="77.5" rx="5.4" ry="6.8" fill={eyeColor}/>
                  <circle cx="132" cy="77.5" r="3.2" fill="#080402"/>
                  {/* Brillo nítido de luz */}
                  <circle cx="129.8" cy="74.8" r="2.2" fill="#ffffff"/>
                  <circle cx="134.5" cy="80.2" r="1.1" fill="#ffffff" opacity=".7"/>
                  {/* Párpado superior masculino */}
                  <path d="M 123 76 Q 132 71.5, 141 75.5" stroke={eyeColor} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                  <path d="M 124 72 Q 132 69.5, 140 72" stroke={skinShadow} strokeWidth="1" fill="none"/>

                  {/* Ojo Derecho */}
                  <ellipse cx="168" cy="77" rx="7.5" ry="8.6" fill="#ffffff"/>
                  <ellipse cx="168" cy="77.5" rx="5.4" ry="6.8" fill={eyeColor}/>
                  <circle cx="168" cy="77.5" r="3.2" fill="#080402"/>
                  {/* Brillo nítido de luz */}
                  <circle cx="165.8" cy="74.8" r="2.2" fill="#ffffff"/>
                  <circle cx="170.5" cy="80.2" r="1.1" fill="#ffffff" opacity=".7"/>
                  {/* Párpado superior masculino */}
                  <path d="M 159 75.5 Q 168 71.5, 177 76" stroke={eyeColor} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                  <path d="M 160 72 Q 168 69.5, 176 72" stroke={skinShadow} strokeWidth="1" fill="none"/>
                </g>
              )}

              {/* Nariz Masculina Estilizada */}
              <path d="M 148 76 L 147 88 Q 150 91, 153 88" stroke={skinShadow} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <ellipse cx="150" cy="89" rx="3.2" ry="2" fill={skinShadow}/>

              {/* Boca Expresiva (Neutral, Sonrisa, Alivio, Esfuerzo, Celebración) */}
              {isCelebrate ? (
                <g>
                  <path d="M 139 96 Q 150 112, 161 96 Z" fill={lipsColor}/>
                  <path d="M 143 98 Q 150 105, 157 98" fill="#ffffff"/>
                </g>
              ) : isExhale || isShoulderDrop ? (
                <ellipse cx="150" cy="99" rx="4" ry="3.5" fill={lipsColor} opacity=".85"/>
              ) : isTension ? (
                <line x1="142" y1="99" x2="158" y2="99" stroke={lipsColor} strokeWidth="2.4" strokeLinecap="round"/>
              ) : (
                <path d="M 138 97 Q 150 106, 162 96" stroke={lipsColor} strokeWidth="2.6" strokeLinecap="round" fill="none"/>
              )}

              {/* ── 7. CABELLO MAESTRO: MODERN TEXTURED CURTAINS 3D ── */}
              {/* Volumen superior anatómico que respeta la forma craneal */}
              <path d="M 115 58 C 114 20, 130 12, 147 12 C 166 12, 183 20, 185 58 C 181 44, 168 34, 147 34 C 130 34, 119 44, 115 58 Z" fill={hair}/>
              <path d="M 118 52 C 118 20, 132 14, 147 14 C 164 14, 180 20, 181 52 C 176 40, 165 32, 147 33 C 132 32, 122 40, 118 52 Z" fill={hairMid}/>

              {/* Patillas y laterales estilizados (Terminan limpiamente arriba de la oreja) */}
              <path d="M 116 56 Q 113 68, 117 76 Q 119 68, 121 60 Z" fill={hairDark}/>
              <path d="M 184 56 Q 187 68, 183 76 Q 181 68, 179 60 Z" fill={hairDark}/>

              {/* Mechón Principal Izquierdo en onda orgánica */}
              <path d="M 146 32 C 138 22, 126 18, 117 26 C 109 34, 110 50, 114 66 C 116 74, 118 78, 117 82 C 120 74, 123 64, 126 56 C 132 46, 138 42, 146 32 Z" fill={hair}/>
              <path d="M 144 32 C 136 22, 126 20, 119 28 C 113 36, 114 50, 117 64 C 120 72, 121 76, 120 78 C 122 70, 125 62, 128 54 C 133 46, 138 40, 144 32 Z" fill={hairMid}/>
              
              {/* Mechón suelto / flequillo secundario izquierdo */}
              <path d="M 145 34 Q 134 40, 124 50 Q 120 58, 122 66 C 124 60, 128 54, 136 48 C 140 44, 144 40, 145 34 Z" fill={hairDark}/>
              <path d="M 146 34 Q 133 42, 125 54 Q 120 64, 121 72" stroke={hairHighlight} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
              <path d="M 140 38 Q 130 46, 126 56" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".22"/>

              {/* Mechón Principal Derecho con raya desplazada orgánica */}
              <path d="M 146 32 C 156 20, 170 16, 180 24 C 189 32, 188 48, 185 66 C 183 74, 181 78, 183 82 C 180 74, 178 64, 174 56 C 168 46, 158 40, 146 32 Z" fill={hair}/>
              <path d="M 148 32 C 158 20, 168 18, 177 26 C 185 34, 184 48, 181 64 C 180 72, 178 76, 180 78 C 178 70, 175 62, 172 54 C 166 46, 158 40, 148 32 Z" fill={hairMid}/>

              {/* Mechón suelto / flequillo secundario derecho */}
              <path d="M 147 34 Q 158 38, 168 48 Q 174 56, 172 66 C 170 60, 165 54, 157 48 C 152 44, 148 40, 147 34 Z" fill={hairDark}/>
              <path d="M 147 34 Q 160 40, 170 52 Q 176 62, 175 72" stroke={hairHighlight} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
              <path d="M 152 38 Q 164 46, 168 56" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".22"/>

              {/* Mechón central flotante (Raya orgánica no geométrica) */}
              <path d="M 146 30 Q 148 42, 143 50 Q 146 44, 147 36 Z" fill={hairHighlight}/>
              <path d="M 147 30 Q 152 40, 154 48 Q 151 42, 148 34 Z" fill={hairDark}/>

              {/* Reflejos de iluminación 3D en la corona */}
              <path d="M 126 18 Q 120 26, 118 36" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".3"/>
              <path d="M 166 18 Q 172 26, 176 36" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".3"/>
              <path d="M 136 15 Q 147 13, 158 15" stroke={hairHighlight} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".6"/>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default KennyAvatar;
