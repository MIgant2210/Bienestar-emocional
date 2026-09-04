import React from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 * ANGIE — EquilibrIA Master Avatar (Modelo Maestro Oficial)
 * ═══════════════════════════════════════════════════════════════
 * Guía de Bienestar Femenina Oficial para EquilibrIA.
 * 
 * ESPECIFICACIONES ANATÓMICAS & RIGGING:
 * - Hombros 100% integrados al torso (sin desconexión ni flotación en neutral).
 * - Articulaciones Independientes: Cabeza, Cuello, Hombros (L/R), Brazos (L/R),
 *   Antebrazos (L/R), Muñecas/Manos (L/R), Torso, Pelvis, Piernas y Pies.
 * - Sincronización en tiempo real con fases de respiración, temporizadores y ejercicios.
 */
export const AngieAvatar = ({
  pose = 'neutral',
  duration = 4,
  compact = false,
  isActive = false,
  secondsLeft = null,
  className = '',
  style = {}
}) => {
  const p = (pose || 'neutral').toLowerCase();

  // ── Mapeo de Poses y Estados ──
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
  const isTension = isShrug || isFistClench || p.includes('concentrada') || p.includes('mandibula');

  const dur = `${Math.max(duration, 1.5)}s`;

  /* ── Paleta Maestra Angie ── */
  const skin = '#f0c4a0';
  const skinShadow = '#dba47a';
  const skinLight = '#fce0c8';
  const hair = '#3b1c0e';
  const hairLight = '#5a2e16';
  const hairDark = '#220e06';
  const topColor = '#ede9fe';
  const topShadow = '#c4b5fd';
  const purpleAccent = '#7c3aed';
  const lilacAccent = '#c084fc';
  const orangeAccent = '#f97316';
  const pantsColor = '#1e1b4b';
  const pantsDark = '#0f0e26';
  const shoeColor = '#ffffff';
  const shoeShadow = '#cbd5e1';
  const lipsColor = '#d4686e';
  const eyeColor = '#2e1509';
  const glassFrame = '#7c3aed';
  const blush = 'rgba(220,120,120,0.22)';

  return (
    <div
      className={`angie-master-avatar ${className}`}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        width: compact ? '180px' : '230px',
        height: compact ? '270px' : '340px',
        userSelect: 'none', perspective: '1200px', ...style
      }}
    >
      <style>{`
        /* Respiración sincronizada */
        @keyframes aBreathIn{0%{transform:scale(1) translateY(0)}50%{transform:scale(1.05,1.03) translateY(-4px)}100%{transform:scale(1.07,1.045) translateY(-6px)}}
        @keyframes aBreathOut{0%{transform:scale(1.07,1.045) translateY(-6px)}55%{transform:scale(1.01) translateY(-1px)}100%{transform:scale(.97) translateY(3px)}}
        
        /* Hombros: Elevación, Rotación y Soltado */
        @keyframes aShrugTorso{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes aHeadSink{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
        @keyframes aRollTorsoL{0%{transform:translate(0,0)}25%{transform:translate(-3px,-15px)}50%{transform:translate(4px,-6px)}75%{transform:translate(1px,6px)}100%{transform:translate(0,0)}}
        @keyframes aRollTorsoR{0%{transform:translate(0,0)}25%{transform:translate(3px,-15px)}50%{transform:translate(-4px,-6px)}75%{transform:translate(-1px,6px)}100%{transform:translate(0,0)}}
        @keyframes aDropTorso{0%{transform:translateY(-16px)}30%{transform:translateY(6px)}65%{transform:translateY(-2px)}100%{transform:translateY(0)}}
        
        /* Cuello: Inclinaciones anatómicas fluidas */
        @keyframes aNeckR{0%,100%{transform:rotate(18deg) translateY(2px)}50%{transform:rotate(24deg) translateY(4px)}}
        @keyframes aNeckL{0%,100%{transform:rotate(-18deg) translateY(2px)}50%{transform:rotate(-24deg) translateY(4px)}}
        @keyframes aNeckF{0%,100%{transform:translateY(6px) rotateX(-14deg)}50%{transform:translateY(12px) rotateX(-22deg)}}
        
        /* Brazos y Muñecas */
        @keyframes aWristRoll{0%{transform:rotate(0deg)}50%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}
        @keyframes aStretchPulse{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.04) translateY(-8px)}}
        @keyframes aTremor{0%,100%{transform:translate(0,0)}25%{transform:translate(1px,-1px)}75%{transform:translate(-1px,1px)}}
        @keyframes aJump{0%,100%{transform:translateY(0) scale(1)}25%{transform:translateY(-22px) scale(1.02)}55%{transform:translateY(-3px) scale(.98)}75%{transform:translateY(-10px) scale(1.01)}}
        @keyframes aVapor{0%{opacity:0;transform:translate(0,0) scale(.5)}30%{opacity:.85;transform:translate(12px,-8px) scale(1)}80%{opacity:.4;transform:translate(22px,-18px) scale(1.3)}100%{opacity:0;transform:translate(30px,-24px) scale(1.5)}}
        @keyframes aSpark{0%,100%{opacity:.2;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(180deg)}}
        
        .ab{transform-origin:150px 200px;animation:${isInhale?`aBreathIn ${dur} ease-out forwards`:isExhale?`aBreathOut ${dur} ease-in-out forwards`:'none'};}
        
        .ash{transform-origin:150px 146px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'aShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'aDropTorso .8s ease-out':isRoll?'aRollTorsoL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        
        .ah{transform-origin:150px 118px;transition:transform .5s cubic-bezier(.34,1.4,.64,1);transform:${isLookUp?'translateY(-8px) rotateX(14deg)':isNeckRight?'rotate(20deg) translateY(3px)':isNeckLeft?'rotate(-20deg) translateY(3px)':isNeckFront?'translateY(10px) rotateX(-18deg)':isCelebrate?'translateY(-5px) rotate(2deg)':'none'};animation:${isShrug?'aHeadSink 2.2s ease-in-out infinite':isNeckRight?'aNeckR 2.8s ease-in-out infinite':isNeckLeft?'aNeckL 2.8s ease-in-out infinite':isNeckFront?'aNeckF 2.8s ease-in-out infinite':'none'};}
        
        .asl{transform-origin:126px 146px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'aShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'aDropTorso .8s ease-out':isRoll?'aRollTorsoL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        .asr{transform-origin:174px 146px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);animation:${isShrug?'aShrugTorso 2.2s ease-in-out infinite':isShoulderDrop?'aDropTorso .8s ease-out':isRoll?'aRollTorsoR 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        
        .aal{transform-origin:126px 146px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(-145deg) translate(-6px,-20px)':isStretchUp?'rotate(-168deg) translate(-8px,-30px)':isInhale?'rotate(-24deg) translate(10px,6px)':isPalmLeft?'rotate(-75deg) translate(12px,-6px)':isPalmRight?'rotate(-38deg) translate(22px,4px)':isWristRoll?'rotate(-50deg) translate(16px,2px)':isTwistRight?'rotate(-38deg) translate(16px,8px)':isTwistLeft?'rotate(-26deg) translate(10px,4px)':isSeated?'rotate(-16deg) translate(4px,14px)':isFistClench?'rotate(-32deg) translate(8px,-4px)':'rotate(0)'};animation:${isWristRoll?'aWristRoll 1.4s linear infinite':isStretchUp?'aStretchPulse 2.2s ease-in-out infinite':isFistClench?'aTremor 0.15s infinite':'none'};}
        .aar{transform-origin:174px 146px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(145deg) translate(6px,-20px)':isStretchUp?'rotate(168deg) translate(8px,-30px)':isInhale?'rotate(24deg) translate(-10px,6px)':isPalmRight?'rotate(75deg) translate(-12px,-6px)':isPalmLeft?'rotate(38deg) translate(-22px,4px)':isWristRoll?'rotate(50deg) translate(-16px,2px)':isTwistRight?'rotate(26deg) translate(-10px,4px)':isTwistLeft?'rotate(38deg) translate(-16px,8px)':isSeated?'rotate(16deg) translate(-4px,14px)':isFistClench?'rotate(32deg) translate(-8px,-4px)':'rotate(0)'};animation:${isWristRoll?'aWristRoll 1.4s linear infinite':isStretchUp?'aStretchPulse 2.2s ease-in-out infinite':isFistClench?'aTremor 0.15s infinite':'none'};}
      `}</style>

      {/* Sombra de suelo anatómica */}
      <div style={{position:'absolute',bottom:4,width:isSeated?'140px':'120px',height:'12px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(124,58,237,.3) 0%,transparent 70%)',filter:'blur(3px)',transition:'all .4s',zIndex:1,transform:isCelebrate?'scale(.7) translateY(12px)':'scale(1)'}}/>

      {/* Vapor al exhalar */}
      {(isShoulderDrop||isExhale)&&<div style={{position:'absolute',top:72,right:42,pointerEvents:'none',zIndex:15,animation:'aVapor 2s ease-out infinite'}}><svg width="36" height="26" viewBox="0 0 36 26"><path d="M5 18C5 12 12 10 15 14C16 9 25 9 27 14C30 12 33 15 31 19C33 22 28 24 25 22C22 25 13 24 11 22C8 24 4 22 5 18Z" fill="#e0e0e0" opacity=".85"/></svg></div>}

      {/* Destellos de celebración */}
      {isCelebrate&&<div style={{position:'absolute',inset:-12,pointerEvents:'none',zIndex:15}}><svg viewBox="0 0 300 400" style={{width:'100%',height:'100%'}}><path d="M50 55L56 43L68 39L56 35L50 23L44 35L32 39L44 43Z" fill="#fbbf24" style={{animation:'aSpark 1.2s ease-in-out infinite'}}/><path d="M250 65L255 54L268 51L255 48L250 37L245 48L232 51L245 54Z" fill="#f97316" style={{animation:'aSpark 1.3s ease-in-out infinite .3s'}}/><path d="M150 12L154 4L164 1L154-2L150-10L146-2L136 1L146 4Z" fill="#c084fc" style={{animation:'aSpark 1.1s ease-in-out infinite .6s'}}/></svg></div>}

      <svg viewBox="0 0 300 400" style={{width:'100%',height:'100%',overflow:'visible',filter:'drop-shadow(0 10px 20px rgba(124,58,237,.12))',transition:'transform .55s cubic-bezier(.34,1.4,.64,1)',animation:isCelebrate?'aJump 2.2s ease-in-out infinite':'none',transform:isCelebrate?'none':isTwistRight?'rotateY(24deg) scale(.98)':isTwistLeft?'rotateY(-24deg) scale(.98)':isSeated?'translateY(38px)':'none'}}>

        {isBack ? (
          <g className="ab">
            {/* ═══ VISTA TRASERA MAESTRA DE ANGIE (APERTURA DE PECHO / OMÓPLATOS) ═══ */}
            
            {/* 1. Caderas y leggings traseros esculpidos */}
            <path d="M 134 206 C 120 216, 114 230, 120 348 C 120 356, 126 360, 138 360 L 146 360 L 146 270 L 148 206 Z" fill={pantsColor}/>
            <path d="M 166 206 C 180 216, 186 230, 180 348 C 180 356, 174 360, 162 360 L 154 360 L 154 270 L 152 206 Z" fill={pantsColor}/>
            
            {/* Franjas y costuras traseras moldeadoras */}
            <path d="M 134 208 Q 124 228, 122 346" stroke={orangeAccent} strokeWidth="2" fill="none" opacity=".8"/>
            <path d="M 166 208 Q 176 228, 178 346" stroke={orangeAccent} strokeWidth="2" fill="none" opacity=".8"/>
            <ellipse cx="134" cy="360" rx="13" ry="7.5" fill={shoeColor}/>
            <ellipse cx="166" cy="360" rx="13" ry="7.5" fill={shoeColor}/>

            {/* 2. Cuello y hombros posteriores proporcionados */}
            <path d="M 138 142 L 142 108 L 158 108 L 162 142 Z" fill={skin}/>
            <path d="M 144 118 L 150 124 L 156 118" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".4"/>

            {/* 3. Top deportivo espalda con corte ergonómico */}
            <path d="M 126 146 C 122 168, 128 196, 134 206 L 166 206 C 172 196, 178 168, 174 146 Q 164 134, 150 136 Q 136 134, 126 146 Z" fill={topColor}/>
            {/* Escote espalda deportiva racerback */}
            <path d="M 138 136 Q 150 156, 162 136" stroke={purpleAccent} strokeWidth="2" fill="none"/>
            <path d="M 142 160 Q 150 172, 158 160" stroke={topShadow} strokeWidth="1.5" fill="none"/>

            {/* 4. Brazos posteriores extendidos hacia atrás */}
            <path d="M 126 146 Q 132 180, 144 220" stroke={topColor} strokeWidth="13" strokeLinecap="round" fill="none"/>
            <path d="M 134 180 Q 140 204, 146 220" stroke={skin} strokeWidth="9.5" strokeLinecap="round" fill="none"/>

            <path d="M 174 146 Q 168 180, 156 220" stroke={topColor} strokeWidth="13" strokeLinecap="round" fill="none"/>
            <path d="M 166 180 Q 160 204, 154 220" stroke={skin} strokeWidth="9.5" strokeLinecap="round" fill="none"/>

            {/* 5. MANOS CLARAMENTE ENTRELAZADAS DETRÁS DE LA ESPALDA */}
            <g transform="translate(150, 222)">
              <ellipse cx="0" cy="2" rx="12" ry="8" fill={skin}/>
              <ellipse cx="0" cy="2" rx="10" ry="6.5" fill={skinLight} opacity=".4"/>
              
              {/* Dedos entrelazados definidos */}
              <path d="M-8-2 Q-6 3,-8 6" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M-3-3 Q-1 3,-3 7" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M 2-3 Q 4 3, 2 7" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M 7-2 Q 9 3, 7 6" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none"/>
              
              {/* Pulgares suaves */}
              <ellipse cx="-6" cy="-2" rx="3" ry="2" fill={skinLight} opacity=".8"/>
              <ellipse cx="6" cy="-2" rx="3" ry="2" fill={skinLight} opacity=".8"/>
            </g>

            {/* 6. Cabeza y Cabello Rizado Posterior de Angie */}
            <g transform="translate(0, 0)">
              {/* Aretes dorados visibles desde atrás */}
              <circle cx="115" cy="88" r="2.5" fill="none" stroke="#d4aa72" strokeWidth="1.2"/>
              <circle cx="185" cy="88" r="2.5" fill="none" stroke="#d4aa72" strokeWidth="1.2"/>

              {/* Cabello rizado posterior con masa volumétrica natural */}
              <path d="M 116 68 C 110 32, 126 20, 150 20 C 174 20, 190 32, 184 68 C 188 88, 180 106, 166 108 Q 150 112, 134 108 C 120 106, 112 88, 116 68 Z" fill={hair}/>
              <circle cx="124" cy="44" r="14" fill={hair}/>
              <circle cx="150" cy="30" r="15" fill={hairLight}/>
              <circle cx="176" cy="44" r="14" fill={hair}/>
              <circle cx="118" cy="74" r="10" fill={hairLight} opacity=".8"/>
              <circle cx="182" cy="74" r="10" fill={hairLight} opacity=".8"/>
              <circle cx="132" cy="98" r="9" fill={hairDark}/>
              <circle cx="168" cy="98" r="9" fill={hairDark}/>
              <path d="M 132 26 Q 150 22, 168 26" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".25"/>
            </g>
          </g>
        ) : (
          <g className="ab">
            {/* ═══ VISTA FRONTAL MAESTRA DE ANGIE ═══ */}

            {/* ── Cabello capa trasera rizada ── */}
            <path d="M 110 52 C 100 72, 94 105, 100 138 C 104 152, 96 166, 102 182 C 106 196, 98 210, 104 224 Q 102 232, 110 238 L 150 240 L 190 238 Q 198 232, 196 224 C 202 210, 194 196, 198 182 C 204 166, 196 152, 200 138 C 206 105, 200 72, 190 52 C 180 35, 166 26, 150 28 C 134 26, 120 35, 110 52 Z" fill={hair}/>
            <circle cx="102" cy="142" r="7" fill={hairDark} opacity=".4"/>
            <circle cx="98" cy="178" r="8" fill={hair} opacity=".5"/>
            <circle cx="198" cy="142" r="7" fill={hairDark} opacity=".4"/>
            <circle cx="202" cy="178" r="8" fill={hair} opacity=".5"/>

            {/* ── 1. Caderas Voluptuosas y Piernas Rectas Esculpidas ── */}
            <g transform={isSeated ? "translate(0,-30)" : "none"}>
              {isSeated ? (
                <g>
                  {/* 1. Sombra de contacto en el suelo */}
                  <ellipse cx="150" cy="314" rx="96" ry="14" fill="#000000" opacity="0.16" />

                  {/* 2. Base de Pelvis */}
                  <path 
                    d="M 124 206 C 110 220, 100 238, 106 256 C 114 276, 136 288, 150 288 C 164 288, 186 276, 194 256 C 200 238, 190 220, 176 206 Z" 
                    fill="#18181b" 
                  />

                  {/* 3. Muslo y Rodilla Izquierda apoyada y flexionada hacia afuera */}
                  <path 
                    d="M 124 206 C 94 210, 62 232, 54 258 C 46 282, 58 300, 84 304 C 110 306, 142 292, 160 278 C 132 274, 110 254, 116 230 C 120 216, 122 208, 124 206 Z" 
                    fill={pantsColor} 
                  />
                  {/* Franja deportiva naranja y lila en rodilla izquierda */}
                  <path d="M 54 258 C 50 274, 58 292, 78 300" stroke={orangeAccent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M 58 260 C 54 276, 62 294, 82 302" stroke={lilacAccent} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

                  {/* 4. Muslo y Rodilla Derecha apoyada y flexionada hacia afuera */}
                  <path 
                    d="M 176 206 C 206 210, 238 232, 246 258 C 254 282, 242 300, 216 304 C 190 306, 158 292, 140 278 C 168 274, 190 254, 184 230 C 180 216, 178 208, 176 206 Z" 
                    fill={pantsColor} 
                  />
                  {/* Franja deportiva naranja y lila en rodilla derecha */}
                  <path d="M 246 258 C 250 274, 242 292, 222 300" stroke={orangeAccent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M 242 260 C 246 276, 238 294, 218 302" stroke={lilacAccent} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

                  {/* 5. Pantorrilla Cruzada Inferior */}
                  <path 
                    d="M 226 286 C 210 300, 178 308, 145 308 C 120 308, 96 300, 86 288 C 96 282, 120 286, 145 288 C 176 290, 206 284, 226 286 Z" 
                    fill="#18181b" 
                  />

                  {/* 6. Pantorrilla Cruzada Superior en Flor de Loto */}
                  <path 
                    d="M 72 284 C 88 296, 118 306, 150 306 C 182 306, 212 296, 228 284 C 216 274, 186 278, 150 278 C 114 278, 84 274, 72 284 Z" 
                    fill={pantsColor} 
                  />

                  {/* Pliegues centrales */}
                  <path 
                    d="M 90 288 C 122 300, 178 300, 210 288" 
                    stroke={purpleAccent} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    fill="none" 
                    opacity="0.6" 
                  />

                  {/* Calzado Izquierdo (Angie Sneakers) */}
                  <g transform="translate(180, 295) rotate(-12)">
                    <path d="M 0 12 Q 18 16 36 11 L 35 15 Q 18 19 0 15 Z" fill="#ffffff" />
                    <path d="M 0 15 Q 18 19 35 15" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <path d="M 2 12 C 2 6, 8 2, 16 3 C 24 4, 30 7, 34 11 Z" fill={shoeColor} />
                    <path d="M 4 11 Q 18 14 32 10" stroke={orangeAccent} strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* Calzado Derecho (Angie Sneakers) */}
                  <g transform="translate(84, 295) rotate(12)">
                    <path d="M 0 11 Q 18 16 36 12 L 36 15 Q 18 19 1 15 Z" fill="#ffffff" />
                    <path d="M 1 15 Q 18 19 36 15" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                    <path d="M 2 11 C 6 7, 12 4, 20 3 C 28 2, 34 6, 34 12 Z" fill={shoeColor} />
                    <path d="M 4 11 Q 18 14 32 10" stroke={orangeAccent} strokeWidth="2" strokeLinecap="round" />
                  </g>
                </g>
              ) : (
                <g>
                  {/* Pierna Izquierda Recta */}
                  <path d="M 136 202 C 122 210, 116 226, 120 346 C 120 354, 124 358, 136 358 L 146 358 L 146 268 L 148 202 Z" fill={pantsColor}/>
                  {/* Pierna Derecha Recta */}
                  <path d="M 164 202 C 178 210, 184 226, 180 346 C 180 354, 176 358, 164 358 L 154 358 L 154 268 L 152 202 Z" fill={pantsColor}/>
                  
                  {/* Franjas laterales moldeadoras en Naranja y Lila */}
                  <path d="M 136 204 C 120 214, 116 230, 120 346" stroke={orangeAccent} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M 138 206 C 124 216, 120 232, 122 346" stroke={lilacAccent} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".8"/>
                  <path d="M 164 204 C 180 214, 184 230, 180 346" stroke={orangeAccent} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M 162 206 C 176 216, 180 232, 178 346" stroke={lilacAccent} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".8"/>

                  {/* Zapatillas deportivas blancas */}
                  <g transform="translate(112,352)">
                    <ellipse cx="18" cy="8" rx="18" ry="7.5" fill={shoeColor}/>
                    <path d="M 2 8 Q 18 4 34 8 Q 32 1 18 1 Q 4 1 2 8 Z" fill="#f8fafc"/>
                    <path d="M 4 8 Q 18 12 32 8" stroke={orangeAccent} strokeWidth="1.8" fill="none"/>
                    <path d="M 16 3 L 22 3 M 17 5 L 21 5" stroke={purpleAccent} strokeWidth="1.2" strokeLinecap="round"/>
                  </g>
                  <g transform="translate(152,352)">
                    <ellipse cx="18" cy="8" rx="18" ry="7.5" fill={shoeColor}/>
                    <path d="M 2 8 Q 18 4 34 8 Q 32 1 18 1 Q 4 1 2 8 Z" fill="#f8fafc"/>
                    <path d="M 4 8 Q 18 12 32 8" stroke={orangeAccent} strokeWidth="1.8" fill="none"/>
                    <path d="M 16 3 L 22 3 M 17 5 L 21 5" stroke={purpleAccent} strokeWidth="1.2" strokeLinecap="round"/>
                  </g>
                </g>
              )}
            </g>

            {/* ── 2. Torso con Hombros Anatómicos Integrados ── */}
            <g className="ash">
              {/* Torso esbelto con hombros suaves integrados */}
              <path d="M 126 146 C 122 166, 128 192, 134 202 L 166 202 C 172 192, 178 166, 174 146 Q 164 134, 150 136 Q 136 134, 126 146 Z" fill={topColor}/>
              
              {/* Ribete en Púrpura y forro en Lila */}
              <path d="M 136 136 Q 150 148, 164 136" stroke={purpleAccent} strokeWidth="2" fill="none"/>
              <path d="M 140 136 Q 150 144, 160 136" stroke={orangeAccent} strokeWidth="1.2" fill="none"/>
              
              {/* Costura deportiva que estiliza el pecho */}
              <path d="M 128 168 Q 150 178, 172 168" stroke={topShadow} strokeWidth="1.5" fill="none"/>
              
              {/* Bordado del Colibrí en el pecho */}
              <g transform="translate(158,152) scale(.45)">
                <path d="M 0 0 C 6-8 15-6 12 2 C 9 6 4 8 0 11 C-4 8-9 6-12 2 C-15-6-6-8 0 0 Z" fill={purpleAccent}/>
                <circle cx="0" cy="2" r="3" fill={orangeAccent}/>
              </g>

              {/* Pretina de tiro alto */}
              <rect x="134" y="198" width="32" height="6" rx="2" fill={pantsDark} stroke={orangeAccent} strokeWidth=".8"/>
            </g>

            {/* ── 3. Brazo izquierdo articulado (Pivote de hombro 126, 146) ── */}
            <g className="aal">
              <g className="asl">
                {/* Manga / Brazo superior */}
                <path d="M 126 146 Q 112 170, 114 202" stroke={topColor} strokeWidth="13" strokeLinecap="round" fill="none"/>
                <path d="M 126 146 Q 112 170, 114 202" stroke={lilacAccent} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".8"/>
                {/* Antebrazo anatómico */}
                <path d="M 114 202 Q 112 216, 112 226" stroke={skin} strokeWidth="10" strokeLinecap="round" fill="none"/>
                {/* Mano / Muñeca con articulación funcional */}
                {isFistClench ? (
                  <g transform="translate(112,228)">
                    <circle cx="0" cy="0" r="6" fill={skinShadow}/>
                    <path d="M-3-1 Q 0 2, 3-1" stroke={skin} strokeWidth="1.2" fill="none"/>
                  </g>
                ) : isPalmLeft || isPalmRight ? (
                  <g transform="translate(112,228)">
                    <ellipse cx="0" cy="2" rx="6.5" ry="5" fill={skin}/>
                    <path d="M-4-1 L-4 4 M-1-2 L-1 5 M 2-2 L 2 5 M 4-1 L 4 4" stroke={skinShadow} strokeWidth="1" opacity=".6"/>
                  </g>
                ) : (
                  <g transform="translate(112,230)">
                    <ellipse cx="0" cy="0" rx="5.5" ry="4.8" fill={skin}/>
                    <ellipse cx="3.5" cy="-2" rx="2" ry="2.5" fill={skinLight} opacity=".7"/>
                  </g>
                )}
              </g>
            </g>

            {/* ── 4. Brazo derecho articulado (Pivote de hombro 174, 146) ── */}
            <g className="aar">
              <g className="asr">
                {/* Manga / Brazo superior */}
                <path d="M 174 146 Q 188 170, 186 202" stroke={topColor} strokeWidth="13" strokeLinecap="round" fill="none"/>
                <path d="M 174 146 Q 188 170, 186 202" stroke={lilacAccent} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".8"/>
                {/* Antebrazo anatómico */}
                <path d="M 186 202 Q 188 216, 188 226" stroke={skin} strokeWidth="10" strokeLinecap="round" fill="none"/>
                {/* Mano / Muñeca con articulación funcional */}
                {isFistClench ? (
                  <g transform="translate(188,228)">
                    <circle cx="0" cy="0" r="6" fill={skinShadow}/>
                    <path d="M-3-1 Q 0 2, 3-1" stroke={skin} strokeWidth="1.2" fill="none"/>
                  </g>
                ) : isPalmLeft || isPalmRight ? (
                  <g transform="translate(188,228)">
                    <ellipse cx="0" cy="2" rx="6.5" ry="5" fill={skin}/>
                    <path d="M-4-1 L-4 4 M-1-2 L-1 5 M 2-2 L 2 5 M 5-1 L 5 4" stroke={skinShadow} strokeWidth="1" opacity=".6"/>
                  </g>
                ) : (
                  <g transform="translate(188,230)">
                    <ellipse cx="0" cy="0" rx="5.5" ry="4.8" fill={skin}/>
                    <ellipse cx="-3.5" cy="-2" rx="2" ry="2.5" fill={skinLight} opacity=".7"/>
                  </g>
                )}
              </g>
            </g>

            {/* ── 5. Cuello Anatómico Despejado ── */}
            <g className="ah">
              <rect x="142" y="114" width="16" height="24" rx="3" fill={skin}/>
              <path d="M 138 128 L 150 134 L 162 128" stroke={skinShadow} strokeWidth="2" strokeLinecap="round" fill="none" opacity=".4"/>
            </g>

            {/* ── 6. Cabeza y Rostro (Angie — Master Rig) ── */}
            <g className="ah">
              {/* Orejas */}
              <ellipse cx="116" cy="82" rx="5.5" ry="7.5" fill={skin}/>
              <ellipse cx="116" cy="82" rx="2.8" ry="4" fill={skinShadow} opacity=".3"/>
              <ellipse cx="184" cy="82" rx="5.5" ry="7.5" fill={skin}/>
              <ellipse cx="184" cy="82" rx="2.8" ry="4" fill={skinShadow} opacity=".3"/>
              
              {/* Aretes dorados */}
              <circle cx="115" cy="91" r="3" fill="none" stroke="#d4aa72" strokeWidth="1.5"/>
              <circle cx="185" cy="91" r="3" fill="none" stroke="#d4aa72" strokeWidth="1.5"/>

              {/* Cara */}
              <ellipse cx="150" cy="80" rx="34" ry="36" fill={skin}/>
              <ellipse cx="150" cy="82" rx="32" ry="33" fill={skinLight} opacity=".35"/>

              {/* Mejillas */}
              <circle cx="128" cy="94" r="8" fill={blush}/>
              <circle cx="172" cy="94" r="8" fill={blush}/>

              {/* Cejas */}
              <path d={isTension?"M 125 70 Q 132 73 139 71":"M 124 67 Q 132 62 140 66"} stroke={eyeColor} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d={isTension?"M 175 70 Q 168 73 161 71":"M 176 67 Q 168 62 160 66"} stroke={eyeColor} strokeWidth="2.2" strokeLinecap="round" fill="none"/>

              {/* Ojos */}
              {isEyesClosed ? (
                <g>
                  <path d="M 124 80 Q 132 88, 140 80" stroke={eyeColor} strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                  <path d="M 160 80 Q 168 88, 176 80" stroke={eyeColor} strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                </g>
              ) : (
                <g>
                  <ellipse cx="132" cy="80" rx="8" ry="9.5" fill="#fff"/>
                  <ellipse cx="132" cy="80.5" rx="5.8" ry="7.2" fill={eyeColor}/>
                  <circle cx="132" cy="80.5" r="3.2" fill="#0d0705"/>
                  <circle cx="129.5" cy="77" r="2.2" fill="#fff"/>
                  <circle cx="134.5" cy="83" r="1.1" fill="#fff" opacity=".8"/>
                  <path d="M 123 79 Q 132 74, 141 79" stroke={eyeColor} strokeWidth="1.8" strokeLinecap="round" fill="none"/>

                  <ellipse cx="168" cy="80" rx="8" ry="9.5" fill="#fff"/>
                  <ellipse cx="168" cy="80.5" rx="5.8" ry="7.2" fill={eyeColor}/>
                  <circle cx="168" cy="80.5" r="3.2" fill="#0d0705"/>
                  <circle cx="165.5" cy="77" r="2.2" fill="#fff"/>
                  <circle cx="170.5" cy="83" r="1.1" fill="#fff" opacity=".8"/>
                  <path d="M 159 79 Q 168 74, 177 79" stroke={eyeColor} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </g>
              )}

              {/* Lentes Púrpura */}
              <ellipse cx="132" cy="80" rx="13" ry="12.5" fill="none" stroke={glassFrame} strokeWidth="2.4"/>
              <ellipse cx="168" cy="80" rx="13" ry="12.5" fill="none" stroke={glassFrame} strokeWidth="2.4"/>
              <line x1="145" y1="78" x2="155" y2="78" stroke={glassFrame} strokeWidth="2.2"/>
              <path d="M 119 78 L 115 80" stroke={glassFrame} strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M 181 78 L 185 80" stroke={glassFrame} strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M 124 73 Q 128 71, 134 72" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".6"/>
              <path d="M 160 73 Q 164 71, 170 72" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".6"/>

              {/* Nariz */}
              <ellipse cx="150" cy="90" rx="2.5" ry="1.6" fill={skinShadow}/>

              {/* Boca */}
              {isCelebrate ? (
                <path d="M 141 98 Q 150 110, 159 98 Z" fill={lipsColor}/>
              ) : isExhale || isShoulderDrop ? (
                <ellipse cx="150" cy="100" rx="3.8" ry="3.2" fill={lipsColor} opacity=".85"/>
              ) : isTension ? (
                <line x1="143" y1="100" x2="157" y2="100" stroke={lipsColor} strokeWidth="2.2" strokeLinecap="round"/>
              ) : (
                <path d="M 142 98 Q 150 106, 158 98" stroke={lipsColor} strokeWidth="2.4" strokeLinecap="round" fill="none"/>
              )}

              {/* Cabello frontal rizado */}
              <path d="M 115 54 C 112 36, 125 24, 140 28 C 146 18, 160 18, 168 28 C 178 22, 188 34, 185 54 C 178 40, 166 32, 150 34 C 134 32, 122 40, 115 54 Z" fill={hair}/>
              <circle cx="126" cy="40" r="14" fill={hair}/>
              <circle cx="148" cy="30" r="15" fill={hairLight}/>
              <circle cx="170" cy="38" r="14" fill={hair}/>
              <circle cx="134" cy="44" r="8" fill={hairLight} opacity=".7"/>
              <circle cx="164" cy="44" r="8" fill={hairLight} opacity=".7"/>
              <path d="M 144 32 Q 132 42, 122 56 Q 118 64, 120 72" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M 156 32 Q 166 42, 176 56 Q 180 64, 178 72" stroke={hairLight} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M 132 26 Q 146 22, 160 26" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".25"/>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default AngieAvatar;
