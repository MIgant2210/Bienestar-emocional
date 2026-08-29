import React from 'react';

/**
 * ANGIE — Guía de Bienestar EquilibrIA
 * Estilo: Ilustración moderna limpia, proporciones humanas naturales.
 * Soporte completo para 14 ejercicios + celebración.
 */
export const AngieAvatar = ({
  pose = 'neutral',
  duration = 4,
  compact = false,
  className = '',
  style = {}
}) => {
  const p = (pose || 'neutral').toLowerCase();

  const isCelebrate = p.includes('celebrate') || p.includes('celebraci');
  const isBack = p.includes('chest_open') || p.includes('apertura') || p.includes('detr') || p.includes('espalda') || p.includes('omoplato');
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

  /* ── Colores ── */
  const skin = '#f0c4a0';
  const skinShadow = '#dba47a';
  const skinLight = '#fce0c8';
  const hair = '#4a2511';
  const hairLight = '#6b3a1f';
  const hairDark = '#2e1509';
  const topColor = '#e6ddf2';
  const topShadow = '#c8b8e0';
  const pantsColor = '#6d28d9';
  const pantsDark = '#4c1d95';
  const shoeColor = '#f8f8f8';
  const shoeShadow = '#d4d4d4';
  const lipsColor = '#d4686e';
  const eyeColor = '#2e1509';
  const glassFrame = '#8b6fa0';
  const blush = 'rgba(220,120,120,0.22)';

  return (
    <div
      className={`angie-v4 ${className}`}
      style={{
        position:'relative', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'flex-end',
        width: compact ? '180px' : '230px',
        height: compact ? '270px' : '340px',
        userSelect:'none', perspective:'1200px', ...style
      }}
    >
      <style>{`
        @keyframes aBreathIn{0%{transform:scale(1) translateY(0)}50%{transform:scale(1.03,1.02) translateY(-2px)}100%{transform:scale(1.05,1.035) translateY(-4px)}}
        @keyframes aBreathOut{0%{transform:scale(1.05,1.035) translateY(-4px)}60%{transform:scale(1.01) translateY(-1px)}100%{transform:scale(.985) translateY(2px)}}
        @keyframes aDrop{0%{transform:translateY(-20px)}35%{transform:translateY(6px)}65%{transform:translateY(-3px)}100%{transform:translateY(0)}}
        @keyframes aRollL{0%{transform:rotate(0deg) translate(0,0)}25%{transform:rotate(-12deg) translate(-4px,-14px)}50%{transform:rotate(0deg) translate(0,-18px)}75%{transform:rotate(12deg) translate(4px,-6px)}100%{transform:rotate(0deg) translate(0,0)}}
        @keyframes aRollR{0%{transform:rotate(0deg) translate(0,0)}25%{transform:rotate(12deg) translate(4px,-14px)}50%{transform:rotate(0deg) translate(0,-18px)}75%{transform:rotate(-12deg) translate(-4px,-6px)}100%{transform:rotate(0deg) translate(0,0)}}
        @keyframes aShrugAnim{0%,100%{transform:translateY(-16px) scaleY(1.06)}50%{transform:translateY(-22px) scaleY(1.09)}}
        @keyframes aWrist{0%{transform:rotate(0deg)}25%{transform:rotate(24deg) translateY(-3px)}75%{transform:rotate(-24deg) translateY(3px)}100%{transform:rotate(0deg)}}
        @keyframes aNeckR{0%,100%{transform:rotate(18deg) translateY(3px)}50%{transform:rotate(24deg) translateY(5px)}}
        @keyframes aNeckL{0%,100%{transform:rotate(-18deg) translateY(3px)}50%{transform:rotate(-24deg) translateY(5px)}}
        @keyframes aNeckF{0%,100%{transform:translateY(8px) rotateX(-14deg)}50%{transform:translateY(12px) rotateX(-18deg)}}
        @keyframes aStretchUpAnim{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.02)}}
        @keyframes aJump{0%,100%{transform:translateY(0) scale(1)}25%{transform:translateY(-22px) scale(1.02)}55%{transform:translateY(-3px) scale(.98)}75%{transform:translateY(-10px) scale(1.01)}}
        @keyframes aVapor{0%{opacity:0;transform:translate(0,0) scale(.5)}30%{opacity:.85;transform:translate(12px,-8px) scale(1)}80%{opacity:.4;transform:translate(22px,-18px) scale(1.3)}100%{opacity:0;transform:translate(30px,-24px) scale(1.5)}}
        @keyframes aSpark{0%,100%{opacity:.2;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(180deg)}}
        .ab{transform-origin:150px 200px;animation:${isInhale?`aBreathIn ${dur} ease-out forwards`:isExhale?`aBreathOut ${dur} ease-in-out forwards`:'none'};}
        .ah{transform-origin:150px 118px;transition:transform .5s cubic-bezier(.34,1.4,.64,1);transform:${isLookUp?'translateY(-8px) rotateX(14deg)':isNeckRight?'rotate(18deg) translateY(3px)':isNeckLeft?'rotate(-18deg) translateY(3px)':isNeckFront?'translateY(8px) rotateX(-14deg)':isShrug?'translateY(4px)':isCelebrate?'translateY(-5px) rotate(2deg)':'none'};animation:${isNeckRight?'aNeckR 2.5s ease-in-out infinite':isNeckLeft?'aNeckL 2.5s ease-in-out infinite':isNeckFront?'aNeckF 2.5s ease-in-out infinite':'none'};}
        .asl{transform-origin:115px 140px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);transform:${isShrug?'translateY(-16px)':isShoulderDrop?'translateY(2px)':'none'};animation:${isShrug?'aShrugAnim 2.2s ease-in-out infinite':isShoulderDrop?'aDrop .7s ease-out':isRoll?'aRollL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        .asr{transform-origin:185px 140px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);transform:${isShrug?'translateY(-16px)':isShoulderDrop?'translateY(2px)':'none'};animation:${isShrug?'aShrugAnim 2.2s ease-in-out infinite':isShoulderDrop?'aDrop .7s ease-out':isRoll?'aRollR 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        .aal{transform-origin:112px 140px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(-145deg) translate(-6px,-22px)':isStretchUp?'rotate(-165deg) translate(-10px,-32px)':isInhale?'rotate(-34deg) translate(18px,14px)':isNeckLeft?'rotate(-128deg) translate(-8px,-10px)':isPalmLeft?'rotate(-72deg) translate(12px,-6px)':isPalmRight?'rotate(-38deg) translate(26px,5px)':isWristRoll?'rotate(-52deg) translate(18px,3px)':isNeckFront?'rotate(-120deg) translate(-6px,-12px)':isTwistRight?'rotate(-42deg) translate(20px,10px)':isTwistLeft?'rotate(-28deg) translate(12px,6px)':isSeated?'rotate(-20deg) translate(5px,20px)':isFistClench?'rotate(-30deg) translate(8px,-3px)':'rotate(0)'};animation:${isWristRoll?'aWrist 1.5s ease-in-out infinite':isStretchUp?'aStretchUpAnim 2.2s ease-in-out infinite':'none'};}
        .aar{transform-origin:188px 140px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(145deg) translate(6px,-22px)':isStretchUp?'rotate(165deg) translate(10px,-32px)':isInhale?'rotate(34deg) translate(-18px,14px)':isNeckRight?'rotate(128deg) translate(8px,-10px)':isPalmRight?'rotate(72deg) translate(-12px,-6px)':isPalmLeft?'rotate(38deg) translate(-26px,5px)':isWristRoll?'rotate(52deg) translate(-18px,3px)':isNeckFront?'rotate(120deg) translate(6px,-12px)':isTwistRight?'rotate(28deg) translate(-12px,6px)':isTwistLeft?'rotate(42deg) translate(-20px,10px)':isSeated?'rotate(20deg) translate(-5px,20px)':isFistClench?'rotate(30deg) translate(-8px,-3px)':'rotate(0)'};animation:${isWristRoll?'aWrist 1.5s ease-in-out infinite':isStretchUp?'aStretchUpAnim 2.2s ease-in-out infinite':'none'};}
      `}</style>

      {/* Sombra suelo */}
      <div style={{position:'absolute',bottom:4,width:isSeated?'140px':'100px',height:'12px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(109,40,217,.3) 0%,transparent 70%)',filter:'blur(3px)',transition:'all .4s',zIndex:1,transform:isCelebrate?'scale(.7) translateY(12px)':'scale(1)'}}/>

      {/* Vapor */}
      {(isShoulderDrop||isExhale)&&<div style={{position:'absolute',top:72,right:42,pointerEvents:'none',zIndex:15,animation:'aVapor 2s ease-out infinite'}}><svg width="36" height="26" viewBox="0 0 36 26"><path d="M5 18C5 12 12 10 15 14C16 9 25 9 27 14C30 12 33 15 31 19C33 22 28 24 25 22C22 25 13 24 11 22C8 24 4 22 5 18Z" fill="#e0e0e0" opacity=".85"/></svg></div>}

      {/* Destellos */}
      {isCelebrate&&<div style={{position:'absolute',inset:-12,pointerEvents:'none',zIndex:15}}><svg viewBox="0 0 300 400" style={{width:'100%',height:'100%'}}><path d="M50 55L56 43L68 39L56 35L50 23L44 35L32 39L44 43Z" fill="#fbbf24" style={{animation:'aSpark 1.2s ease-in-out infinite'}}/><path d="M250 65L255 54L268 51L255 48L250 37L245 48L232 51L245 54Z" fill="#f472b6" style={{animation:'aSpark 1.3s ease-in-out infinite .3s'}}/><path d="M150 12L154 4L164 1L154-2L150-10L146-2L136 1L146 4Z" fill="#a78bfa" style={{animation:'aSpark 1.1s ease-in-out infinite .6s'}}/></svg></div>}

      <svg viewBox="0 0 300 400" style={{width:'100%',height:'100%',overflow:'visible',filter:'drop-shadow(0 10px 20px rgba(80,20,150,.12))',transition:'transform .55s cubic-bezier(.34,1.4,.64,1)',animation:isCelebrate?'aJump 2.2s ease-in-out infinite':'none',transform:isCelebrate?'none':isTwistRight?'rotateY(24deg) scale(.98)':isTwistLeft?'rotateY(-24deg) scale(.98)':isSeated?'translateY(38px)':'none'}}>

        {isBack ? (
          <g className="ab">
            {/* ═══ VISTA TRASERA ═══ */}
            {/* Cabello atrás — rizado */}
            <path d="M 108 50 C 100 70, 96 100, 100 135 C 102 150, 96 162, 100 175 C 104 188, 98 200, 102 212 Q 98 222, 106 228 L 150 232 L 194 228 Q 202 222, 198 212 C 202 200, 196 188, 200 175 C 204 162, 198 150, 200 135 C 204 100, 200 70, 192 50 C 182 34, 165 26, 150 28 C 135 26, 118 34, 108 50 Z" fill={hair}/>
            {/* Rizos traseros */}
            <path d="M 112 60 C 106 72, 102 88, 106 104 C 110 112, 104 120, 100 130 C 96 140, 102 152, 98 164 C 94 176, 100 190, 104 200" stroke={hairLight} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".4"/>
            <path d="M 188 60 C 194 72, 198 88, 194 104 C 190 112, 196 120, 200 130 C 204 140, 198 152, 202 164 C 206 176, 200 190, 196 200" stroke={hairLight} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".4"/>
            <circle cx="106" cy="185" r="8" fill={hair} opacity=".6"/>
            <circle cx="194" cy="185" r="8" fill={hair} opacity=".6"/>
            <circle cx="112" cy="205" r="7" fill={hairDark} opacity=".5"/>
            <circle cx="188" cy="205" r="7" fill={hairDark} opacity=".5"/>
            {/* Top espalda */}
            <path d="M 112 138 C 104 166, 118 200, 126 204 L 174 204 C 182 200, 196 166, 188 138 Q 150 128, 112 138 Z" fill={topColor}/>
            <path d="M 130 164 Q 150 172 170 164" stroke={topShadow} strokeWidth="1.5" fill="none" opacity=".5"/>
            {/* Brazos */}
            <path d="M 112 142 C 96 164, 104 200, 132 210" stroke={topColor} strokeWidth="18" strokeLinecap="round" fill="none"/>
            <path d="M 188 142 C 204 164, 196 200, 168 210" stroke={topColor} strokeWidth="18" strokeLinecap="round" fill="none"/>
            {/* Cintura */}
            <rect x="130" y="204" width="40" height="12" rx="4" fill={skin}/>
            {/* Pantalones */}
            <path d="M 124 216 L 176 216 L 184 345 C 184 356, 174 362, 164 362 L 152 286 L 140 362 C 128 362, 118 356, 118 345 Z" fill={pantsColor}/>
            {/* Zapatos */}
            <ellipse cx="128" cy="362" rx="14" ry="8" fill={shoeColor}/>
            <ellipse cx="172" cy="362" rx="14" ry="8" fill={shoeColor}/>
          </g>
        ) : (
          <g className="ab">
            {/* ═══ VISTA FRONTAL ═══ */}

            {/* ── Cabello capa trasera — rizado abundante ── */}
            <path d="M 106 52 C 94 72, 88 105, 94 138 C 98 152, 90 166, 96 182 C 100 196, 92 210, 98 224 Q 96 232, 104 238 L 150 240 L 196 238 Q 204 232, 202 224 C 208 210, 200 196, 204 182 C 210 166, 202 152, 206 138 C 212 105, 206 72, 194 52 C 184 35, 168 26, 150 28 C 132 26, 116 35, 106 52 Z" fill={hair}/>
            {/* Espirales y rizos volumétricos */}
            <path d="M 102 70 Q 92 84, 98 98 Q 92 112, 98 126 Q 90 140, 96 154 Q 88 170, 96 186 Q 90 202, 98 218" stroke={hairLight} strokeWidth="6" strokeLinecap="round" fill="none" opacity=".4"/>
            <path d="M 198 70 Q 208 84, 202 98 Q 208 112, 202 126 Q 210 140, 204 154 Q 212 170, 204 186 Q 210 202, 202 218" stroke={hairLight} strokeWidth="6" strokeLinecap="round" fill="none" opacity=".4"/>
            {/* Bucles de rizo definidos */}
            <circle cx="94" cy="142" r="8" fill={hairDark} opacity=".4"/>
            <circle cx="90" cy="178" r="9" fill={hair} opacity=".5"/>
            <circle cx="96" cy="214" r="8" fill={hairDark} opacity=".4"/>
            <circle cx="206" cy="142" r="8" fill={hairDark} opacity=".4"/>
            <circle cx="210" cy="178" r="9" fill={hair} opacity=".5"/>
            <circle cx="204" cy="214" r="8" fill={hairDark} opacity=".4"/>

            {/* ── Piernas ── */}
            <g transform={isSeated?"translate(0,-30)":"none"}>
              {isSeated ? (
                <g>
                  <path d="M 126 216 C 86 220, 62 264, 74 290 C 86 314, 118 326, 150 316 C 182 326, 214 314, 226 290 C 238 264, 214 220, 174 216 Z" fill={pantsColor}/>
                  <path d="M 150 316 C 128 304, 96 282, 78 290" stroke={pantsDark} strokeWidth="2" fill="none" opacity=".35"/>
                  <path d="M 150 316 C 172 304, 204 282, 222 290" stroke={pantsDark} strokeWidth="2" fill="none" opacity=".35"/>
                  <g transform="translate(108,300) rotate(12)"><ellipse cx="16" cy="8" rx="16" ry="8" fill={shoeColor}/><path d="M 2 10 Q 16 14 30 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></g>
                  <g transform="translate(160,300) rotate(-12)"><ellipse cx="16" cy="8" rx="16" ry="8" fill={shoeColor}/><path d="M 2 10 Q 16 14 30 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></g>
                </g>
              ) : (
                <g>
                  <path d="M 130 216 Q 120 230, 118 340 C 118 354, 126 362, 136 362 L 148 278 Z" fill={pantsColor}/>
                  <path d="M 170 216 Q 180 230, 182 340 C 182 354, 174 362, 164 362 L 152 278 Z" fill={pantsColor}/>
                  <line x1="134" y1="228" x2="126" y2="348" stroke={pantsDark} strokeWidth="1.2" opacity=".25"/>
                  <line x1="166" y1="228" x2="174" y2="348" stroke={pantsDark} strokeWidth="1.2" opacity=".25"/>
                  <g transform="translate(112,354)"><ellipse cx="16" cy="8" rx="18" ry="9" fill={shoeColor}/><path d="M 2 10 Q 16 14 30 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><rect x="10" y="3" width="12" height="3" rx="1.5" fill={shoeShadow}/></g>
                  <g transform="translate(154,354)"><ellipse cx="16" cy="8" rx="18" ry="9" fill={shoeColor}/><path d="M 2 10 Q 16 14 30 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><rect x="10" y="3" width="12" height="3" rx="1.5" fill={shoeShadow}/></g>
                </g>
              )}
            </g>

            {/* ── Torso ── */}
            <g>
              <rect x="132" y="200" width="36" height="16" rx="4" fill={skin} opacity=".85"/>
              <path d="M 112 136 C 104 164, 118 198, 126 202 L 174 202 C 182 198, 196 164, 188 136 Q 150 126, 112 136 Z" fill={topColor}/>
              <path d="M 136 132 Q 150 140, 164 132" stroke={topShadow} strokeWidth="1.8" fill="none" opacity=".5"/>
              <path d="M 124 162 Q 150 172, 176 162" stroke={topShadow} strokeWidth="1.2" fill="none" opacity=".35"/>
              <path d="M 140 132 Q 150 140, 160 132" stroke="#d4aa72" strokeWidth="1" fill="none" opacity=".6"/>
              <circle cx="150" cy="140" r="2" fill="#d4aa72" opacity=".5"/>
            </g>

            {/* ── Brazo izquierdo ── */}
            <g className="aal">
              <g className="asl">
                <path d="M 112 140 Q 92 168, 98 206" stroke={topColor} strokeWidth="18" strokeLinecap="round" fill="none"/>
                <path d="M 98 206 Q 96 218, 96 228" stroke={skin} strokeWidth="14" strokeLinecap="round" fill="none"/>
                {isFistClench ? <circle cx="96" cy="230" r="7.5" fill={skinShadow}/> :
                  <ellipse cx="96" cy="232" rx="6.5" ry="5.5" fill={skin}/>}
              </g>
            </g>

            {/* ── Brazo derecho ── */}
            <g className="aar">
              <g className="asr">
                <path d="M 188 140 Q 208 168, 202 206" stroke={topColor} strokeWidth="18" strokeLinecap="round" fill="none"/>
                <path d="M 202 206 Q 204 218, 204 228" stroke={skin} strokeWidth="14" strokeLinecap="round" fill="none"/>
                {isFistClench ? <circle cx="204" cy="230" r="7.5" fill={skinShadow}/> :
                  <ellipse cx="204" cy="232" rx="6.5" ry="5.5" fill={skin}/>}
              </g>
            </g>

            {/* ── Cuello ── */}
            <rect x="140" y="115" width="20" height="22" rx="3" fill={skin}/>

            {/* ── Cabeza ── */}
            <g className="ah">
              {/* Orejas */}
              <ellipse cx="112" cy="82" rx="7" ry="9" fill={skin}/>
              <ellipse cx="112" cy="82" rx="3.5" ry="5" fill={skinShadow} opacity=".3"/>
              <ellipse cx="188" cy="82" rx="7" ry="9" fill={skin}/>
              <ellipse cx="188" cy="82" rx="3.5" ry="5" fill={skinShadow} opacity=".3"/>
              {/* Aretes */}
              <circle cx="111" cy="92" r="3.5" fill="none" stroke="#d4aa72" strokeWidth="1.8"/>
              <circle cx="189" cy="92" r="3.5" fill="none" stroke="#d4aa72" strokeWidth="1.8"/>

              {/* Cara */}
              <ellipse cx="150" cy="80" rx="38" ry="40" fill={skin}/>
              <ellipse cx="150" cy="82" rx="36" ry="37" fill={skinLight} opacity=".35"/>

              {/* Mejillas */}
              <circle cx="126" cy="94" r="9" fill={blush}/>
              <circle cx="174" cy="94" r="9" fill={blush}/>

              {/* Cejas */}
              <path d={isTension?"M 124 70 Q 131 73 139 71":"M 122 67 Q 131 62 140 66"} stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d={isTension?"M 176 70 Q 169 73 161 71":"M 178 67 Q 169 62 160 66"} stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>

              {/* Ojos */}
              {isEyesClosed ? (
                <g>
                  <path d="M 123 80 Q 131 88, 141 80" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M 159 80 Q 167 88, 177 80" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </g>
              ) : (
                <g>
                  <ellipse cx="132" cy="80" rx="9" ry="10.5" fill="#fff"/>
                  <ellipse cx="132" cy="81" rx="6.5" ry="8" fill={eyeColor}/>
                  <circle cx="132" cy="80" r="3.5" fill="#0a0502"/>
                  <circle cx="129" cy="77" r="2.5" fill="#fff"/>
                  <circle cx="135" cy="83" r="1.2" fill="#fff" opacity=".7"/>

                  <ellipse cx="168" cy="80" rx="9" ry="10.5" fill="#fff"/>
                  <ellipse cx="168" cy="81" rx="6.5" ry="8" fill={eyeColor}/>
                  <circle cx="168" cy="80" r="3.5" fill="#0a0502"/>
                  <circle cx="165" cy="77" r="2.5" fill="#fff"/>
                  <circle cx="171" cy="83" r="1.2" fill="#fff" opacity=".7"/>
                </g>
              )}

              {/* Gafas */}
              <circle cx="132" cy="80" r="13.5" fill="none" stroke={glassFrame} strokeWidth="2.5"/>
              <circle cx="168" cy="80" r="13.5" fill="none" stroke={glassFrame} strokeWidth="2.5"/>
              <path d="M 145.5 80 Q 150 76, 154.5 80" stroke={glassFrame} strokeWidth="2" fill="none"/>
              <line x1="118.5" y1="80" x2="112" y2="82" stroke={glassFrame} strokeWidth="1.8"/>
              <line x1="181.5" y1="80" x2="188" y2="82" stroke={glassFrame} strokeWidth="1.8"/>

              {/* Nariz */}
              <ellipse cx="150" cy="92" rx="2.5" ry="1.8" fill={skinShadow}/>

              {/* Boca */}
              {isCelebrate ? (
                <path d="M 142 102 Q 150 114, 158 102 Z" fill={lipsColor}/>
              ) : isExhale || isShoulderDrop ? (
                <ellipse cx="150" cy="104" rx="4" ry="3.5" fill={lipsColor} opacity=".85"/>
              ) : isTension ? (
                <line x1="144" y1="104" x2="156" y2="104" stroke={lipsColor} strokeWidth="2.2" strokeLinecap="round"/>
              ) : (
                <path d="M 143 102 Q 150 109, 157 102" stroke={lipsColor} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              )}

              {/* ── Cabello frontal rizado abundante y definido (sobre la cara) ── */}
              {/* Corona con ondas de rizo */}
              <path d="M 112 68 C 112 36, 188 36, 188 68 C 188 50, 174 30, 150 28 C 126 30, 112 50, 112 68 Z" fill={hair}/>
              {/* Bucles definidos en la corona */}
              <circle cx="120" cy="40" r="8" fill={hairDark} opacity=".5"/>
              <circle cx="134" cy="32" r="9" fill={hair} opacity=".65"/>
              <circle cx="150" cy="30" r="8.5" fill={hairDark} opacity=".45"/>
              <circle cx="166" cy="32" r="9" fill={hair} opacity=".65"/>
              <circle cx="180" cy="40" r="8" fill={hairDark} opacity=".5"/>
              
              {/* Flequillo con rizos en espiral */}
              <path d="M 116 58 Q 124 44, 134 40 Q 126 48, 120 60" stroke={hairDark} strokeWidth="5" strokeLinecap="round" fill="none"/>
              <path d="M 126 52 Q 136 40, 146 38 Q 138 46, 132 56" stroke={hair} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
              <circle cx="122" cy="56" r="4.5" fill={hairDark}/>
              <circle cx="134" cy="52" r="4" fill={hair}/>
              <path d="M 152 38 Q 160 42, 168 54" stroke={hairDark} strokeWidth="4" strokeLinecap="round" fill="none"/>
              <circle cx="166" cy="52" r="4" fill={hairDark}/>

              {/* Tirabuzones / Ringlets rizados laterales cayendo sobre los hombros */}
              {/* Lateral Izquierdo */}
              <path d="M 114 66 Q 106 78, 112 90 Q 104 102, 110 116 Q 102 130, 108 144 Q 100 158, 106 172" stroke={hair} strokeWidth="12" strokeLinecap="round" fill="none"/>
              <path d="M 114 68 Q 108 80, 112 92 Q 106 104, 110 118 Q 104 132, 108 146" stroke={hairLight} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".4"/>
              <circle cx="106" cy="118" r="6.5" fill={hairDark} opacity=".45"/>
              <circle cx="104" cy="146" r="7" fill={hair} opacity=".5"/>
              <circle cx="106" cy="172" r="6.5" fill={hairDark} opacity=".5"/>

              {/* Lateral Derecho */}
              <path d="M 186 66 Q 194 78, 188 90 Q 196 102, 190 116 Q 198 130, 192 144 Q 198 158, 194 172" stroke={hair} strokeWidth="12" strokeLinecap="round" fill="none"/>
              <path d="M 186 68 Q 192 80, 188 92 Q 194 104, 190 118 Q 196 132, 192 146" stroke={hairLight} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".4"/>
              <circle cx="194" cy="118" r="6.5" fill={hairDark} opacity=".45"/>
              <circle cx="196" cy="146" r="7" fill={hair} opacity=".5"/>
              <circle cx="194" cy="172" r="6.5" fill={hairDark} opacity=".5"/>

              {/* Brillos suaves de rizo */}
              <path d="M 136 34 Q 144 32, 152 36" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".12"/>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default AngieAvatar;
