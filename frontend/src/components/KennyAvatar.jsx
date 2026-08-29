import React from 'react';

/**
 * KENNY — Guía de Bienestar EquilibrIA
 * Estilo: Ilustración moderna limpia, proporciones humanas naturales.
 * Soporte completo para 14 ejercicios + celebración.
 */
export const KennyAvatar = ({
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
  const isTension = isShrug || isFistClench || p.includes('concentrado') || p.includes('mandibula');

  const dur = `${Math.max(duration, 1.5)}s`;

  /* ── Colores ── */
  const skin = '#e8b88a';
  const skinShadow = '#c89060';
  const skinLight = '#f5d4b0';
  const hair = '#2a1406';
  const hairMid = '#3d2010';
  const hoodie = '#7c3aed';
  const hoodieDark = '#5b21b6';
  const hoodieDeep = '#4c1d95';
  const pants = '#c4b49a';
  const pantsDark = '#9a8a6c';
  const shoe = '#1e293b';
  const shoeLine = '#475569';
  const lipsColor = '#b85050';
  const eyeColor = '#1a0c04';

  return (
    <div
      className={`kenny-v4 ${className}`}
      style={{
        position:'relative', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'flex-end',
        width: compact ? '180px' : '230px',
        height: compact ? '270px' : '340px',
        userSelect:'none', perspective:'1200px', ...style
      }}
    >
      <style>{`
        @keyframes kBreathIn{0%{transform:scale(1) translateY(0)}50%{transform:scale(1.04,1.02) translateY(-2px)}100%{transform:scale(1.06,1.04) translateY(-4px)}}
        @keyframes kBreathOut{0%{transform:scale(1.06,1.04) translateY(-4px)}60%{transform:scale(1.01) translateY(-1px)}100%{transform:scale(.985) translateY(2px)}}
        @keyframes kDrop{0%{transform:translateY(-20px)}35%{transform:translateY(6px)}65%{transform:translateY(-3px)}100%{transform:translateY(0)}}
        @keyframes kRollL{0%{transform:rotate(0deg) translate(0,0)}25%{transform:rotate(-12deg) translate(-4px,-14px)}50%{transform:rotate(0deg) translate(0,-18px)}75%{transform:rotate(12deg) translate(4px,-6px)}100%{transform:rotate(0deg) translate(0,0)}}
        @keyframes kRollR{0%{transform:rotate(0deg) translate(0,0)}25%{transform:rotate(12deg) translate(4px,-14px)}50%{transform:rotate(0deg) translate(0,-18px)}75%{transform:rotate(-12deg) translate(-4px,-6px)}100%{transform:rotate(0deg) translate(0,0)}}
        @keyframes kShrugAnim{0%,100%{transform:translateY(-16px) scaleY(1.06)}50%{transform:translateY(-22px) scaleY(1.09)}}
        @keyframes kWrist{0%{transform:rotate(0deg)}25%{transform:rotate(24deg) translateY(-3px)}75%{transform:rotate(-24deg) translateY(3px)}100%{transform:rotate(0deg)}}
        @keyframes kNeckR{0%,100%{transform:rotate(18deg) translateY(3px)}50%{transform:rotate(24deg) translateY(5px)}}
        @keyframes kNeckL{0%,100%{transform:rotate(-18deg) translateY(3px)}50%{transform:rotate(-24deg) translateY(5px)}}
        @keyframes kNeckF{0%,100%{transform:translateY(8px) rotateX(-14deg)}50%{transform:translateY(12px) rotateX(-18deg)}}
        @keyframes kStretchUpAnim{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.02)}}
        @keyframes kFistPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        @keyframes kJump{0%,100%{transform:translateY(0) scale(1)}25%{transform:translateY(-22px) scale(1.02)}55%{transform:translateY(-3px) scale(.98)}75%{transform:translateY(-10px) scale(1.01)}}
        @keyframes kVapor{0%{opacity:0;transform:translate(0,0) scale(.5)}30%{opacity:.85;transform:translate(12px,-8px) scale(1)}80%{opacity:.4;transform:translate(22px,-18px) scale(1.3)}100%{opacity:0;transform:translate(30px,-24px) scale(1.5)}}
        @keyframes kSpark{0%,100%{opacity:.2;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(180deg)}}
        .kb{transform-origin:150px 200px;animation:${isInhale?`kBreathIn ${dur} ease-out forwards`:isExhale?`kBreathOut ${dur} ease-in-out forwards`:'none'};}
        .kh{transform-origin:150px 118px;transition:transform .5s cubic-bezier(.34,1.4,.64,1);transform:${isLookUp?'translateY(-8px) rotateX(14deg)':isNeckRight?'rotate(18deg) translateY(3px)':isNeckLeft?'rotate(-18deg) translateY(3px)':isNeckFront?'translateY(8px) rotateX(-14deg)':isShrug?'translateY(4px)':isCelebrate?'translateY(-5px) rotate(2deg)':'none'};animation:${isNeckRight?'kNeckR 2.5s ease-in-out infinite':isNeckLeft?'kNeckL 2.5s ease-in-out infinite':isNeckFront?'kNeckF 2.5s ease-in-out infinite':'none'};}
        .ksl{transform-origin:108px 140px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);transform:${isShrug?'translateY(-16px)':isShoulderDrop?'translateY(2px)':'none'};animation:${isShrug?'kShrugAnim 2.2s ease-in-out infinite':isShoulderDrop?'kDrop .7s ease-out':isRoll?'kRollL 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        .ksr{transform-origin:192px 140px;transition:transform .45s cubic-bezier(.34,1.4,.64,1);transform:${isShrug?'translateY(-16px)':isShoulderDrop?'translateY(2px)':'none'};animation:${isShrug?'kShrugAnim 2.2s ease-in-out infinite':isShoulderDrop?'kDrop .7s ease-out':isRoll?'kRollR 2s cubic-bezier(.45,0,.55,1) infinite':'none'};}
        .kal{transform-origin:106px 140px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(-145deg) translate(-6px,-22px)':isStretchUp?'rotate(-165deg) translate(-10px,-32px)':isInhale?'rotate(-34deg) translate(18px,14px)':isNeckLeft?'rotate(-128deg) translate(-8px,-10px)':isPalmLeft?'rotate(-72deg) translate(12px,-6px)':isPalmRight?'rotate(-38deg) translate(26px,5px)':isWristRoll?'rotate(-52deg) translate(18px,3px)':isNeckFront?'rotate(-120deg) translate(-6px,-12px)':isTwistRight?'rotate(-42deg) translate(20px,10px)':isTwistLeft?'rotate(-28deg) translate(12px,6px)':isSeated?'rotate(-20deg) translate(5px,20px)':isFistClench?'rotate(-30deg) translate(8px,-3px)':'rotate(0)'};animation:${isWristRoll?'kWrist 1.5s ease-in-out infinite':isStretchUp?'kStretchUpAnim 2.2s ease-in-out infinite':'none'};}
        .kar{transform-origin:194px 140px;transition:transform .55s cubic-bezier(.34,1.4,.64,1);transform:${isCelebrate?'rotate(145deg) translate(6px,-22px)':isStretchUp?'rotate(165deg) translate(10px,-32px)':isInhale?'rotate(34deg) translate(-18px,14px)':isNeckRight?'rotate(128deg) translate(8px,-10px)':isPalmRight?'rotate(72deg) translate(-12px,-6px)':isPalmLeft?'rotate(38deg) translate(-26px,5px)':isWristRoll?'rotate(52deg) translate(-18px,3px)':isNeckFront?'rotate(120deg) translate(6px,-12px)':isTwistRight?'rotate(28deg) translate(-12px,6px)':isTwistLeft?'rotate(42deg) translate(-20px,10px)':isSeated?'rotate(20deg) translate(-5px,20px)':isFistClench?'rotate(30deg) translate(-8px,-3px)':'rotate(0)'};animation:${isWristRoll?'kWrist 1.5s ease-in-out infinite':isStretchUp?'kStretchUpAnim 2.2s ease-in-out infinite':'none'};}
      `}</style>

      {/* Sombra suelo */}
      <div style={{position:'absolute',bottom:4,width:isSeated?'145px':'105px',height:'14px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(59,7,100,.3) 0%,transparent 70%)',filter:'blur(3px)',transition:'all .4s',zIndex:1,transform:isCelebrate?'scale(.7) translateY(12px)':'scale(1)'}}/>

      {/* Vapor */}
      {(isShoulderDrop||isExhale)&&<div style={{position:'absolute',top:72,right:38,pointerEvents:'none',zIndex:15,animation:'kVapor 2s ease-out infinite'}}><svg width="36" height="26" viewBox="0 0 36 26"><path d="M5 18C5 12 12 10 15 14C16 9 25 9 27 14C30 12 33 15 31 19C33 22 28 24 25 22C22 25 13 24 11 22C8 24 4 22 5 18Z" fill="#e0e0e0" opacity=".85"/></svg></div>}

      {/* Destellos */}
      {isCelebrate&&<div style={{position:'absolute',inset:-12,pointerEvents:'none',zIndex:15}}><svg viewBox="0 0 300 400" style={{width:'100%',height:'100%'}}><path d="M50 55L56 43L68 39L56 35L50 23L44 35L32 39L44 43Z" fill="#fbbf24" style={{animation:'kSpark 1.2s ease-in-out infinite'}}/><path d="M250 65L255 54L268 51L255 48L250 37L245 48L232 51L245 54Z" fill="#60a5fa" style={{animation:'kSpark 1.3s ease-in-out infinite .3s'}}/><path d="M150 12L154 4L164 1L154-2L150-10L146-2L136 1L146 4Z" fill="#a78bfa" style={{animation:'kSpark 1.1s ease-in-out infinite .6s'}}/></svg></div>}

      <svg viewBox="0 0 300 400" style={{width:'100%',height:'100%',overflow:'visible',filter:'drop-shadow(0 10px 20px rgba(60,10,100,.12))',transition:'transform .55s cubic-bezier(.34,1.4,.64,1)',animation:isCelebrate?'kJump 2.2s ease-in-out infinite':'none',transform:isCelebrate?'none':isTwistRight?'rotateY(24deg) scale(.98)':isTwistLeft?'rotateY(-24deg) scale(.98)':isSeated?'translateY(38px)':'none'}}>

        {isBack ? (
          <g className="kb">
            {/* ═══ VISTA TRASERA ═══ */}
            <ellipse cx="150" cy="74" rx="42" ry="42" fill={hair}/>
            {/* Sudadera espalda */}
            <path d="M 106 138 C 96 168, 114 206, 122 210 L 178 210 C 186 206, 204 168, 194 138 Q 150 126, 106 138 Z" fill={hoodie}/>
            <path d="M 124 142 C 124 170, 176 170, 176 142 Z" fill={hoodieDeep} stroke={hoodieDark} strokeWidth="1.5"/>
            <path d="M 147 186 Q 150 182, 153 186 Q 150 190, 147 186 Z" fill="#fff" opacity=".7"/>
            {/* Brazos */}
            <path d="M 106 142 C 88 166, 98 206, 128 214" stroke={hoodie} strokeWidth="22" strokeLinecap="round" fill="none"/>
            <path d="M 194 142 C 212 166, 202 206, 172 214" stroke={hoodie} strokeWidth="22" strokeLinecap="round" fill="none"/>
            {/* Caderas */}
            <path d="M 130 210 C 126 218, 124 226, 130 230 L 170 230 C 176 226, 174 218, 170 210 Z" fill={skin} opacity=".4"/>
            {/* Pantalones */}
            <path d="M 120 218 L 180 218 L 188 345 C 188 356, 178 362, 166 362 L 152 286 L 138 362 C 126 362, 116 356, 114 345 Z" fill={pants}/>
            <rect x="106" y="264" width="12" height="20" rx="3.5" fill={pantsDark} opacity=".6"/>
            <rect x="182" y="264" width="12" height="20" rx="3.5" fill={pantsDark} opacity=".6"/>
            <ellipse cx="128" cy="362" rx="15" ry="9" fill={shoe}/>
            <ellipse cx="172" cy="362" rx="15" ry="9" fill={shoe}/>
          </g>
        ) : (
          <g className="kb">
            {/* ═══ VISTA FRONTAL ═══ */}

            {/* ── Piernas ── */}
            <g transform={isSeated?"translate(0,-30)":"none"}>
              {isSeated ? (
                <g>
                  <path d="M 120 218 C 78 222, 54 266, 68 292 C 82 316, 114 328, 150 318 C 186 328, 218 316, 232 292 C 246 266, 222 222, 180 218 Z" fill={pants}/>
                  <path d="M 150 318 C 128 306, 96 284, 78 292" stroke={pantsDark} strokeWidth="2" fill="none" opacity=".4"/>
                  <path d="M 150 318 C 172 306, 204 284, 222 292" stroke={pantsDark} strokeWidth="2" fill="none" opacity=".4"/>
                  <g transform="translate(104,302) rotate(12)"><ellipse cx="18" cy="9" rx="18" ry="9" fill={shoe}/><path d="M 4 11 Q 18 15 32 11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></g>
                  <g transform="translate(162,302) rotate(-12)"><ellipse cx="18" cy="9" rx="18" ry="9" fill={shoe}/><path d="M 4 11 Q 18 15 32 11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></g>
                </g>
              ) : (
                <g>
                  <path d="M 126 218 Q 114 232, 114 340 C 114 354, 124 362, 136 362 L 148 278 Z" fill={pants}/>
                  <path d="M 174 218 Q 186 232, 186 340 C 186 354, 176 362, 164 362 L 152 278 Z" fill={pants}/>
                  <rect x="106" y="264" width="12" height="20" rx="3.5" fill={pantsDark} opacity=".6"/>
                  <rect x="182" y="264" width="12" height="20" rx="3.5" fill={pantsDark} opacity=".6"/>
                  <line x1="132" y1="230" x2="124" y2="348" stroke={pantsDark} strokeWidth="1.2" opacity=".2"/>
                  <line x1="168" y1="230" x2="176" y2="348" stroke={pantsDark} strokeWidth="1.2" opacity=".2"/>
                  <g transform="translate(106,354)"><ellipse cx="18" cy="9" rx="20" ry="10" fill={shoe}/><path d="M 3 11 Q 18 15 33 11" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><rect x="12" y="3" width="12" height="3" rx="1.5" fill={shoeLine}/></g>
                  <g transform="translate(156,354)"><ellipse cx="18" cy="9" rx="20" ry="10" fill={shoe}/><path d="M 3 11 Q 18 15 33 11" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><rect x="12" y="3" width="12" height="3" rx="1.5" fill={shoeLine}/></g>
                </g>
              )}
            </g>

            {/* ── Torso / Sudadera ── */}
            <g>
              <path d="M 106 136 C 94 166, 112 204, 122 208 L 178 208 C 188 204, 206 166, 194 136 Q 150 124, 106 136 Z" fill={hoodie}/>
              {/* Pecho V atlético */}
              <path d="M 118 148 Q 150 164, 182 148" stroke={hoodieDark} strokeWidth="1.5" fill="none" opacity=".3"/>
              {/* Cuello sudadera */}
              <path d="M 134 132 C 134 124, 166 124, 166 132 C 166 138, 134 138, 134 132 Z" fill={hoodieDeep} stroke={hoodieDark} strokeWidth="1.5"/>
              {/* Cordones */}
              <line x1="144" y1="132" x2="140" y2="156" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8"/>
              <line x1="156" y1="132" x2="160" y2="156" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8"/>
              <circle cx="140" cy="156" r="1.8" fill="#fff" opacity=".75"/>
              <circle cx="160" cy="156" r="1.8" fill="#fff" opacity=".75"/>
              {/* Bolsillo canguro */}
              <path d="M 128 176 Q 150 186, 172 176 L 172 196 Q 150 204, 128 196 Z" fill={hoodieDeep} opacity=".3"/>
              {/* Logo colibrí */}
              <g transform="translate(166,146) scale(.55)">
                <path d="M 0 0 C 5-7 14-5 10 2 C 8 5 3 7 0 10 C-3 7-8 5-10 2 C-14-5-5-7 0 0 Z" fill="#fff" opacity=".8"/>
                <line x1="0" y1="10" x2="1" y2="15" stroke="#fff" strokeWidth="1.5" opacity=".6"/>
              </g>
              {/* Caderas */}
              <path d="M 122 208 C 118 214, 116 224, 122 228 L 178 228 C 184 224, 182 214, 178 208 Z" fill={skin} opacity=".35"/>
            </g>

            {/* ── Brazo izquierdo ── */}
            <g className="kal">
              <g className="ksl">
                <path d="M 106 140 Q 84 170, 90 210" stroke={hoodie} strokeWidth="22" strokeLinecap="round" fill="none"/>
                <circle cx="90" cy="210" r="10" fill={hoodieDeep}/>
                <path d="M 90 210 Q 88 224, 88 236" stroke={skin} strokeWidth="15" strokeLinecap="round" fill="none"/>
                {isFistClench ? <circle cx="88" cy="238" r="8" fill={skinShadow}/> :
                  <ellipse cx="88" cy="240" rx="7" ry="6" fill={skin}/>}
                {/* Reloj */}
                <rect x="82" y="214" width="12" height="7" rx="2" fill="#1e293b" stroke="#475569" strokeWidth=".8"/>
                <rect x="85" y="216" width="6" height="3" rx="1" fill="#22d3ee" opacity=".65"/>
              </g>
            </g>

            {/* ── Brazo derecho ── */}
            <g className="kar">
              <g className="ksr">
                <path d="M 194 140 Q 216 170, 210 210" stroke={hoodie} strokeWidth="22" strokeLinecap="round" fill="none"/>
                <circle cx="210" cy="210" r="10" fill={hoodieDeep}/>
                <path d="M 210 210 Q 212 224, 212 236" stroke={skin} strokeWidth="15" strokeLinecap="round" fill="none"/>
                {isFistClench ? <circle cx="212" cy="238" r="8" fill={skinShadow}/> :
                  <ellipse cx="212" cy="240" rx="7" ry="6" fill={skin}/>}
              </g>
            </g>

            {/* ── Cuello ── */}
            <rect x="138" y="112" width="24" height="24" rx="4" fill={skin}/>

            {/* ── Cabeza ── */}
            <g className="kh">
              {/* Orejas */}
              <ellipse cx="112" cy="80" rx="7" ry="9" fill={skin}/>
              <ellipse cx="112" cy="80" rx="3.5" ry="5" fill={skinShadow} opacity=".3"/>
              <ellipse cx="188" cy="80" rx="7" ry="9" fill={skin}/>
              <ellipse cx="188" cy="80" rx="3.5" ry="5" fill={skinShadow} opacity=".3"/>

              {/* Cara — mandíbula ligeramente más cuadrada y proporciones naturales */}
              <path d="M 116 74 C 116 52, 184 52, 184 74 C 184 104, 174 124, 150 126 C 126 124, 116 104, 116 74 Z" fill={skin}/>

              {/* Mejillas */}
              <circle cx="126" cy="94" r="8" fill="rgba(200,100,80,0.14)"/>
              <circle cx="174" cy="94" r="8" fill="rgba(200,100,80,0.14)"/>

              {/* Cejas — gruesas */}
              <path d={isTension?"M 122 68 Q 130 72, 140 69":"M 120 65 Q 130 60, 142 64"} stroke={eyeColor} strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d={isTension?"M 178 68 Q 170 72, 160 69":"M 180 65 Q 170 60, 158 64"} stroke={eyeColor} strokeWidth="3" strokeLinecap="round" fill="none"/>

              {/* Ojos */}
              {isEyesClosed ? (
                <g>
                  <path d="M 123 78 Q 131 86, 141 78" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M 159 78 Q 167 86, 177 78" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </g>
              ) : (
                <g>
                  <ellipse cx="132" cy="78" rx="8.5" ry="10" fill="#fff"/>
                  <ellipse cx="132" cy="79" rx="6" ry="7.5" fill={eyeColor}/>
                  <circle cx="132" cy="78" r="3.2" fill="#050201"/>
                  <circle cx="129" cy="75" r="2.4" fill="#fff"/>
                  <circle cx="135" cy="81" r="1.1" fill="#fff" opacity=".7"/>

                  <ellipse cx="168" cy="78" rx="8.5" ry="10" fill="#fff"/>
                  <ellipse cx="168" cy="79" rx="6" ry="7.5" fill={eyeColor}/>
                  <circle cx="168" cy="78" r="3.2" fill="#050201"/>
                  <circle cx="165" cy="75" r="2.4" fill="#fff"/>
                  <circle cx="171" cy="81" r="1.1" fill="#fff" opacity=".7"/>
                </g>
              )}

              {/* Nariz */}
              <ellipse cx="150" cy="92" rx="3" ry="2.2" fill={skinShadow}/>

              {/* Boca */}
              {isCelebrate ? (
                <path d="M 142 100 Q 150 112, 158 100 Z" fill={lipsColor}/>
              ) : isExhale || isShoulderDrop ? (
                <ellipse cx="150" cy="102" rx="4" ry="3.5" fill={lipsColor} opacity=".85"/>
              ) : isTension ? (
                <line x1="144" y1="102" x2="156" y2="102" stroke={lipsColor} strokeWidth="2.2" strokeLinecap="round"/>
              ) : (
                <path d="M 143 100 Q 150 107, 157 100" stroke={lipsColor} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              )}

              {/* ── Cabello Curtain Flow (Cuero Cabelludo Bajado, Proporciones Naturales) ── */}
              {/* Corona y cuero cabelludo que bajan adecuadamente cubriendo la cabeza */}
              <path d="M 114 66 C 114 26, 130 16, 150 16 C 170 16, 186 26, 186 66 C 182 56, 172 48, 150 52 C 128 48, 118 56, 114 66 Z" fill={hair}/>
              <path d="M 118 60 C 118 24, 132 18, 150 18 C 168 18, 182 24, 182 60 C 176 52, 166 46, 150 50 C 134 46, 124 52, 118 60 Z" fill={hairMid}/>

              {/* Cortina Izquierda — Nace en la raíz baja (150, 52), se eleva con volumen en M y cae fluida */}
              <path d="M 150 52 C 146 36, 136 20, 124 24 C 112 30, 106 48, 108 66 C 110 80, 114 88, 114 92 C 118 80, 122 68, 128 58 C 136 46, 146 48, 150 52 Z" fill={hair}/>
              <path d="M 148 50 C 144 36, 134 24, 126 28 C 116 36, 112 52, 112 68 C 114 80, 116 86, 116 88 C 120 76, 124 66, 130 56 C 136 46, 144 46, 148 50 Z" fill={hairMid}/>
              {/* Mechón interior que enmarca la frente con la M */}
              <path d="M 150 52 C 144 48, 134 54, 128 64 C 122 72, 118 80, 120 86" stroke={hair} strokeWidth="4" strokeLinecap="round" fill="none"/>
              <path d="M 114 88 C 112 94, 110 96, 112 98" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6"/>

              {/* Cortina Derecha — Nace en la raíz baja (150, 52), se eleva con volumen en M y cae fluida */}
              <path d="M 150 52 C 154 36, 164 20, 176 24 C 188 30, 194 48, 192 66 C 190 80, 186 88, 186 92 C 182 80, 178 68, 172 58 C 164 46, 154 48, 150 52 Z" fill={hair}/>
              <path d="M 152 50 C 156 36, 166 24, 174 28 C 184 36, 188 52, 188 68 C 186 80, 184 86, 184 88 C 180 76, 176 66, 170 56 C 164 46, 156 46, 152 50 Z" fill={hairMid}/>
              {/* Mechón interior que enmarca la frente con la M */}
              <path d="M 150 52 C 156 48, 166 54, 172 64 C 178 72, 182 80, 180 86" stroke={hair} strokeWidth="4" strokeLinecap="round" fill="none"/>
              <path d="M 186 88 C 188 94, 190 96, 188 98" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6"/>

              {/* Línea de separación central */}
              <line x1="150" y1="18" x2="150" y2="52" stroke={hair} strokeWidth="1.5" opacity=".4"/>

              {/* Brillo sedoso en las curvas superiores de la M */}
              <path d="M 130 24 Q 124 32, 118 46" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".15"/>
              <path d="M 170 24 Q 176 32, 182 46" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".15"/>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

export default KennyAvatar;
