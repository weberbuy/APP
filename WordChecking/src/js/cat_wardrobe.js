    const WARDROBE_STORAGE_KEY = 'wordchecking_cat_wardrobe_v1';
    const ACCESSORIES_SVG = {
      aura: {
        aura_none: "",
        aura_sparkle: `<g id="acc_aura_sparkle" class="animate-pulse"><path d="M 16,25 Q 22,25 22,19 Q 22,25 28,25 Q 22,25 22,31 Q 22,25 16,25 Z" fill="#facc15" /><path d="M 96,22 Q 102,22 102,16 Q 102,22 108,22 Q 102,22 102,28 Q 102,22 96,22 Z" fill="#facc15" /><path d="M 8,82 Q 12,82 12,78 Q 12,82 16,82 Q 12,82 12,86 Q 12,82 8,82 Z" fill="#fde047" /><path d="M 104,85 Q 108,85 108,81 Q 108,85 112,85 Q 108,85 108,89 Q 108,85 104,85 Z" fill="#fde047" /></g>`,
        aura_fish: `<!-- 🐟 游動小魚乾群: 靈活擺尾、環繞波浪巡航游動 -->
<g id="acc_aura_fish" pointer-events="none">
  <style>
    @keyframes fishTailWag1 {
      0%, 100% { transform: rotate(-22deg); }
      50% { transform: rotate(22deg); }
    }
    @keyframes fishTailWag2 {
      0%, 100% { transform: rotate(24deg); }
      50% { transform: rotate(-24deg); }
    }
    @keyframes fishSwimOrbit1 {
      0% { transform: translate(10px, 32px) rotate(-18deg); }
      25% { transform: translate(24px, 22px) rotate(4deg); }
      50% { transform: translate(32px, 36px) rotate(-10deg); }
      75% { transform: translate(20px, 44px) rotate(-26deg); }
      100% { transform: translate(10px, 32px) rotate(-18deg); }
    }
    @keyframes fishSwimOrbit2 {
      0% { transform: translate(96px, 24px) rotate(22deg); }
      25% { transform: translate(108px, 38px) rotate(-4deg); }
      50% { transform: translate(98px, 50px) rotate(16deg); }
      75% { transform: translate(86px, 36px) rotate(32deg); }
      100% { transform: translate(96px, 24px) rotate(22deg); }
    }
    @keyframes fishSwimOrbit3 {
      0% { transform: translate(8px, 86px) rotate(14deg); }
      30% { transform: translate(22px, 76px) rotate(-8deg); }
      60% { transform: translate(16px, 98px) rotate(20deg); }
      100% { transform: translate(8px, 86px) rotate(14deg); }
    }
    @keyframes fishSwimOrbit4 {
      0% { transform: translate(94px, 82px) rotate(-12deg); }
      35% { transform: translate(106px, 94px) rotate(15deg); }
      70% { transform: translate(90px, 102px) rotate(-18deg); }
      100% { transform: translate(94px, 82px) rotate(-12deg); }
    }
    @keyframes bubbleFloat {
      0% { transform: translateY(0) scale(0.6); opacity: 0.2; }
      50% { opacity: 0.8; }
      100% { transform: translateY(-26px) scale(1.1); opacity: 0; }
    }
  </style>
  <g style="animation: fishSwimOrbit1 4.8s ease-in-out infinite;">
    <g filter="drop-shadow(0 1px 2px rgba(2,132,199,0.3))">
      <path d="M 0,0 Q 8,-5 15,0 Q 8,5 0,0 Z" fill="#38bdf8" />
      <circle cx="11.5" cy="-1" r="1.2" fill="#ffffff" />
      <circle cx="12" cy="-1" r="0.7" fill="#0369a1" />
      <polygon points="6,-3 9,-6 11,-2" fill="#0284c7" />
      <g style="transform-origin: 0px 0px; animation: fishTailWag1 0.45s ease-in-out infinite;">
        <polygon points="0,0 -5,-4 -4,0 -5,4" fill="#0284c7" />
      </g>
    </g>
  </g>
  <g style="animation: fishSwimOrbit2 5.2s ease-in-out infinite 0.5s;">
    <g filter="drop-shadow(0 1px 2px rgba(2,132,199,0.3))">
      <path d="M 0,0 Q 8,-5 15,0 Q 8,5 0,0 Z" fill="#38bdf8" />
      <circle cx="11.5" cy="-1" r="1.2" fill="#ffffff" />
      <circle cx="12" cy="-1" r="0.7" fill="#0369a1" />
      <polygon points="6,-3 9,-6 11,-2" fill="#0284c7" />
      <g style="transform-origin: 0px 0px; animation: fishTailWag2 0.4s ease-in-out infinite;">
        <polygon points="0,0 -5,-4 -4,0 -5,4" fill="#0284c7" />
      </g>
    </g>
  </g>
  <g style="animation: fishSwimOrbit3 4.4s ease-in-out infinite 1.2s;">
    <g filter="drop-shadow(0 1px 2px rgba(2,132,199,0.25))">
      <path d="M 0,0 Q 7,-4 13,0 Q 7,4 0,0 Z" fill="#7dd3fc" />
      <circle cx="10" cy="-0.8" r="1" fill="#ffffff" />
      <circle cx="10.4" cy="-0.8" r="0.6" fill="#0369a1" />
      <polygon points="5,-2.5 7.5,-5 9,-1.5" fill="#38bdf8" />
      <g style="transform-origin: 0px 0px; animation: fishTailWag1 0.5s ease-in-out infinite;">
        <polygon points="0,0 -4.5,-3.5 -3.5,0 -4.5,3.5" fill="#38bdf8" />
      </g>
    </g>
  </g>
  <g style="animation: fishSwimOrbit4 4.6s ease-in-out infinite 0.8s;">
    <g filter="drop-shadow(0 1px 2px rgba(2,132,199,0.25))">
      <path d="M 0,0 Q 7,-4 13,0 Q 7,4 0,0 Z" fill="#7dd3fc" />
      <circle cx="10" cy="-0.8" r="1" fill="#ffffff" />
      <circle cx="10.4" cy="-0.8" r="0.6" fill="#0369a1" />
      <polygon points="5,-2.5 7.5,-5 9,-1.5" fill="#38bdf8" />
      <g style="transform-origin: 0px 0px; animation: fishTailWag2 0.42s ease-in-out infinite;">
        <polygon points="0,0 -4.5,-3.5 -3.5,0 -4.5,3.5" fill="#38bdf8" />
      </g>
    </g>
  </g>
  <circle cx="18" cy="20" r="1.5" fill="#bae6fd" style="animation: bubbleFloat 2.8s ease-in infinite 0.4s;" />
  <circle cx="102" cy="22" r="1.8" fill="#bae6fd" style="animation: bubbleFloat 3.2s ease-in infinite 1.1s;" />
  <circle cx="28" cy="80" r="1.3" fill="#bae6fd" style="animation: bubbleFloat 2.6s ease-in infinite 1.8s;" />
  <circle cx="92" cy="88" r="1.6" fill="#bae6fd" style="animation: bubbleFloat 3.0s ease-in infinite 0.9s;" />
</g>`,
        aura_sakura: `<!-- 🌸 飛舞落櫻花瓣: 隨風旋轉飄落物理軌跡與無限重生 -->
<g id="acc_aura_sakura" pointer-events="none">
  <style>
    @keyframes sakuraFallTrack1 {
      0% { transform: translate(25px, -10px) rotate(0deg) scale(0.7); opacity: 0; }
      12% { opacity: 0.95; }
      50% { transform: translate(14px, 58px) rotate(135deg) scale(1); }
      85% { opacity: 0.9; }
      100% { transform: translate(32px, 128px) rotate(270deg) scale(0.9); opacity: 0; }
    }
    @keyframes sakuraFallTrack2 {
      0% { transform: translate(75px, -12px) rotate(45deg) scale(0.8); opacity: 0; }
      15% { opacity: 0.9; }
      55% { transform: translate(88px, 62px) rotate(190deg) scale(1.1); }
      85% { opacity: 0.85; }
      100% { transform: translate(72px, 130px) rotate(340deg) scale(1); opacity: 0; }
    }
    @keyframes sakuraFallTrack3 {
      0% { transform: translate(102px, -8px) rotate(-30deg) scale(0.65); opacity: 0; }
      12% { opacity: 0.95; }
      48% { transform: translate(112px, 52px) rotate(110deg) scale(0.95); }
      85% { opacity: 0.9; }
      100% { transform: translate(96px, 126px) rotate(240deg) scale(0.85); opacity: 0; }
    }
    @keyframes sakuraFallTrack4 {
      0% { transform: translate(8px, -6px) rotate(50deg) scale(0.75); opacity: 0; }
      10% { opacity: 0.85; }
      52% { transform: translate(2px, 56px) rotate(210deg) scale(0.9); }
      88% { opacity: 0.8; }
      100% { transform: translate(16px, 124px) rotate(350deg) scale(0.8); opacity: 0; }
    }
  </style>
  <g style="animation: sakuraFallTrack1 5.2s cubic-bezier(0.37, 0, 0.63, 1) infinite;">
    <path d="M 0,-4.5 C 2.5,-4.5 4,-2 3.2,0.5 C 2.5,2.8 1.2,4.5 0,5 C -1.2,4.5 -2.5,2.8 -3.2,0.5 C -4,-2 -2.5,-4.5 0,-4.5 Z" fill="#f472b6" opacity="0.9" />
    <path d="M 0,-3.5 C 1.2,-3.5 2,-1.5 1.5,0.5 C 1,2 0,3.5 0,3.5 Z" fill="#fda4af" />
  </g>
  <g style="animation: sakuraFallTrack2 6.0s cubic-bezier(0.37, 0, 0.63, 1) infinite 1.4s;">
    <path d="M 0,-5 C 2.8,-5 4.5,-2.2 3.6,0.6 C 2.8,3.2 1.4,5 0,5.5 C -1.4,5 -2.8,3.2 -3.6,0.6 C -4.5,-2.2 -2.8,-5 0,-5 Z" fill="#fb7185" opacity="0.88" />
    <path d="M 0,-4 C 1.4,-4 2.2,-1.8 1.8,0.5 C 1.2,2.2 0,4 0,4 Z" fill="#fecdd3" />
  </g>
  <g style="animation: sakuraFallTrack3 5.5s cubic-bezier(0.37, 0, 0.63, 1) infinite 2.6s;">
    <path d="M 0,-4.2 C 2.4,-4.2 3.8,-1.8 3,0.5 C 2.2,2.6 1,4.2 0,4.6 C -1,4.2 -2.2,2.6 -3,0.5 C -3.8,-1.8 -2.4,-4.2 0,-4.2 Z" fill="#f472b6" opacity="0.92" />
    <circle cx="0.5" cy="-0.5" r="1" fill="#ffffff" opacity="0.5" />
  </g>
  <g style="animation: sakuraFallTrack4 6.2s cubic-bezier(0.37, 0, 0.63, 1) infinite 0.8s;">
    <path d="M 0,-4.5 C 2.5,-4.5 4,-2 3.2,0.5 C 2.5,2.8 1.2,4.5 0,5 C -1.2,4.5 -2.5,2.8 -3.2,0.5 C -4,-2 -2.5,-4.5 0,-4.5 Z" fill="#fda4af" opacity="0.85" />
  </g>
  <g style="animation: sakuraFallTrack1 5.6s cubic-bezier(0.37, 0, 0.63, 1) infinite 3.5s;">
    <path d="M 0,-3.8 C 2.2,-3.8 3.5,-1.6 2.8,0.4 C 2,2.2 0.8,3.8 0,4.2 C -0.8,3.8 -2,2.2 -2.8,0.4 C -3.5,-1.6 -2.2,-3.8 0,-3.8 Z" fill="#fbcfe8" opacity="0.9" />
  </g>
  <g style="animation: sakuraFallTrack2 5.8s cubic-bezier(0.37, 0, 0.63, 1) infinite 4.2s;">
    <path d="M 0,-4.5 C 2.5,-4.5 4,-2 3.2,0.5 C 2.5,2.8 1.2,4.5 0,5 C -1.2,4.5 -2.5,2.8 -3.2,0.5 C -4,-2 -2.5,-4.5 0,-4.5 Z" fill="#f472b6" opacity="0.9" />
  </g>
</g>`,
        aura_wings: `<!-- 🪽 英勇天使羽翼: 依據 star wing 2.png 完整重構雙倍身長雄偉羽翼、背部附著、三層立體羽毛結構與展翅微動態 -->
<g id="acc_aura_wings" pointer-events="none">
  <style>
    @keyframes angelWingFlapLeft {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-3.5deg) scale(1.02, 0.98); }
    }
    @keyframes angelWingFlapRight {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(3.5deg) scale(1.02, 0.98); }
    }
  </style>
  <g style="filter: drop-shadow(0 4px 10px rgba(56,189,248,0.55)) drop-shadow(0 0 3px rgba(255,255,255,0.9));">
    <ellipse cx="60" cy="55" rx="55" ry="40" fill="#38bdf8" opacity="0.16" />
    <g style="transform-origin: 42px 90px; animation: angelWingFlapLeft 4s ease-in-out infinite;">
      <path d="M 38,91 C 28,94 18,92 10,87 C 8,85 10,81 14,83 C 22,86 32,86 39,88 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 36,90 C 26,92 18,90 12,86 C 18,87 26,88 36,88 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 37,87 C 24,88 12,82 4,75 C 2,73 4,69 8,71 C 18,75 28,78 38,82 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 35,85 C 24,85 14,80 7,74 C 15,77 24,79 35,82 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 36,81 C 20,80 6,71 -2,62 C -4,59 -2,56 2,58 C 14,64 26,70 37,76 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 34,79 C 20,77 8,70 1,62 C 11,66 22,71 34,75 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 35,74 C 16,71 0,59 -7,48 C -9,45 -7,42 -3,44 C 10,51 24,60 36,68 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 33,72 C 16,68 2,58 -4,48 C 6,54 18,61 33,67 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 34,66 C 14,60 -3,46 -10,32 C -12,29 -9,26 -5,28 C 8,37 22,48 35,59 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 32,64 C 14,57 -1,45 -7,32 C 4,40 18,50 32,58 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 34,56 C 12,47 -4,31 -11,15 C -13,11 -9,8 -5,11 C 7,22 22,36 35,50 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 32,54 C 12,44 -2,30 -8,15 C 4,25 18,38 32,48 Z" fill="#bae6fd" opacity="0.6" />
      <path d="M 33,46 C 12,33 -3,14 -7,-2 C -9,-6 -5,-8 -1,-5 C 10,8 24,24 34,40 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <path d="M 31,44 C 12,30 -1,13 -4,-2 C 6,10 19,26 31,39 Z" fill="#bae6fd" opacity="0.6" />
      <path d="M 32,38 C 16,24 4,3 2,-10 C 2,-14 6,-14 9,-10 C 16,3 26,20 33,33 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <path d="M 30,36 C 16,22 6,4 4,-8 C 11,4 21,19 30,31 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 32,42 C 22,28 14,12 14,-2 C 14,-6 18,-6 20,-2 C 25,12 30,28 34,38 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <path d="M 34,48 C 26,36 21,22 23,10 C 24,6 27,6 29,10 C 32,22 35,36 37,45 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 36,56 C 30,46 28,34 31,24 C 32,20 35,20 36,24 C 38,34 39,46 40,54 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 39,83 C 28,84 18,80 12,74 C 10,72 12,69 15,70 C 23,73 31,76 39,78 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 38,77 C 25,76 13,69 7,62 C 5,60 7,57 10,58 C 20,62 30,68 39,72 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 38,71 C 24,68 11,58 6,49 C 4,47 6,44 9,45 C 19,50 29,59 39,66 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 37,64 C 23,58 12,46 8,36 C 6,34 8,31 11,32 C 20,38 29,48 38,58 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 37,56 C 26,48 18,36 15,26 C 14,23 16,21 19,22 C 25,29 32,40 38,50 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 42,91 C 36,94 28,94 22,90 C 20,88 22,85 25,86 C 30,88 36,88 41,87 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 42,87 C 34,89 27,87 23,83 C 21,81 23,78 26,79 C 31,81 36,82 41,83 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 41,83 C 33,83 26,79 23,74 C 21,72 24,69 27,70 C 32,73 37,75 41,78 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 41,78 C 34,76 28,70 26,64 C 25,62 27,59 30,60 C 34,64 38,68 41,72 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 41,72 C 35,68 31,61 30,55 C 29,53 31,51 34,52 C 37,56 40,62 42,67 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <ellipse cx="42" cy="89" rx="3.5" ry="4.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <circle cx="41.2" cy="87.8" r="1.2" fill="#38bdf8" />
    </g>
    <g style="transform-origin: 78px 90px; animation: angelWingFlapRight 4s ease-in-out infinite;">
      <path d="M 82,91 C 92,94 102,92 110,87 C 112,85 110,81 106,83 C 98,86 88,86 81,88 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 84,90 C 94,92 102,90 108,86 C 102,87 94,88 84,88 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 83,87 C 96,88 108,82 116,75 C 118,73 116,69 112,71 C 102,75 92,78 82,82 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 85,85 C 96,85 106,80 113,74 C 105,77 96,79 85,82 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 84,81 C 100,80 114,71 122,62 C 124,59 122,56 118,58 C 106,64 94,70 83,76 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 86,79 C 100,77 112,70 119,62 C 109,66 98,71 86,75 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 85,74 C 104,71 120,59 127,48 C 129,45 127,42 123,44 C 110,51 96,60 84,68 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 87,72 C 104,68 118,58 124,48 C 114,54 102,61 87,67 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 86,66 C 106,60 123,46 130,32 C 132,29 129,26 125,28 C 112,37 98,48 85,59 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 88,64 C 106,57 121,45 127,32 C 116,40 102,50 88,58 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 86,56 C 108,47 124,31 131,15 C 133,11 129,8 125,11 C 113,22 98,36 85,50 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 88,54 C 108,44 122,30 128,15 C 116,25 102,38 88,48 Z" fill="#bae6fd" opacity="0.6" />
      <path d="M 87,46 C 108,33 123,14 127,-2 C 129,-6 125,-8 121,-5 C 110,8 96,24 86,40 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <path d="M 89,44 C 108,30 121,13 124,-2 C 114,10 101,26 89,39 Z" fill="#bae6fd" opacity="0.6" />
      <path d="M 88,38 C 104,24 116,3 118,-10 C 118,-14 114,-14 111,-10 C 104,3 94,20 87,33 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <path d="M 90,36 C 104,22 114,4 116,-8 C 109,4 99,19 90,31 Z" fill="#e0f2fe" opacity="0.7" />
      <path d="M 88,42 C 98,28 106,12 106,-2 C 106,-6 102,-6 100,-2 C 95,12 90,28 86,38 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <path d="M 86,48 C 94,36 99,22 97,10 C 96,6 93,6 91,10 C 88,22 85,36 83,45 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 84,56 C 90,46 92,34 89,24 C 88,20 85,20 84,24 C 82,34 81,46 80,54 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1.1" />
      <path d="M 81,83 C 92,84 102,80 108,74 C 110,72 108,69 105,70 C 97,73 89,76 81,78 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 82,77 C 95,76 107,69 113,62 C 115,60 113,57 110,58 C 100,62 90,68 81,72 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 82,71 C 96,68 109,58 114,49 C 116,47 114,44 111,45 C 101,50 91,59 81,66 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 83,64 C 97,58 108,46 112,36 C 114,34 112,31 109,32 C 100,38 91,48 82,58 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 83,56 C 94,48 102,36 105,26 C 106,23 104,21 101,22 C 95,29 88,40 82,50 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 78,91 C 84,94 92,94 98,90 C 100,88 98,85 95,86 C 90,88 84,88 79,87 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 78,87 C 86,89 93,87 97,83 C 99,81 97,78 94,79 C 89,81 84,82 79,83 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 79,83 C 87,83 94,79 97,74 C 99,72 96,69 93,70 C 88,73 83,75 79,78 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 79,78 C 86,76 92,70 94,64 C 95,62 93,59 90,60 C 86,64 82,68 79,72 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <path d="M 79,72 C 85,68 89,61 90,55 C 91,53 89,51 86,52 C 83,56 80,62 78,67 Z" fill="#ffffff" stroke="#0284c7" stroke-width="1" />
      <ellipse cx="78" cy="89" rx="3.5" ry="4.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
      <circle cx="78.8" cy="87.8" r="1.2" fill="#38bdf8" />
    </g>
  </g>
</g>`,
        aura_rainbow: `<g id="acc_aura_rainbow"><path d="M 12,45 A 50,50 0 0,1 108,45" stroke="#f43f5e" stroke-width="2.5" fill="none" opacity="0.6" /><path d="M 15,43 A 47,47 0 0,1 105,43" stroke="#f59e0b" stroke-width="2.5" fill="none" opacity="0.6" /><path d="M 18,41 A 44,44 0 0,1 102,41" stroke="#10b981" stroke-width="2.5" fill="none" opacity="0.6" /><path d="M 21,39 A 41,41 0 0,1 99,39" stroke="#3b82f6" stroke-width="2.5" fill="none" opacity="0.6" /><path d="M 24,37 A 38,38 0 0,1 96,37" stroke="#8b5cf6" stroke-width="2.5" fill="none" opacity="0.6" /></g>`,
        aura_bubbles: `<!-- 🫧 夢幻彩虹泡泡雨 -->
<g id="acc_aura_bubbles" pointer-events="none"><circle cx="20" cy="45" r="5" fill="#38bdf8" opacity="0.35" stroke="#38bdf8" stroke-width="0.8" /><ellipse cx="18.5" cy="43.5" rx="1.5" ry="0.9" fill="#ffffff" opacity="0.8" /><circle cx="98" cy="38" r="6" fill="#ec4899" opacity="0.3" stroke="#f472b6" stroke-width="0.8" /><ellipse cx="96" cy="36" rx="1.8" ry="1.1" fill="#ffffff" opacity="0.8" /><circle cx="15" cy="85" r="6.5" fill="#a855f7" opacity="0.3" stroke="#c084fc" stroke-width="0.8" /><ellipse cx="13" cy="83" rx="2" ry="1.2" fill="#ffffff" opacity="0.8" /><circle cx="104" cy="80" r="5.5" fill="#38bdf8" opacity="0.35" stroke="#38bdf8" stroke-width="0.8" /><ellipse cx="102" cy="78" rx="1.6" ry="1" fill="#ffffff" opacity="0.8" /><circle cx="25" cy="115" r="4" fill="#22c55e" opacity="0.3" stroke="#4ade80" stroke-width="0.7" /><circle cx="95" cy="112" r="4.5" fill="#fbbf24" opacity="0.3" stroke="#facc15" stroke-width="0.7" /></g>`,
        aura_butterflies: `<!-- 🦋 幻光藍蝶飛舞 -->
<g id="acc_aura_butterflies" pointer-events="none"><g transform="translate(18, 50) rotate(-20)"><ellipse cx="-3" cy="-2" rx="3.5" ry="2.2" fill="#38bdf8" opacity="0.85" /><ellipse cx="3" cy="-2" rx="3.5" ry="2.2" fill="#38bdf8" opacity="0.85" /><ellipse cx="-2" cy="2" rx="2.5" ry="1.6" fill="#60a5fa" opacity="0.75" /><ellipse cx="2" cy="2" rx="2.5" ry="1.6" fill="#60a5fa" opacity="0.75" /><line x1="0" y1="-3" x2="0" y2="4" stroke="#1e3a8a" stroke-width="0.7" /></g><g transform="translate(98, 45) rotate(25)"><ellipse cx="-3" cy="-2" rx="4" ry="2.5" fill="#818cf8" opacity="0.85" /><ellipse cx="3" cy="-2" rx="4" ry="2.5" fill="#818cf8" opacity="0.85" /><ellipse cx="-2" cy="2" rx="2.8" ry="1.8" fill="#a78bfa" opacity="0.75" /><ellipse cx="2" cy="2" rx="2.8" ry="1.8" fill="#a78bfa" opacity="0.75" /><line x1="0" y1="-3" x2="0" y2="4" stroke="#312e81" stroke-width="0.7" /></g><g transform="translate(16, 95) rotate(15)"><ellipse cx="-2.5" cy="-1.8" rx="3" ry="1.8" fill="#38bdf8" opacity="0.85" /><ellipse cx="2.5" cy="-1.8" rx="3" ry="1.8" fill="#38bdf8" opacity="0.85" /><ellipse cx="-1.8" cy="1.6" rx="2" ry="1.3" fill="#60a5fa" opacity="0.75" /><ellipse cx="1.8" cy="1.6" rx="2" ry="1.3" fill="#60a5fa" opacity="0.75" /></g></g>`
      },
      head: {
        head_none: "",
        head_sakura: `<!-- 🌸 櫻花小花飾: 比照 🌸 emoji 五瓣心形花瓣與金色花蕊 -->
<g id="acc_head_sakura" transform="translate(84, 31) rotate(14)">
  <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
    <path d="M 4,4 Q 11,8 8,12 Q 3,9 4,4 Z" fill="#22c55e" stroke="#15803d" stroke-width="0.5" />
    <g>
      <path d="M 0,-1 C -4,-4 -6,-10 -2,-11 C -0.5,-11 0,-9 0,-9 C 0,-9 0.5,-11 2,-11 C 6,-10 4,-4 0,-1 Z" fill="#f472b6" stroke="#fb7185" stroke-width="0.5" />
      <g transform="rotate(72)"><path d="M 0,-1 C -4,-4 -6,-10 -2,-11 C -0.5,-11 0,-9 0,-9 C 0,-9 0.5,-11 2,-11 C 6,-10 4,-4 0,-1 Z" fill="#f472b6" stroke="#fb7185" stroke-width="0.5" /></g>
      <g transform="rotate(144)"><path d="M 0,-1 C -4,-4 -6,-10 -2,-11 C -0.5,-11 0,-9 0,-9 C 0,-9 0.5,-11 2,-11 C 6,-10 4,-4 0,-1 Z" fill="#f472b6" stroke="#fb7185" stroke-width="0.5" /></g>
      <g transform="rotate(216)"><path d="M 0,-1 C -4,-4 -6,-10 -2,-11 C -0.5,-11 0,-9 0,-9 C 0,-9 0.5,-11 2,-11 C 6,-10 4,-4 0,-1 Z" fill="#f472b6" stroke="#fb7185" stroke-width="0.5" /></g>
      <g transform="rotate(288)"><path d="M 0,-1 C -4,-4 -6,-10 -2,-11 C -0.5,-11 0,-9 0,-9 C 0,-9 0.5,-11 2,-11 C 6,-10 4,-4 0,-1 Z" fill="#f472b6" stroke="#fb7185" stroke-width="0.5" /></g>
    </g>
    <circle cx="0" cy="-0.5" r="4.5" fill="#fbcfe8" opacity="0.8" />
    <circle cx="0" cy="-0.5" r="2.8" fill="#facc15" stroke="#ca8a04" stroke-width="0.6" />
    <circle cx="0" cy="-0.5" r="1.2" fill="#ffffff" />
    <circle cx="-2" cy="-2" r="0.6" fill="#ca8a04" /><circle cx="2" cy="-2" r="0.6" fill="#ca8a04" />
    <circle cx="-1.5" cy="1" r="0.6" fill="#ca8a04" /><circle cx="1.5" cy="1" r="0.6" fill="#ca8a04" />
  </g>
</g>`,
head_ribbon: `<!-- 🎀 萌萌蝴蝶結: 深度比照 🎀 emoji 立體圓潤雙環與雙燕尾飄帶 (x=84, y=30) -->
<g id="acc_head_ribbon" transform="translate(84, 30) rotate(16)">
  <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.22))">
    <path d="M -2,3 Q -6,11 -9,17 L -5,15 L -2,17 Q -1,9 0,3 Z" fill="#9f1239" />
    <path d="M -2,3 Q -5,10 -7,15 L -5,14 L -3,15 Q -1,8 0,3 Z" fill="#f43f5e" />
    <path d="M 2,3 Q 6,11 9,17 L 5,15 L 2,17 Q 1,9 0,3 Z" fill="#9f1239" />
    <path d="M 2,3 Q 5,10 7,15 L 5,14 L 3,15 Q 1,8 0,3 Z" fill="#f43f5e" />
    <path d="M 0,0 C -6,-10 -19,-9 -18,0 C -17,9 -6,7 0,2 Z" fill="#9f1239" />
    <path d="M -1,-1 C -5,-9 -17,-8 -16,0 C -15,7 -5,5 -1,1 Z" fill="#f43f5e" />
    <path d="M -3,-3 C -7,-8 -15,-7 -14,-1 C -11,-4 -7,-5 -3,-3 Z" fill="#fda4af" opacity="0.85" />
    <ellipse cx="-7.5" cy="0" rx="3.5" ry="2.2" fill="#881337" transform="rotate(-12 -7.5 0)" />
    <path d="M 0,0 C 6,-10 19,-9 18,0 C 17,9 6,7 0,2 Z" fill="#9f1239" />
    <path d="M 1,-1 C 5,-9 17,-8 16,0 C 15,7 5,5 1,1 Z" fill="#f43f5e" />
    <path d="M 3,-3 C 7,-8 15,-7 14,-1 C 11,-4 7,-5 3,-3 Z" fill="#fda4af" opacity="0.85" />
    <ellipse cx="7.5" cy="0" rx="3.5" ry="2.2" fill="#881337" transform="rotate(12 7.5 0)" />
    <ellipse cx="0" cy="0.5" rx="4.2" ry="3.6" fill="#be185d" stroke="#881337" stroke-width="0.5" />
    <ellipse cx="0" cy="0.5" rx="3.5" ry="2.9" fill="#f43f5e" />
    <ellipse cx="-0.8" cy="-0.6" rx="1.8" ry="1.2" fill="#ffe4e6" opacity="0.9" />
    <path d="M -2.2,2.2 Q 0,3.6 2.2,2.2" stroke="#be185d" stroke-width="0.7" fill="none" />
  </g>
</g>`,
head_cap: `<!-- 🧢 活力運動帽: 比照 🧢 emoji 經典皇家藍棒球帽與帽簷 -->
<g id="acc_head_cap" transform="translate(60, 24)">
  <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
    <path d="M -25,4 C -26,-12 26,-12 25,4 Z" fill="#1d4ed8" />
    <path d="M -23,3 C -24,-10 24,-10 23,3 Z" fill="#2563eb" />
    <path d="M -18,-2 C -18,-9 10,-9 16,-2" stroke="#60a5fa" stroke-width="1.8" fill="none" opacity="0.8" />
    <path d="M -22,4 C -15,4 16,3 28,1 C 36,0 34,7 22,8 C 10,9 -15,8 -22,4 Z" fill="#1e40af" />
    <path d="M -18,4 C -10,4 15,3 26,2 C 32,1 30,6 20,7 C 10,8 -12,7 -18,4 Z" fill="#3b82f6" />
    <circle cx="0" cy="-11" r="2.8" fill="#1e40af" stroke="#ffffff" stroke-width="0.7" />
    <g transform="translate(0, -2) scale(0.65)"><ellipse cx="0" cy="0" rx="3" ry="2.2" fill="#ffffff" /><circle cx="-3" cy="-3.5" r="1" fill="#ffffff" /><circle cx="0" cy="-4.5" r="1" fill="#ffffff" /><circle cx="3" cy="-3.5" r="1" fill="#ffffff" /></g>
  </g>
</g>`,
        head_grad: `<g id="acc_head_grad" transform="translate(60, 18)"><polygon points="0,-12 -28,-3 0,6 28,-3" fill="#1e293b" /><polygon points="-16,0 -16,8 16,8 16,0" fill="#334155" /><path d="M 0,-3 L 24,2 L 26,14" stroke="#f59e0b" stroke-width="2" fill="none" /><circle cx="26" cy="15" r="2" fill="#d97706" /></g>`,
        head_ranger: `<!-- Lv.4 Adventurer Ranger Hat --><g id="acc_head_ranger" transform="translate(60, 20)"><ellipse cx="0" cy="4" rx="30" ry="7" fill="#15803d" /><path d="M -22,4 C -16,-10 16,-10 22,4 Z" fill="#16a34a" /><rect x="-18" y="2" width="36" height="3" fill="#ca8a04" /><path d="M 10,2 C 16,-12 28,-20 36,-18 C 30,-12 22,-4 16,2 Z" fill="#ef4444" /><line x1="12" y1="2" x2="32" y2="-17" stroke="#b91c1c" stroke-width="0.8" /></g>`,
        head_wizard: `<g id="acc_head_wizard" transform="translate(60, 18)"><ellipse cx="0" cy="8" rx="30" ry="6" fill="#312e81" /><path d="M -20,7 Q -8,-8 10,-24 Q 2,-6 20,7 Z" fill="#4338ca" /><ellipse cx="0" cy="6" rx="20" ry="3" fill="#fbbf24" /><polygon points="10,-24 13,-21 16,-24 14,-21 17,-19 13,-19 12,-16 11,-19 7,-19 10,-21" fill="#facc15" /></g>`,
        head_crown: `<!-- 👑 傳奇璀璨皇冠: 比照 👑 emoji 經典五峰金冠與紅藍綠寶石鑲嵌 -->
<g id="acc_head_crown" transform="translate(60, 16)">
  <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
    <path d="M -22,8 L -20,-6 L -10,1 L 0,-11 L 10,1 L 20,-6 L 22,8 Z" fill="#facc15" stroke="#b45309" stroke-width="1.2" />
    <path d="M -18,6 L -17,-3 L -9,2 L 0,-8 L 9,2 L 17,-3 L 18,6 Z" fill="#fde047" opacity="0.6" />
    <rect x="-22" y="6" width="44" height="5" rx="1.5" fill="#ca8a04" stroke="#854d0e" stroke-width="0.8" />
    <circle cx="-14" cy="8.5" r="1.6" fill="#3b82f6" />
    <circle cx="-7" cy="8.5" r="1.6" fill="#ffffff" />
    <circle cx="0" cy="8.5" r="2.2" fill="#ef4444" stroke="#ffffff" stroke-width="0.5" />
    <circle cx="7" cy="8.5" r="1.6" fill="#ffffff" />
    <circle cx="14" cy="8.5" r="1.6" fill="#10b981" />
    <circle cx="-20" cy="-6" r="2" fill="#3b82f6" stroke="#ffffff" stroke-width="0.5" />
    <circle cx="-10" cy="1" r="1.6" fill="#ffffff" />
    <circle cx="0" cy="-11" r="3" fill="#ef4444" stroke="#ffffff" stroke-width="0.8" />
    <circle cx="10" cy="1" r="1.6" fill="#ffffff" />
    <circle cx="20" cy="-6" r="2" fill="#10b981" stroke="#ffffff" stroke-width="0.5" />
  </g>
</g>`,
        head_bunny_hood: `<!-- 🥟 小包子帽帽: 雪白圓滾滾包覆小臉蛋，頂部可愛小蒸包捏褶揪揪，兩頰粉嫩微醺紅暈 -->
<g id="acc_head_bunny_hood" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.16))">
  <g transform="translate(60, 15)">
    <ellipse cx="0" cy="0" rx="6.5" ry="4.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.1" />
    <path d="M -4.5,2 Q 0,-3.5 4.5,2" stroke="#cbd5e1" stroke-width="1.1" fill="none" stroke-linecap="round" />
    <path d="M -2.5,3.2 Q 0,-1 2.5,3.2" stroke="#cbd5e1" stroke-width="0.9" fill="none" stroke-linecap="round" />
    <circle cx="0" cy="-1.5" r="1.3" fill="#fde047" />
  </g>
  <path fill-rule="evenodd" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"
        d="M 60,18 C 28,18 16,32 18,54 C 20,76 34,84 60,84 C 86,84 100,76 102,54 C 104,32 92,18 60,18 Z
           M 60,29 C 76,29 86,40 85,55 C 84,69 74,75 60,75 C 46,75 36,69 35,55 C 34,40 44,29 60,29 Z" />
  <path d="M 48,24 Q 60,21 72,24" stroke="#f8fafc" stroke-width="3" fill="none" stroke-linecap="round" />
  <circle cx="22" cy="52" r="3.5" fill="#f8fafc" opacity="0.8" />
  <circle cx="98" cy="52" r="3.5" fill="#f8fafc" opacity="0.8" />
  <ellipse cx="28" cy="60" rx="4.5" ry="3" fill="#fbcfe8" opacity="0.65" />
  <ellipse cx="92" cy="60" rx="4.5" ry="3" fill="#fbcfe8" opacity="0.65" />
  <g transform="translate(60, 26)">
    <path d="M 0,-3 L 0.7,-0.8 L 3,0 L 0.7,0.8 L 0,3 L -0.7,0.8 L -3,0 L -0.7,-0.8 Z" fill="#facc15" />
    <circle cx="0" cy="0" r="0.7" fill="#ffffff" />
  </g>
</g>`,
        head_rabbit: `<!-- 🐰 萌兔毛絨長耳 -->
<g id="acc_head_rabbit"><ellipse cx="44" cy="10" rx="4.5" ry="14" transform="rotate(-10 44 10)" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8" /><ellipse cx="44" cy="10" rx="2.5" ry="10" transform="rotate(-10 44 10)" fill="#fbcfe8" /><ellipse cx="76" cy="10" rx="4.5" ry="14" transform="rotate(10 76 10)" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8" /><ellipse cx="76" cy="10" rx="2.5" ry="10" transform="rotate(10 76 10)" fill="#fbcfe8" /></g>`,
        head_flower_tiara: `<!-- 🧚‍♀️ 晶透精靈花冠 -->
<g id="acc_head_flower_tiara"><path d="M 38,32 Q 60,26 82,32" stroke="#4ade80" stroke-width="2" fill="none" stroke-linecap="round" /><circle cx="48" cy="28" r="3.2" fill="#f472b6" /><circle cx="48" cy="28" r="1.2" fill="#fef08a" /><circle cx="60" cy="26" r="3.8" fill="#ec4899" /><circle cx="60" cy="26" r="1.4" fill="#ffffff" /><circle cx="72" cy="28" r="3.2" fill="#f472b6" /><circle cx="72" cy="28" r="1.2" fill="#fef08a" /><circle cx="42" cy="30" r="1.5" fill="#38bdf8" opacity="0.8" /><circle cx="78" cy="30" r="1.5" fill="#38bdf8" opacity="0.8" /></g>`,
        head_cupcake: `<!-- 🧁 草莓奶油蛋糕帽 -->
<g id="acc_head_cupcake" transform="translate(68, 22) rotate(12)"><path d="M -8,2 L 8,2 L 6,10 L -6,10 Z" fill="#93c5fd" stroke="#3b82f6" stroke-width="0.6" /><path d="M -9,2 Q 0,-6 9,2 Q 0,-3 -9,2" fill="#fdf2f8" stroke="#f472b6" stroke-width="0.6" /><circle cx="0" cy="-4" r="2.2" fill="#ef4444" /><line x1="0" y1="-6" x2="2" y2="-9" stroke="#15803d" stroke-width="0.8" stroke-linecap="round" /></g>`
      },
      face: {
        face_none: "",
        face_blush: `<!-- ✨ 星光微醺腮紅: 醺醺粉紅大紅暈、害羞動漫斜紋、兩側閃爍旋轉四角星芒 -->
<g id="acc_face_blush">
  <style>
    @keyframes blushBreathe {
      0%, 100% { opacity: 0.65; transform: scale(1); }
      50% { opacity: 0.95; transform: scale(1.12); }
    }
    @keyframes starTwinkleLeft {
      0%, 100% { transform: translate(34px, 58px) scale(0.85) rotate(0deg); opacity: 0.7; }
      50% { transform: translate(34px, 58px) scale(1.3) rotate(45deg); opacity: 1; }
    }
    @keyframes starTwinkleRight {
      0%, 100% { transform: translate(86px, 58px) scale(1.25) rotate(45deg); opacity: 1; }
      50% { transform: translate(86px, 58px) scale(0.85) rotate(0deg); opacity: 0.7; }
    }
    @keyframes miniSparkleLeft {
      0%, 100% { transform: translate(44px, 66px) scale(0.6) rotate(15deg); opacity: 0.5; }
      50% { transform: translate(44px, 66px) scale(1.1) rotate(60deg); opacity: 0.95; }
    }
    @keyframes miniSparkleRight {
      0%, 100% { transform: translate(76px, 66px) scale(1.1) rotate(60deg); opacity: 0.95; }
      50% { transform: translate(76px, 66px) scale(0.6) rotate(15deg); opacity: 0.5; }
    }
  </style>
  <g style="transform-origin: 38px 62px; animation: blushBreathe 2.4s ease-in-out infinite;">
    <ellipse cx="38" cy="62" rx="9" ry="5.5" fill="#f43f5e" opacity="0.45" />
    <ellipse cx="38" cy="62" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.6" />
    <line x1="33" y1="65" x2="36" y2="59" stroke="#e11d48" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
    <line x1="37" y1="65" x2="40" y2="59" stroke="#e11d48" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
    <line x1="41" y1="65" x2="44" y2="59" stroke="#e11d48" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
  </g>
  <g style="transform-origin: 82px 62px; animation: blushBreathe 2.4s ease-in-out infinite;">
    <ellipse cx="82" cy="62" rx="9" ry="5.5" fill="#f43f5e" opacity="0.45" />
    <ellipse cx="82" cy="62" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.6" />
    <line x1="77" y1="65" x2="80" y2="59" stroke="#e11d48" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
    <line x1="81" y1="65" x2="84" y2="59" stroke="#e11d48" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
    <line x1="85" y1="65" x2="88" y2="59" stroke="#e11d48" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
  </g>
  <g style="animation: starTwinkleLeft 1.8s ease-in-out infinite;">
    <path d="M 0,-5.5 Q 0.8,-1 5.5,0 Q 0.8,1 0,5.5 Q -0.8,1 -5.5,0 Q -0.8,-1 0,-5.5 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="0.5" />
    <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
  </g>
  <g style="animation: miniSparkleLeft 2s ease-in-out infinite;">
    <path d="M 0,-3.5 Q 0.5,-0.6 3.5,0 Q 0.5,0.6 0,3.5 Q -0.5,0.6 -3.5,0 Q -0.5,-0.6 0,-3.5 Z" fill="#f472b6" />
  </g>
  <g style="animation: starTwinkleRight 1.8s ease-in-out infinite;">
    <path d="M 0,-5.5 Q 0.8,-1 5.5,0 Q 0.8,1 0,5.5 Q -0.8,1 -5.5,0 Q -0.8,-1 0,-5.5 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="0.5" />
    <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
  </g>
  <g style="animation: miniSparkleRight 2s ease-in-out infinite;">
    <path d="M 0,-3.5 Q 0.5,-0.6 3.5,0 Q 0.5,0.6 0,3.5 Q -0.5,0.6 -3.5,0 Q -0.5,-0.6 0,-3.5 Z" fill="#f472b6" />
  </g>
</g>`,
        face_glasses: `<g id="acc_face_glasses"><circle cx="46" cy="52" r="9.5" fill="none" stroke="#78350f" stroke-width="2.2" /><circle cx="74" cy="52" r="9.5" fill="none" stroke="#78350f" stroke-width="2.2" /><path d="M 55.5,52 Q 60,48.5 64.5,52" stroke="#78350f" stroke-width="2.2" fill="none" /><line x1="36.5" y1="51" x2="26" y2="48" stroke="#78350f" stroke-width="1.8" /><line x1="83.5" y1="51" x2="94" y2="48" stroke="#78350f" stroke-width="1.8" /></g>`,
        face_sunglasses: `<g id="acc_face_sunglasses"><path d="M 34,46 L 56,46 L 54,58 Q 45,63 36,58 Z" fill="#0f172a" /><path d="M 64,46 L 86,46 L 84,58 Q 75,63 66,58 Z" fill="#0f172a" /><line x1="56" y1="48" x2="64" y2="48" stroke="#0f172a" stroke-width="3" /><line x1="34" y1="48" x2="25" y2="46" stroke="#0f172a" stroke-width="2.2" /><line x1="86" y1="48" x2="95" y2="46" stroke="#0f172a" stroke-width="2.2" /><path d="M 37,48 L 46,48 L 40,55 Z" fill="#ffffff" opacity="0.35" /><path d="M 67,48 L 76,48 L 70,55 Z" fill="#ffffff" opacity="0.35" /></g>`,
        face_strawberry: `<!-- 🍓 俏皮草莓小鼻貼 -->
<g id="acc_face_strawberry"><rect x="51" y="53" width="18" height="5" rx="2.5" fill="#fbcfe8" stroke="#f472b6" stroke-width="0.6" /><circle cx="60" cy="55.5" r="1.8" fill="#ef4444" /><polygon points="60,53.8 59,54.8 61,54.8" fill="#22c55e" /><circle cx="54" cy="55.5" r="0.4" fill="#ec4899" /><circle cx="66" cy="55.5" r="0.4" fill="#ec4899" /></g>`,
        face_star_sparkle: `<!-- ⭐ 星芒閃爍貼紙 -->
<g id="acc_face_star_sparkle"><path d="M 40,56 L 41,53 L 42,56 L 45,57 L 42,58 L 41,61 L 40,58 L 37,57 Z" fill="#facc15" stroke="#ca8a04" stroke-width="0.4" /><circle cx="36" cy="62" r="0.9" fill="#38bdf8" /><path d="M 80,56 L 81,53 L 82,56 L 85,57 L 82,58 L 81,61 L 80,58 L 77,57 Z" fill="#facc15" stroke="#ca8a04" stroke-width="0.4" /><circle cx="84" cy="62" r="0.9" fill="#38bdf8" /></g>`,
        face_masquerade: `<!-- 🎭 華麗金紋面具 -->
<g id="acc_face_masquerade"><path d="M 36,46 Q 60,40 84,46 Q 88,54 82,55 Q 74,56 68,52 Q 60,54 52,52 Q 46,56 38,55 Q 32,54 36,46 Z" fill="#581c87" stroke="#fbbf24" stroke-width="1.2" opacity="0.95" /><ellipse cx="48" cy="49" rx="5.5" ry="3.5" fill="#ffffff" opacity="0.2" stroke="#fde047" stroke-width="0.6" /><ellipse cx="72" cy="49" rx="5.5" ry="3.5" fill="#ffffff" opacity="0.2" stroke="#fde047" stroke-width="0.6" /><circle cx="60" cy="45" r="1.5" fill="#fbbf24" /></g>`
      },
      neck: {
        neck_none: "",
        neck_bell: `<!-- 🔔 招財黃金鈴鐺: 比照 🔔 emoji 立體金鈴與紅絲帶項圈 -->
<g id="acc_neck_bell">
  <path d="M 36,75 Q 60,86 84,75" stroke="#dc2626" stroke-width="4" stroke-linecap="round" fill="none" />
  <path d="M 36,75 Q 60,86 84,75" stroke="#ef4444" stroke-width="2.6" stroke-linecap="round" fill="none" />
  <g transform="translate(60, 83)" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))">
    <circle cx="0" cy="-6" r="2.2" fill="none" stroke="#ca8a04" stroke-width="1.2" />
    <circle cx="0" cy="0" r="6.2" fill="#facc15" stroke="#a16207" stroke-width="1" />
    <ellipse cx="-1.5" cy="-2" rx="3.5" ry="2" fill="#fef08a" opacity="0.9" />
    <line x1="-5.6" y1="0.5" x2="5.6" y2="0.5" stroke="#854d0e" stroke-width="1.2" />
    <line x1="0" y1="0.5" x2="0" y2="3.2" stroke="#713f12" stroke-width="1.2" />
    <circle cx="0" cy="3.8" r="1.6" fill="#713f12" />
    <circle cx="0" cy="3.8" r="1" fill="#facc15" />
  </g>
</g>`,
        neck_scarf: `<!-- 🧣 暖冬經典圍巾: 比照 🧣 emoji 鮮紅厚實針織圍巾與流蘇 -->
<g id="acc_neck_scarf">
  <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.22))">
    <path d="M 28,73 Q 60,89 92,73 Q 60,94 28,73 Z" fill="#b91c1c" />
    <path d="M 30,73 Q 60,87 90,73 Q 60,92 30,73 Z" fill="#ef4444" />
    <path d="M 34,74 Q 60,84 86,74" stroke="#fca5a5" stroke-width="1.2" fill="none" opacity="0.7" />
    <g transform="translate(64, 78) rotate(-12)">
      <rect x="0" y="0" width="12" height="22" rx="3" fill="#b91c1c" />
      <rect x="1" y="0" width="10" height="21" rx="2" fill="#dc2626" />
      <line x1="1" y1="6" x2="11" y2="6" stroke="#ef4444" stroke-width="1.2" />
      <line x1="1" y1="12" x2="11" y2="12" stroke="#ef4444" stroke-width="1.2" />
      <line x1="2" y1="21" x2="2" y2="26" stroke="#fef2f2" stroke-width="1.5" />
      <line x1="4.5" y1="21" x2="4.5" y2="26" stroke="#fef2f2" stroke-width="1.5" />
      <line x1="7" y1="21" x2="7" y2="26" stroke="#fef2f2" stroke-width="1.5" />
      <line x1="9.5" y1="21" x2="9.5" y2="26" stroke="#fef2f2" stroke-width="1.5" />
    </g>
  </g>
</g>`,
        neck_bowtie: `<g id="acc_neck_bowtie"><polygon points="60,78 48,71 48,85" fill="#1e3a8a" stroke="#172554" stroke-width="1" /><polygon points="60,78 72,71 72,85" fill="#1e3a8a" stroke="#172554" stroke-width="1" /><ellipse cx="60" cy="78" rx="3.5" ry="3.5" fill="#2563eb" /></g>`,
        neck_medal: `<g id="acc_neck_medal"><path d="M 52,74 L 60,82 L 68,74" stroke="#2563eb" stroke-width="3" fill="none" /><circle cx="60" cy="86" r="6.5" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" /><text x="60" y="89" text-anchor="middle" font-size="7" font-weight="900" fill="#78350f">1</text></g>`,
        neck_strawberry: `<!-- 🍓 草莓甜心項圈: 紅格紋項圈與胸前搖曳的大顆立體紅草莓 -->
<g id="acc_neck_strawberry" filter="drop-shadow(0 2px 4px rgba(220,38,38,0.3))">
  <path d="M 36,76 Q 60,88 84,76" stroke="#dc2626" stroke-width="4" stroke-linecap="round" fill="none" />
  <path d="M 36,76 Q 60,88 84,76" stroke="#f87171" stroke-width="2" stroke-linecap="round" fill="none" />
  <circle cx="60" cy="87" r="2.2" fill="none" stroke="#fbbf24" stroke-width="1.3" />
  <g transform="translate(60, 94)">
    <path d="M -7,-4 C -9,4 -4,11 0,13 C 4,11 9,4 7,-4 C 5,-7 -5,-7 -7,-4 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8" />
    <ellipse cx="-2.8" cy="-2" rx="2.4" ry="1.4" transform="rotate(-25 -2.8 -2)" fill="#ffffff" opacity="0.8" />
    <circle cx="-3" cy="2" r="0.6" fill="#fef08a" /><circle cx="3" cy="2" r="0.6" fill="#fef08a" />
    <circle cx="0" cy="6" r="0.6" fill="#fef08a" /><circle cx="-2" cy="9" r="0.5" fill="#fef08a" /><circle cx="2" cy="9" r="0.5" fill="#fef08a" />
    <polygon points="0,-7 -4,-5 -2,-3 0,-4 2,-3 4,-5" fill="#22c55e" stroke="#15803d" stroke-width="0.5" />
    <path d="M 0,-7 Q -1,-9 -3,-10" stroke="#16a34a" stroke-width="1.2" fill="none" stroke-linecap="round" />
  </g>
</g>`,
        neck_lace: `<!-- 🎀 夢幻蕾絲荷葉領: 胸前優雅展開的法式雪白荷葉波浪領 -->
<g id="acc_neck_lace" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))">
  <path d="M 34,76 Q 40,84 47,80 Q 53,87 60,83 Q 67,87 73,80 Q 80,84 86,76 C 82,90 60,95 34,76 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <path d="M 36,77 Q 60,86 84,77" stroke="#f472b6" stroke-width="1.6" fill="none" stroke-linecap="round" />
  <ellipse cx="56.5" cy="84" rx="3.5" ry="2.2" transform="rotate(-20 56.5 84)" fill="#f43f5e" stroke="#ffffff" stroke-width="0.6" />
  <ellipse cx="63.5" cy="84" rx="3.5" ry="2.2" transform="rotate(20 63.5 84)" fill="#f43f5e" stroke="#ffffff" stroke-width="0.6" />
  <circle cx="60" cy="84" r="1.8" fill="#ffffff" stroke="#db2777" stroke-width="0.6" />
</g>`,
        neck_sapphire: `<!-- 💎 星辰藍寶石項圈: 璀璨奪目的深邃星藍寶石吊墜 -->
<g id="acc_neck_sapphire" filter="drop-shadow(0 2px 5px rgba(37,99,235,0.3))">
  <path d="M 36,76 Q 60,87 84,76" stroke="#fbbf24" stroke-width="2.2" fill="none" stroke-dasharray="3 1.5" stroke-linecap="round" />
  <g transform="translate(60, 93)">
    <circle cx="0" cy="-6" r="1.8" fill="none" stroke="#ca8a04" stroke-width="1.2" />
    <polygon points="0,-4 7,3 0,11 -7,3" fill="#1d4ed8" stroke="#fbbf24" stroke-width="1.2" />
    <polygon points="0,-2.5 5,3 0,9.5 -5,3" fill="#2563eb" />
    <polygon points="0,-2.5 4,3 0,3 -4,3" fill="#60a5fa" opacity="0.8" />
    <polygon points="-4,3 0,3 0,9.5" fill="#93c5fd" opacity="0.6" />
    <circle cx="-1.5" cy="1.5" r="0.9" fill="#ffffff" />
  </g>
</g>`
      },
      outfit: {
        outfit_none: "",
        outfit_backpack: `<!-- 🎒 探險雙肩包: 比照 🎒 emoji 亮紅冒險書包與肩帶扣環 -->
<g id="acc_outfit_backpack">
  <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))">
    <rect x="25" y="74" width="12" height="24" rx="4" fill="#dc2626" />
    <rect x="26" y="75" width="10" height="22" rx="3" fill="#ef4444" />
    <rect x="83" y="74" width="12" height="24" rx="4" fill="#dc2626" />
    <rect x="84" y="75" width="10" height="22" rx="3" fill="#ef4444" />
    <path d="M 52,72 Q 60,67 68,72" stroke="#b91c1c" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 40,75 L 43,98" stroke="#9a3412" stroke-width="3.6" stroke-linecap="round" />
    <path d="M 80,75 L 77,98" stroke="#9a3412" stroke-width="3.6" stroke-linecap="round" />
    <rect x="41" y="86" width="4.5" height="5" rx="1" fill="#facc15" stroke="#a16207" stroke-width="0.5" />
    <rect x="74.5" y="86" width="4.5" height="5" rx="1" fill="#facc15" stroke="#a16207" stroke-width="0.5" />
  </g>
</g>`,
        outfit_cloak: `<!-- Lv.4 Hero Adventurer Cloak --><g id="acc_outfit_cloak"><path d="M 32,74 C 20,86 16,112 25,116 C 36,118 42,105 46,95 C 54,92 66,92 74,95 C 78,105 84,118 95,116 C 104,112 100,86 88,74 Z" fill="#b91c1c" /><path d="M 25,116 C 36,118 42,105 46,95" stroke="#facc15" stroke-width="2" fill="none" /><path d="M 74,95 C 78,105 84,118 95,116" stroke="#facc15" stroke-width="2" fill="none" /><circle cx="60" cy="76" r="4.5" fill="#facc15" /><circle cx="60" cy="76" r="2.5" fill="#ef4444" /></g>`,
        outfit_sailor: `<!-- ⚓ 可愛水手制服: 加長A字百褶裙+海軍領雙白線+紅色領巾+顯眼裙摺雙白線 (長度延伸至足部，裙子立體有型) -->
<g id="acc_outfit_sailor" filter="drop-shadow(0 2px 5px rgba(30,58,138,0.22))">
  <!-- 上衣白色襯衫基底 -->
  <path d="M 36,73 L 32,86 L 43,87 L 77,87 L 88,86 L 84,73 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
  <!-- 海軍大翻領 (深藍配雙白細線) -->
  <path d="M 42,72 L 32,85 L 46,85 L 54,76 Z" fill="#1e3a8a" stroke="#172554" stroke-width="0.8" />
  <path d="M 78,72 L 88,85 L 74,85 L 66,76 Z" fill="#1e3a8a" stroke="#172554" stroke-width="0.8" />
  <line x1="34" y1="82" x2="44" y2="82" stroke="#ffffff" stroke-width="0.8" />
  <line x1="86" y1="82" x2="76" y2="82" stroke="#ffffff" stroke-width="0.8" />
  <!-- 胸前倒三角水手領襯底與紅色蝴蝶領巾 -->
  <polygon points="60,84 55,76 65,76" fill="#ffffff" />
  <ellipse cx="56.5" cy="80.5" rx="3" ry="1.8" transform="rotate(-15 56.5 80.5)" fill="#dc2626" />
  <ellipse cx="63.5" cy="80.5" rx="3" ry="1.8" transform="rotate(15 63.5 80.5)" fill="#dc2626" />
  <polygon points="60,81 55,92 60,89 65,92" fill="#ef4444" />
  <circle cx="60" cy="80.5" r="1.5" fill="#b91c1c" />
  <!-- 水手百褶裙：加長至足部 y=114，呈自然A字外擴百褶裙擺，裙褶立體感十足 -->
  <path d="M 37,86 Q 60,88 83,86 L 94,113 Q 60,116 26,113 Z" fill="#1e3a8a" stroke="#172554" stroke-width="0.9" />
  <!-- 白色高腰腰帶線條 -->
  <rect x="37" y="85.5" width="46" height="2.5" rx="1" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.5" />
  <!-- 立體百褶裙摺線 (8條立體折痕，明暗陰影) -->
  <line x1="41" y1="87" x2="33" y2="113" stroke="#172554" stroke-width="1.2" />
  <line x1="47" y1="87" x2="42" y2="114" stroke="#172554" stroke-width="1.2" />
  <line x1="53" y1="87" x2="51" y2="114.5" stroke="#172554" stroke-width="1.2" />
  <line x1="60" y1="87" x2="60" y2="115" stroke="#172554" stroke-width="1.2" />
  <line x1="67" y1="87" x2="69" y2="114.5" stroke="#172554" stroke-width="1.2" />
  <line x1="73" y1="87" x2="78" y2="114" stroke="#172554" stroke-width="1.2" />
  <line x1="79" y1="87" x2="87" y2="113" stroke="#172554" stroke-width="1.2" />
  <!-- 經典百褶裙擺經典雙白條紋 -->
  <path d="M 28,107 Q 60,110 92,107" stroke="#ffffff" stroke-width="1.4" fill="none" />
  <path d="M 27,110 Q 60,113 93,110" stroke="#ffffff" stroke-width="1.4" fill="none" />
</g>`,
        outfit_dress: `<!-- 👗 夢幻粉紅法式公主裙: 顯瘦修身收腰+立體抓褶垂墜A字裙+法式荷葉花邊 (徹底告別臃腫圓球) -->
<g id="acc_outfit_dress">
  <g filter="drop-shadow(0 3px 6px rgba(219,39,119,0.25))">
    <!-- 兩側合身微翹荷葉短袖 (取代原本突出的寬大左右兩側大圓球泡泡袖) -->
    <path d="M 39,73 C 33,75 32,82 37,84 C 40,84 41,80 40,75 Z" fill="#f472b6" stroke="#db2777" stroke-width="0.8" />
    <path d="M 81,73 C 87,75 88,82 83,84 C 80,84 79,80 80,75 Z" fill="#f472b6" stroke="#db2777" stroke-width="0.8" />
    <path d="M 34,79 Q 37,82 40,79" stroke="#ffffff" stroke-width="0.9" fill="none" />
    <path d="M 86,79 Q 83,82 80,79" stroke="#ffffff" stroke-width="0.9" fill="none" />
    <!-- 修身合身上衣 (寬度收窄，線條流暢貼合身形) -->
    <path d="M 40,71 C 48,72 72,72 80,71 C 82,76 81,81 79,86 C 72,87 48,87 41,86 C 39,81 38,76 40,71 Z" fill="#f472b6" stroke="#db2777" stroke-width="0.9" />
    <!-- 精緻法式方領白色蕾絲滾邊 -->
    <path d="M 45,71 Q 52,73 60,71 Q 68,73 75,71" stroke="#ffffff" stroke-width="1.6" fill="none" stroke-linecap="round" />
    <!-- 胸前垂直珍珠寶石鈕扣 (縱向延伸視覺，顯瘦拉長比例) -->
    <circle cx="60" cy="74.5" r="1.1" fill="#ffffff" stroke="#db2777" stroke-width="0.4" />
    <circle cx="60" cy="78" r="1.1" fill="#ffffff" stroke="#db2777" stroke-width="0.4" />
    <circle cx="60" cy="81.5" r="1.1" fill="#ffffff" stroke="#db2777" stroke-width="0.4" />
    <!-- 束腰酒紅緞帶與收腰蝴蝶結 (強調高腰線條) -->
    <path d="M 40,85 Q 60,87 80,85 L 80,88.5 Q 60,90.5 40,88.5 Z" fill="#db2777" />
    <line x1="41" y1="86.8" x2="79" y2="86.8" stroke="#fbcfe8" stroke-width="0.7" opacity="0.8" />
    <!-- 顯瘦A字垂墜長裙 (縱向流暢垂直線條，不再向兩側鼓脹成圓球) -->
    <path d="M 40,88 Q 60,90 80,88 L 89,113 Q 60,116 31,113 Z" fill="#fbcfe8" stroke="#db2777" stroke-width="0.9" />
    <!-- 裙面垂直柔和陰影摺線 (增加垂直修長感) -->
    <path d="M 46,88 Q 44,101 41,113" stroke="#f472b6" stroke-width="1" fill="none" />
    <path d="M 53,89 Q 52,102 51,114" stroke="#f472b6" stroke-width="1" fill="none" />
    <path d="M 67,89 Q 68,102 69,114" stroke="#f472b6" stroke-width="1" fill="none" />
    <path d="M 74,88 Q 76,101 79,113" stroke="#f472b6" stroke-width="1" fill="none" />
    <!-- 裙擺優雅雪白波浪蕾絲邊 -->
    <path d="M 31,112 Q 38,115 45,112 Q 52,116 60,113 Q 68,116 75,112 Q 82,115 89,112 C 87,114 78,116 60,116 C 42,116 33,114 31,112 Z" fill="#ffffff" stroke="#f472b6" stroke-width="0.8" />
    <!-- 腰際小巧俏麗立體蝴蝶結 -->
    <ellipse cx="57" cy="86.8" rx="3.2" ry="2" transform="rotate(-15 57 86.8)" fill="#f43f5e" stroke="#ffffff" stroke-width="0.5" />
    <ellipse cx="63" cy="86.8" rx="3.2" ry="2" transform="rotate(15 63 86.8)" fill="#f43f5e" stroke="#ffffff" stroke-width="0.5" />
    <circle cx="60" cy="86.8" r="1.6" fill="#ffffff" stroke="#db2777" stroke-width="0.5" />
  </g>
</g>`,
        outfit_hoodie: `<!-- 🐱 暖萌柴犬連帽衛衣: 溫暖芥末黃連帽T，胸前軟萌貓爪口袋與棉質抽繩 -->
<g id="acc_outfit_hoodie" filter="drop-shadow(0 2px 4px rgba(202,138,4,0.25))">
  <path d="M 38,71 Q 60,65 82,71 Q 74,62 60,62 Q 46,62 38,71 Z" fill="#d97706" />
  <path d="M 37,72 L 30,88 L 41,89 L 41,108 Q 60,110 79,108 L 79,89 L 90,88 L 83,72 Z" fill="#f59e0b" stroke="#d97706" stroke-width="1" />
  <rect x="29" y="86" width="12" height="3" rx="1.5" fill="#d97706" />
  <rect x="79" y="86" width="12" height="3" rx="1.5" fill="#d97706" />
  <path d="M 52,72 L 60,77 L 68,72" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" />
  <path d="M 56,76 Q 54,84 55,89" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <circle cx="55" cy="89.5" r="1.2" fill="#ffffff" />
  <path d="M 64,76 Q 66,84 65,89" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round" />
  <circle cx="65" cy="89.5" r="1.2" fill="#ffffff" />
  <path d="M 45,93 L 49,88 L 71,88 L 75,93 L 73,103 Q 60,105 47,103 Z" fill="#fef3c7" stroke="#d97706" stroke-width="0.8" />
  <ellipse cx="60" cy="97" rx="2.5" ry="2" fill="#f59e0b" />
  <circle cx="56.5" cy="94" r="0.9" fill="#f59e0b" />
  <circle cx="59" cy="93" r="0.9" fill="#f59e0b" />
  <circle cx="61.5" cy="93" r="0.9" fill="#f59e0b" />
  <circle cx="63.5" cy="94" r="0.9" fill="#f59e0b" />
  <path d="M 41,107 Q 60,109 79,107 L 79,110 Q 60,112 41,110 Z" fill="#d97706" />
</g>`,
        outfit_overalls: `<!-- 👖 青春丹寧牛仔吊帶褲: 內搭經典紅白條紋T恤，外搭復古水洗牛仔連身工裝褲 -->
<g id="acc_outfit_overalls" filter="drop-shadow(0 2px 4px rgba(30,58,138,0.25))">
  <path d="M 37,72 L 31,86 L 43,87 L 77,87 L 89,86 L 83,72 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
  <path d="M 35,76 L 41,76" stroke="#ef4444" stroke-width="1.8" />
  <path d="M 33,80 L 42,80" stroke="#ef4444" stroke-width="1.8" />
  <path d="M 79,76 L 85,76" stroke="#ef4444" stroke-width="1.8" />
  <path d="M 78,80 L 87,80" stroke="#ef4444" stroke-width="1.8" />
  <path d="M 45,74 L 75,74" stroke="#ef4444" stroke-width="1.8" />
  <path d="M 42,83 L 78,83 L 84,112 Q 60,114 36,112 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="0.9" />
  <path d="M 43,72 L 46,84" stroke="#1e40af" stroke-width="2.6" stroke-linecap="round" />
  <path d="M 77,72 L 74,84" stroke="#1e40af" stroke-width="2.6" stroke-linecap="round" />
  <rect x="44" y="82" width="4.5" height="4" rx="1" fill="#facc15" stroke="#a16207" stroke-width="0.6" />
  <rect x="71.5" y="82" width="4.5" height="4" rx="1" fill="#facc15" stroke="#a16207" stroke-width="0.6" />
  <path d="M 50,88 L 70,88 L 68,98 L 60,102 L 52,98 Z" fill="#1d4ed8" stroke="#facc15" stroke-width="0.8" stroke-dasharray="2 1" />
  <line x1="62" y1="84" x2="66" y2="92" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
  <polygon points="62,84 61,82 63,82" fill="#ef4444" />
  <path d="M 36,108 Q 60,111 84,108" stroke="#facc15" stroke-width="0.8" stroke-dasharray="2 1" fill="none" />
</g>`,
        outfit_maid: `<!-- ☕ 萌系經典女僕裝: 黑色典雅連身長裙+雪白抓褶荷葉邊圍裙+胸前紅色蝴蝶結 -->
<g id="acc_outfit_maid" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.25))">
  <path d="M 38,72 L 31,86 L 42,87 L 78,87 L 89,86 L 82,72 Z" fill="#18181b" stroke="#09090b" stroke-width="0.8" />
  <path d="M 37,86 Q 60,88 83,86 L 93,113 Q 60,116 27,113 Z" fill="#27272a" stroke="#18181b" stroke-width="0.9" />
  <path d="M 38,72 Q 33,76 34,84 Q 38,82 42,76 Z" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.6" />
  <path d="M 82,72 Q 87,76 86,84 Q 82,82 78,76 Z" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.6" />
  <path d="M 47,74 L 73,74 L 71,86 L 49,86 Z" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.6" />
  <path d="M 44,86 L 76,86 L 82,111 Q 60,114 38,111 Z" fill="#fafafa" stroke="#e4e4e7" stroke-width="0.7" />
  <path d="M 38,110 Q 43,113 49,110 Q 55,113 60,110 Q 65,113 71,110 Q 77,113 82,110" stroke="#d4d4d8" stroke-width="1.2" fill="none" />
  <ellipse cx="56.5" cy="76" rx="2.8" ry="1.6" transform="rotate(-15 56.5 76)" fill="#ef4444" />
  <ellipse cx="63.5" cy="76" rx="2.8" ry="1.6" transform="rotate(15 63.5 76)" fill="#ef4444" />
  <circle cx="60" cy="76" r="1.3" fill="#b91c1c" />
  <path d="M 44,86 Q 37,88 38,94 Q 44,91 46,87" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.6" />
  <path d="M 76,86 Q 83,88 82,94 Q 76,91 74,87" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.6" />
</g>`,
        outfit_witch: `<!-- 🧹 萬聖星夜小魔女法袍: 幽邃紫黑星紋魔法長袍+神秘金月胸針+繁星金邊滾條 -->
<g id="acc_outfit_witch" filter="drop-shadow(0 3px 6px rgba(88,28,135,0.35))">
  <path d="M 36,73 L 28,88 L 42,88 L 78,88 L 92,88 L 84,73 Z" fill="#3b0764" stroke="#2e1065" stroke-width="0.8" />
  <path d="M 37,86 Q 60,89 83,86 L 96,114 Q 60,117 24,114 Z" fill="#581c87" stroke="#3b0764" stroke-width="0.9" />
  <path d="M 28,88 C 24,96 26,104 33,101 C 36,96 36,90 41,88 Z" fill="#4c1d95" stroke="#3b0764" stroke-width="0.7" />
  <path d="M 92,88 C 96,96 94,104 87,101 C 84,96 84,90 79,88 Z" fill="#4c1d95" stroke="#3b0764" stroke-width="0.7" />
  <path d="M 52,73 L 60,84 L 68,73 L 63,115 L 57,115 Z" fill="#701a75" opacity="0.9" />
  <line x1="60" y1="84" x2="60" y2="115" stroke="#facc15" stroke-width="0.9" />
  <path d="M 58,76 C 56,74 56,71 58,69 C 55,70 54,73 55,75 C 56,77 58,76 58,76 Z" fill="#facc15" stroke="#ca8a04" stroke-width="0.5" />
  <circle cx="63" cy="72.5" r="1.3" fill="#facc15" />
  <path d="M 25,113 Q 60,116 95,113" stroke="#facc15" stroke-width="1.3" stroke-dasharray="3 2" fill="none" />
  <polygon points="42,104 43,106 45,106 43.5,107 44,109 42,108 40,109 40.5,107 39,106 41,106" fill="#fde047" opacity="0.9" />
  <polygon points="76,102 77,104 79,104 77.5,105 78,107 76,106 74,107 74.5,105 73,104 75,104" fill="#fde047" opacity="0.9" />
</g>`,
        outfit_kimono: `<!-- 👘 和風櫻花祭浴衣 -->
<g id="acc_outfit_kimono"><path d="M 40,71 L 32,88 L 44,98 L 76,98 L 88,88 L 80,71 Z" fill="#fbcfe8" stroke="#ec4899" stroke-width="1" /><path d="M 46,71 L 63,88 L 57,88 L 42,73 Z" fill="#ffffff" opacity="0.8" /><path d="M 74,71 L 57,88 L 63,88 L 78,73 Z" fill="#f472b6" /><rect x="42" y="84" width="36" height="8" rx="1.5" fill="#7c3aed" stroke="#6d28d9" stroke-width="0.8" /><line x1="43" y1="88" x2="77" y2="88" stroke="#fbbf24" stroke-width="1" /><circle cx="60" cy="88" r="2.2" fill="#fbbf24" /><circle cx="60" cy="88" r="1" fill="#dc2626" /><circle cx="48" cy="95" r="1" fill="#ec4899" /><circle cx="72" cy="95" r="1" fill="#ec4899" /></g>`,
        outfit_princess: `<!-- 👑 星空璀璨公主裙 -->
<g id="acc_outfit_princess"><path d="M 42,71 C 48,72 72,72 78,71 L 82,86 L 38,86 Z" fill="#1e1b4b" stroke="#4338ca" stroke-width="1" /><path d="M 36,86 Q 60,89 84,86 L 98,111 Q 60,114 22,111 Z" fill="#312e81" stroke="#4338ca" stroke-width="1" /><path d="M 30,104 Q 60,107 90,104 Q 60,113 30,104 Z" fill="#6366f1" opacity="0.5" /><path d="M 23,111 Q 60,114 97,111" stroke="#facc15" stroke-width="1.4" fill="none" stroke-dasharray="3 2" /><rect x="40" y="85" width="40" height="3" fill="#fbbf24" /><circle cx="45" cy="96" r="0.9" fill="#fde047" /><circle cx="75" cy="98" r="0.9" fill="#fde047" /><circle cx="60" cy="102" r="1.2" fill="#ffffff" /></g>`
      },
      hand: {
        hand_none: "",
        hand_fishbone: `<!-- 🐟 脆脆魚骨點心: 香酥金黃炭烤秋刀魚，裊裊熱氣升騰，一口一口啃光露出魚骨再重生之循環動畫 -->
<g id="acc_hand_fishbone">
  <style>
    @keyframes fishMouthChew {
      0%, 100% { transform: translate(60px, 63px) rotate(-8deg); }
      25% { transform: translate(60px, 61px) rotate(-2deg); }
      50% { transform: translate(60px, 63px) rotate(-9deg); }
      75% { transform: translate(60px, 61px) rotate(-3deg); }
    }
    @keyframes fishHeadBite {
      0%, 22% { opacity: 1; transform: scale(1); }
      25%, 88% { opacity: 0; transform: scale(0.4) translateX(-4px); }
      92%, 100% { opacity: 1; transform: scale(1); }
    }
    @keyframes fishBellyBite {
      0%, 48% { opacity: 1; transform: scale(1); }
      52%, 88% { opacity: 0; transform: scale(0.4); }
      92%, 100% { opacity: 1; transform: scale(1); }
    }
    @keyframes fishTailBite {
      0%, 72% { opacity: 1; transform: scale(1); }
      76%, 88% { opacity: 0; transform: scale(0); }
      92%, 100% { opacity: 1; transform: scale(1); }
    }
    @keyframes fishBoneShow {
      0%, 22% { opacity: 0; }
      25%, 72% { opacity: 1; }
      76%, 88% { opacity: 0; transform: scale(0); }
      92%, 100% { opacity: 0; }
    }
    @keyframes fishCrumbsCrunch {
      0%, 22% { opacity: 0; transform: scale(0); }
      25%, 32% { opacity: 1; transform: scale(1.1); }
      35%, 48% { opacity: 0; transform: scale(0); }
      52%, 58% { opacity: 1; transform: scale(1.2); }
      62%, 72% { opacity: 0; transform: scale(0); }
      76%, 86% { opacity: 1; transform: scale(1.4); }
      90%, 100% { opacity: 0; transform: scale(0); }
    }
    @keyframes grillSteamWisp1 {
      0% { transform: translate(66px, 57px) scale(0.6); opacity: 0; }
      25% { opacity: 0.75; }
      60% { opacity: 0.5; }
      100% { transform: translate(69px, 42px) scale(1.3); opacity: 0; }
    }
    @keyframes grillSteamWisp2 {
      0% { transform: translate(54px, 58px) scale(0.5); opacity: 0; }
      30% { opacity: 0.65; }
      70% { opacity: 0.4; }
      100% { transform: translate(51px, 44px) scale(1.2); opacity: 0; }
    }
  </style>
  <g pointer-events="none">
    <path d="M 0,0 Q 2,-4 -1,-8 Q -4,-12 0,-16" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6" style="animation: grillSteamWisp1 2.8s ease-out infinite 0.2s;" />
    <path d="M 0,0 Q -2,-4 1,-7 Q 3,-11 0,-15" stroke="#ffffff" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.5" style="animation: grillSteamWisp2 3.2s ease-out infinite 1.4s;" />
  </g>
  <g style="animation: fishMouthChew 6s ease-in-out infinite;">
    <g filter="drop-shadow(0 2px 3px rgba(120,53,15,0.35))">
      <g style="animation: fishTailBite 6s ease-in-out infinite;">
        <polygon points="-12,-1 -21,-7 -18,0 -21,7" fill="#92400e" />
        <polygon points="-11,-1 -19,-5 -16,0 -19,5" fill="#d97706" />
        <polygon points="-6,-1 -10,-4 -8,0 -10,4" fill="#b45309" />
        <line x1="-20" y1="-6" x2="-18" y2="-1" stroke="#78350f" stroke-width="0.8" />
        <line x1="-20" y1="6" x2="-18" y2="1" stroke="#78350f" stroke-width="0.8" />
      </g>
      <g style="animation: fishBoneShow 6s ease-in-out infinite;">
        <line x1="-12" y1="0" x2="12" y2="0" stroke="#fefce8" stroke-width="2.5" stroke-linecap="round" />
        <line x1="-8" y1="-3.5" x2="-6" y2="3.5" stroke="#fde68a" stroke-width="1.3" stroke-linecap="round" />
        <line x1="-4" y1="-4" x2="-2" y2="4" stroke="#fde68a" stroke-width="1.3" stroke-linecap="round" />
        <line x1="0" y1="-4" x2="2" y2="4" stroke="#fde68a" stroke-width="1.3" stroke-linecap="round" />
        <line x1="4" y1="-3.5" x2="6" y2="3.5" stroke="#fde68a" stroke-width="1.3" stroke-linecap="round" />
        <circle cx="12" cy="0" r="3.2" fill="#fef9c3" stroke="#d97706" stroke-width="0.8" />
        <circle cx="12.5" cy="-0.5" r="1.2" fill="#92400e" />
      </g>
      <g style="animation: fishBellyBite 6s ease-in-out infinite;">
        <path d="M -11,-3 Q -2,-7 6,-3 Q 6,3 -2,7 Q -11,3 -11,-3 Z" fill="#d97706" stroke="#92400e" stroke-width="0.8" />
        <path d="M -9,1 Q -2,5 4,2 Q 0,0 -9,1 Z" fill="#fef3c7" opacity="0.9" />
        <line x1="-7" y1="-5" x2="-4" y2="3.5" stroke="#78350f" stroke-width="1.2" stroke-linecap="round" />
        <line x1="-2" y1="-5.5" x2="1" y2="4" stroke="#78350f" stroke-width="1.3" stroke-linecap="round" />
        <line x1="3" y1="-4.5" x2="5.5" y2="2.5" stroke="#78350f" stroke-width="1.2" stroke-linecap="round" />
        <ellipse cx="-2" cy="-2.5" rx="2.5" ry="0.8" fill="#fde68a" opacity="0.6" />
      </g>
      <g style="animation: fishHeadBite 6s ease-in-out infinite;">
        <path d="M 4,-4 Q 10,-8 15,-4 Q 19,0 15,4 Q 10,8 4,4 Z" fill="#f59e0b" stroke="#b45309" stroke-width="0.8" />
        <line x1="7" y1="-3" x2="9" y2="2" stroke="#78350f" stroke-width="1" stroke-linecap="round" />
        <polygon points="5,-4 10,-8 12,-4" fill="#b45309" />
        <circle cx="12" cy="-1.5" r="2.2" fill="#ffffff" />
        <circle cx="12.6" cy="-1.5" r="1.3" fill="#451a03" />
        <circle cx="13" cy="-1.8" r="0.5" fill="#ffffff" />
        <path d="M 15,1 Q 14,2.5 12,2" stroke="#78350f" stroke-width="0.8" fill="none" />
      </g>
      <g style="animation: fishCrumbsCrunch 6s ease-out infinite;">
        <circle cx="16" cy="-6" r="1.3" fill="#f59e0b" />
        <circle cx="19" cy="2" r="1.5" fill="#d97706" />
        <circle cx="15" cy="7" r="1.1" fill="#facc15" />
        <circle cx="21" cy="-3" r="0.9" fill="#78350f" />
        <polygon points="18,-1 19.5,1 22,1 20,2.5 20.8,5 18,3.5 15.2,5 16,2.5 14,1 16.5,1" fill="#f59e0b" transform="scale(0.75) translate(8,-2)" />
      </g>
    </g>
  </g>
</g>`,
        hand_book: `<!-- Lv.3 English Dictionary --><g id="acc_hand_book" transform="translate(75, 96) rotate(15)"><rect x="0" y="0" width="18" height="22" rx="2" fill="#2563eb" stroke="#1d4ed8" stroke-width="1" /><rect x="2" y="2" width="14" height="18" rx="1" fill="#ffffff" /><text x="9" y="14" text-anchor="middle" font-size="8" font-weight="bold" fill="#1e3a8a">EN</text></g>`,
        hand_icecream: `<!-- 🍦 貓爪草莓甜筒: 咬在嘴巴上，冰淇淋滴落地上與吃完重生循環動畫 -->
<g id="acc_hand_icecream">
  <style>
    @keyframes coneMouthChew {
      0%, 100% { transform: translate(57px, 62px) rotate(14deg); }
      50% { transform: translate(57px, 61px) rotate(18deg); }
    }
    @keyframes scoopMeltEat {
      0%, 20% { transform: scale(1); opacity: 1; }
      40% { transform: scale(0.75, 0.65); opacity: 0.95; }
      60% { transform: scale(0.45, 0.35) translateY(4px); opacity: 0.9; }
      75%, 88% { transform: scale(0) translateY(8px); opacity: 0; }
      92% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes creamDropFall1 {
      0%, 18% { transform: translate(58px, 68px) scale(0); opacity: 0; }
      22% { transform: translate(58px, 70px) scale(1); opacity: 1; }
      38% { transform: translate(59px, 120px) scale(0.9, 1.4); opacity: 1; }
      40%, 100% { transform: translate(59px, 120px) scale(1.8, 0.3); opacity: 0; }
    }
    @keyframes creamPuddle1 {
      0%, 36% { transform: translate(59px, 120px) scale(0); opacity: 0; }
      40% { transform: translate(59px, 120px) scale(1); opacity: 0.85; }
      70% { transform: translate(59px, 120px) scale(1.1); opacity: 0.6; }
      85%, 100% { transform: translate(59px, 120px) scale(0.4); opacity: 0; }
    }
  </style>
  <g class="icecream-puddle-anim" style="animation: creamPuddle1 5.5s ease-out infinite;">
    <ellipse cx="0" cy="0" rx="3.8" ry="1.4" fill="#f472b6" opacity="0.85" />
    <circle cx="2.5" cy="-0.5" r="0.7" fill="#fb7185" />
    <circle cx="-2.2" cy="0.3" r="0.6" fill="#fda4af" />
  </g>
  <g class="icecream-drop-anim" style="animation: creamDropFall1 5.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;">
    <path d="M 0,-2.5 C 1.2,-1 1.2,1.5 0,2.5 C -1.2,1.5 -1.2,-1 0,-2.5 Z" fill="#f472b6" />
  </g>
  <g style="animation: coneMouthChew 2.8s ease-in-out infinite;">
    <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.22))">
      <polygon points="-4,2 6,2 1,18" fill="#d97706" stroke="#b45309" stroke-width="0.7" />
      <line x1="-2" y1="2" x2="3" y2="14" stroke="#92400e" stroke-width="0.5" />
      <line x1="4" y1="2" x2="-1" y2="14" stroke="#92400e" stroke-width="0.5" />
      <line x1="-3" y1="6" x2="4.5" y2="6" stroke="#92400e" stroke-width="0.5" />
      <line x1="-1.5" y1="11" x2="3" y2="11" stroke="#92400e" stroke-width="0.5" />
      <g style="transform-origin: 1px 2px; animation: scoopMeltEat 5.5s ease-in-out infinite;">
        <ellipse cx="1" cy="1" rx="6.5" ry="3.2" fill="#f472b6" />
        <circle cx="-2.5" cy="3.5" r="1.5" fill="#f472b6" />
        <circle cx="4" cy="3" r="1.3" fill="#f472b6" />
        <ellipse cx="1" cy="-2.5" rx="5" ry="3.5" fill="#fb7185" />
        <circle cx="1" cy="-6" r="3.2" fill="#fda4af" />
        <circle cx="1" cy="-9" r="1.8" fill="#dc2626" />
        <path d="M 1,-10.5 Q 3,-12.5 4.5,-11" stroke="#15803d" stroke-width="0.7" fill="none" />
        <ellipse cx="-0.8" cy="-4" rx="1.5" ry="0.8" fill="#ffffff" opacity="0.6" />
      </g>
    </g>
  </g>
</g>`,
        hand_wand: `<!-- 🪄 傳奇星月魔法杖: 比照 🪄 emoji 金星魔杖與四散星芒 -->
<g id="acc_hand_wand" transform="translate(76, 90) rotate(22)"><g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"><line x1="0" y1="2" x2="0" y2="30" stroke="#475569" stroke-width="2.8" stroke-linecap="round" /><line x1="0" y1="2" x2="0" y2="10" stroke="#facc15" stroke-width="3" stroke-linecap="round" /><polygon points="0,-9 2.5,-3 8.5,-3 4,1 6,7 0,3.5 -6,7 -4,1 -8.5,-3 -2.5,-3" fill="#facc15" stroke="#ca8a04" stroke-width="0.8" /><polygon points="0,-7 1.8,-2.5 6,-2.5 3,0.5 4.5,5 0,2.5 -4.5,5 -3,0.5 -6,-2.5 -1.8,-2.5" fill="#fef08a" /><circle cx="0" cy="0" r="1.5" fill="#ffffff" /><circle cx="-7" cy="-8" r="1" fill="#facc15" opacity="0.9" /><circle cx="7" cy="-7" r="1.2" fill="#facc15" opacity="0.9" /><circle cx="9" cy="4" r="0.8" fill="#fde047" opacity="0.8" /><circle cx="-6" cy="6" r="0.8" fill="#fde047" opacity="0.8" /></g></g>`,
        hand_boba: `<!-- 🧋 貓爪波霸珍珠奶茶 -->
<g id="acc_hand_boba" transform="translate(36, 88)"><path d="M -5,0 L 5,0 L 4,14 L -4,14 Z" fill="#fde68a" stroke="#d97706" stroke-width="0.8" /><rect x="-6" y="-2" width="12" height="3" rx="1.5" fill="#f472b6" stroke="#db2777" stroke-width="0.6" /><line x1="0" y1="-2" x2="2" y2="-9" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" /><circle cx="-1.5" cy="10" r="1.2" fill="#451a03" /><circle cx="1.5" cy="10.5" r="1.2" fill="#451a03" /><circle cx="-0.5" cy="7.5" r="1.1" fill="#451a03" /><circle cx="2" cy="7" r="1.1" fill="#451a03" /></g>`,
        hand_lollipop: `<!-- 🍭 彩虹旋轉大棒棒糖 -->
<g id="acc_hand_lollipop" transform="translate(35, 87) rotate(-15)"><line x1="0" y1="2" x2="0" y2="20" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" /><circle cx="0" cy="0" r="7" fill="#f43f5e" stroke="#e11d48" stroke-width="0.8" /><path d="M 0,-6 A 6,6 0 0,1 6,0 A 4,4 0 0,1 2,4 A 2,2 0 0,1 0,2" stroke="#facc15" stroke-width="1.5" fill="none" /><path d="M 0,6 A 6,6 0 0,1 -6,0 A 4,4 0 0,1 -2,-4" stroke="#38bdf8" stroke-width="1.5" fill="none" /></g>`,
        hand_teddy: `<!-- 🧸 軟萌泰迪小熊布偶 -->
<g id="acc_hand_teddy" transform="translate(34, 91)"><circle cx="0" cy="4" r="5.5" fill="#b45309" stroke="#78350f" stroke-width="0.7" /><circle cx="0" cy="-2" r="4.2" fill="#b45309" stroke="#78350f" stroke-width="0.7" /><circle cx="-3.5" cy="-5" r="1.6" fill="#b45309" /><circle cx="-3.5" cy="-5" r="0.9" fill="#fde68a" /><circle cx="3.5" cy="-5" r="1.6" fill="#b45309" /><circle cx="3.5" cy="-5" r="0.9" fill="#fde68a" /><ellipse cx="0" cy="-1.5" rx="2" ry="1.4" fill="#fde68a" /><circle cx="0" cy="-2" r="0.7" fill="#451a03" /><circle cx="-1.4" cy="-3" r="0.6" fill="#451a03" /><circle cx="1.4" cy="-3" r="0.6" fill="#451a03" /><circle cx="0" cy="2" r="0.9" fill="#ef4444" /></g>`
      }
    };
    const WARDROBE_CATALOG = {
      head: [
        { id: 'head_none', name: '無飾品', icon: '🚫', desc: '純真自然小貓樣貌', unlockType: 'free', price: 0, reqLevel: 1 },
        { id: 'head_sakura', name: '🌸 櫻花小花飾', icon: '🌸', desc: '【Lv.1 免費】粉嫩櫻花初春氣息', unlockType: 'level', price: 0, reqLevel: 1 },
        { id: 'head_ribbon', name: '🎀 萌萌蝴蝶結', icon: '🎀', desc: '俏皮可愛的大粉紅蝴蝶結', unlockType: 'fish', price: 15, reqLevel: 1 },
        { id: 'head_bunny_hood', name: '🥟 小包子帽帽', icon: '🥟', desc: '雪白圓滾滾包覆小臉蛋，像軟萌小包子一樣超可愛', unlockType: 'fish', price: 25, reqLevel: 1 },
        { id: 'head_rabbit', name: '🐰 萌兔毛絨長耳', icon: '🐰', desc: '軟萌雪白長兔耳，蹦蹦跳跳超可愛', unlockType: 'fish', price: 20, reqLevel: 1 },
        { id: 'head_cap', name: '🧢 活力運動帽', icon: '🧢', desc: '反戴潮流街頭風棒球帽', unlockType: 'fish', price: 30, reqLevel: 2 },
        { id: 'head_flower_tiara', name: '🧚‍♀️ 晶透精靈花冠', icon: '🧚‍♀️', desc: '翠綠藤蔓綴以晨露粉花，宛如森之妖精', unlockType: 'fish', price: 35, reqLevel: 2 },
        { id: 'head_grad', name: '🎓 學霸博士帽', icon: '🎓', desc: '【Lv.3 免費】掌握400字學霸象徵！', unlockType: 'level', price: 0, reqLevel: 3 },
        { id: 'head_cupcake', name: '🧁 草莓奶油蛋糕帽', icon: '🧁', desc: '頭頂甜點小蛋糕與紅櫻桃，甜蜜派對風', unlockType: 'fish', price: 45, reqLevel: 3 },
        { id: 'head_wizard', name: '🧙 魔法巫師帽', icon: '🧙', desc: '蘊藏強大魔力的神秘巫師帽', unlockType: 'fish', price: 60, reqLevel: 3 },
        { id: 'head_ranger', name: '🏹 冒險獵鷹羽毛帽', icon: '🏹', desc: '【Lv.4 免費】750字英勇旅伴專屬勳章！', unlockType: 'level', price: 0, reqLevel: 4 },
        { id: 'head_crown', name: '👑 傳奇璀璨皇冠', icon: '👑', desc: '【Lv.5 免費】1200會考傳奇守護神至高榮耀！', unlockType: 'level', price: 0, reqLevel: 5 }
      ],
      face: [
        { id: 'face_none', name: '無飾品', icon: '🚫', desc: '清秀乾淨的小臉龐', unlockType: 'free', price: 0, reqLevel: 1 },
        { id: 'face_blush', name: '✨ 星光微醺腮紅', icon: '✨', desc: '【Lv.1 免費】臉頰閃爍害羞星芒', unlockType: 'level', price: 0, reqLevel: 1 },
        { id: 'face_strawberry', name: '🍓 俏皮草莓小鼻貼', icon: '🍓', desc: '鼻樑上的粉嫩草莓小創可貼，元氣滿滿', unlockType: 'fish', price: 15, reqLevel: 1 },
        { id: 'face_glasses', name: '👓 知性圓圓眼鏡', icon: '👓', desc: '智慧加倍，背單字超專注！', unlockType: 'fish', price: 25, reqLevel: 2 },
        { id: 'face_star_sparkle', name: '⭐ 星芒閃爍貼紙', icon: '⭐', desc: '雙眼下方點綴耀眼金星，眨眼都在放電', unlockType: 'fish', price: 25, reqLevel: 2 },
        { id: 'face_sunglasses', name: '🕶️ 酷黑潮流墨鏡', icon: '🕶️', desc: '街頭酷帥潮流，回頭率百分百', unlockType: 'fish', price: 40, reqLevel: 3 },
        { id: 'face_masquerade', name: '🎭 華麗金紋面具', icon: '🎭', desc: '紫金神秘假面眼罩，高雅宮廷舞會焦點', unlockType: 'fish', price: 50, reqLevel: 4 }
      ],
      neck: [
        { id: 'neck_none', name: '無飾品', icon: '🚫', desc: '輕便舒適無束縛', unlockType: 'free', price: 0, reqLevel: 1 },
        { id: 'neck_bell', name: '🔔 招財黃金鈴鐺', icon: '🔔', desc: '【Lv.1 免費】走動叮噹作響帶來好運', unlockType: 'level', price: 0, reqLevel: 1 },
        { id: 'neck_strawberry', name: '🍓 草莓甜心項圈', icon: '🍓', desc: '鮮紅項圈墜著紅潤草莓，走動一晃一晃', unlockType: 'fish', price: 20, reqLevel: 1 },
        { id: 'neck_scarf', name: '🧣 暖冬經典圍巾', icon: '🧣', desc: '冬日最溫暖厚實的紅色圍巾', unlockType: 'fish', price: 25, reqLevel: 2 },
        { id: 'neck_lace', name: '🎀 夢幻蕾絲荷葉領', icon: '🎀', desc: '雪白法式荷葉邊滾蕾絲，洋娃娃精緻感', unlockType: 'fish', price: 30, reqLevel: 2 },
        { id: 'neck_bowtie', name: '👔 英倫貴族領結', icon: '👔', desc: '優雅俐落的小紳士風格領結', unlockType: 'fish', price: 35, reqLevel: 3 },
        { id: 'neck_sapphire', name: '💎 星辰藍寶石項圈', icon: '💎', desc: '金鏈鑲嵌深邃璀璨星藍寶石，貴氣非凡', unlockType: 'fish', price: 45, reqLevel: 3 },
        { id: 'neck_medal', name: '🥇 會考榮譽金牌', icon: '🥇', desc: '【Lv.5 免費】征服1200單字最高榮譽勳章！', unlockType: 'level', price: 0, reqLevel: 5 }
      ],
      outfit: [
        { id: 'outfit_none', name: '自然毛皮', icon: '🚫', desc: '柔軟三花貓毛皮與白襪肉球', unlockType: 'free', price: 0, reqLevel: 1 },
        { id: 'outfit_hoodie', name: '🐱 暖萌柴犬連帽衛衣', icon: '🐱', desc: '【Lv.1】溫暖芥末黃連帽T，胸前軟萌貓爪口袋與棉質抽繩', unlockType: 'fish', price: 45, reqLevel: 1 },
        { id: 'outfit_backpack', name: '🎒 探險雙肩包', icon: '🎒', desc: '【Lv.2 免費】背起小書包探索單字世界！', unlockType: 'level', price: 0, reqLevel: 2 },
        { id: 'outfit_overalls', name: '👖 青春丹寧牛仔吊帶褲', icon: '👖', desc: '【Lv.2】紅白條紋T恤搭配水洗牛仔吊帶褲，胸前插著小鉛筆', unlockType: 'fish', price: 60, reqLevel: 2 },
        { id: 'outfit_sailor', name: '⚓ 可愛水手制服', icon: '⚓', desc: '正統日系海軍翻領雙白線，加長A字立體百褶裙與雙白飾線！', unlockType: 'fish', price: 70, reqLevel: 2 },
        { id: 'outfit_kimono', name: '👘 和風櫻花祭浴衣', icon: '👘', desc: '粉櫻和服搭配典雅紫腰帶，浪漫夏日祭典', unlockType: 'fish', price: 65, reqLevel: 2 },
        { id: 'outfit_maid', name: '☕ 萌系經典女僕裝', icon: '☕', desc: '【Lv.2】黑白女僕洋裝搭配雪白荷葉邊圍裙與俏麗紅蝴蝶結', unlockType: 'fish', price: 75, reqLevel: 2 },
        { id: 'outfit_dress', name: '👗 夢幻粉紅蓬蓬裙', icon: '👗', desc: '修身高腰法式公主洋裝，微翹荷葉短袖與垂墜A字蕾絲裙擺！', unlockType: 'fish', price: 80, reqLevel: 3 },
        { id: 'outfit_witch', name: '🧹 萬聖星夜小魔女法袍', icon: '🧹', desc: '【Lv.3】午夜幽邃紫黑星紋魔法長袍，金色新月胸針與繁星金邊', unlockType: 'fish', price: 85, reqLevel: 3 },
        { id: 'outfit_cloak', name: '🧥 英勇冒險披風', icon: '🧥', desc: '【Lv.4 免費】750字英勇旅伴帥氣雙層紅披風！', unlockType: 'level', price: 0, reqLevel: 4 },
        { id: 'outfit_princess', name: '👑 星空璀璨公主裙', icon: '👑', desc: '午夜深藍星河長裙與金星流蘇，至尊公主風', unlockType: 'fish', price: 85, reqLevel: 4 }
      ],
      hand: [
        { id: 'hand_none', name: '雙手空空', icon: '🚫', desc: '隨時準備擊掌或摸摸肉球', unlockType: 'free', price: 0, reqLevel: 1 },
        { id: 'hand_fishbone', name: '🐟 脆脆魚骨點心', icon: '🐟', desc: '現烤出爐的香脆金黃烤魚，熱氣騰騰一口口啃光！', unlockType: 'fish', price: 20, reqLevel: 1 },
        { id: 'hand_boba', name: '🧋 貓爪波霸珍珠奶茶', icon: '🧋', desc: '黑糖厚奶波霸珍珠，手搖杯吸管大口吸', unlockType: 'fish', price: 25, reqLevel: 1 },
        { id: 'hand_icecream', name: '🍦 貓爪草莓甜筒', icon: '🍦', desc: '嘴裡咬著草莓甜筒，冰淇淋滴滴答答吃光光！', unlockType: 'fish', price: 35, reqLevel: 2 },
        { id: 'hand_lollipop', name: '🍭 彩虹旋轉大棒棒糖', icon: '🍭', desc: '七彩螺旋波浪糖，咬一口甜入心坎', unlockType: 'fish', price: 30, reqLevel: 2 },
        { id: 'hand_book', name: '📘 智慧英文字典', icon: '📘', desc: '【Lv.3 免費】隨身攜帶會考必備英文字典！', unlockType: 'level', price: 0, reqLevel: 3 },
        { id: 'hand_teddy', name: '🧸 軟萌泰迪小熊布偶', icon: '🧸', desc: '軟綿綿的棕色泰迪熊，抱在懷裡超安心', unlockType: 'fish', price: 45, reqLevel: 3 },
        { id: 'hand_wand', name: '🪄 傳奇星月魔法杖', icon: '🪄', desc: '【Lv.5 免費】揮動星星法杖，單字通通滿分！', unlockType: 'level', price: 0, reqLevel: 5 }
      ],
      aura: [
        { id: 'aura_none', name: '無特效', icon: '🚫', desc: '回歸純粹的貓咪氛圍', unlockType: 'free', price: 0, reqLevel: 1 },
        { id: 'aura_sparkle', name: '✨ 璀璨星光微芒', icon: '✨', desc: '周圍閃爍璀璨的金色呼吸光芒', unlockType: 'fish', price: 40, reqLevel: 2 },
        { id: 'aura_bubbles', name: '🫧 夢幻彩虹泡泡雨', icon: '🫧', desc: '身旁漂浮折射七彩虹光的晶瑩泡泡', unlockType: 'fish', price: 45, reqLevel: 2 },
        { id: 'aura_sakura', name: '🌸 飛舞落櫻花瓣', icon: '🌸', desc: '浪漫櫻花瓣在身邊翩翩起舞', unlockType: 'fish', price: 50, reqLevel: 3 },
        { id: 'aura_fish', name: '🐟 游動小魚乾群', icon: '🐟', desc: '小魚乾環繞身旁，貓咪的天堂！', unlockType: 'fish', price: 65, reqLevel: 3 },
        { id: 'aura_butterflies', name: '🦋 幻光藍蝶飛舞', icon: '🦋', desc: '發光的魔幻蔚藍彩蝶在身邊環繞起舞', unlockType: 'fish', price: 60, reqLevel: 3 },
        { id: 'aura_wings', name: '🪽 英勇天使羽翼', icon: '🪽', desc: '【Lv.4 免費】雙倍身長星空大天使羽翼，三層次羽毛展翅高飛！', unlockType: 'level', price: 0, reqLevel: 4 },
        { id: 'aura_rainbow', name: '🌈 傳奇幸運彩虹', icon: '🌈', desc: '【Lv.5 免費】1200字會考傳奇守護神七彩光暈！', unlockType: 'level', price: 0, reqLevel: 5 }
      ]
    };
    const ACCESSORY_REACTIONS = {
      head_bunny_hood: "喵嗚～戴上雪白圓滾滾的小包子帽帽！咪咪的臉蛋看起來像剛出蒸籠的白嫩小包子一樣，是不是超可口、超萌呀？🥟🐾💖",
      head_sakura: "喵～耳朵邊夾了小櫻花，有沒有像花仙子一樣漂亮呀？🌸🐾",
      head_ribbon: "喵嗚～大粉紅蝴蝶結！我今天就是全天下最可愛的小貓！🎀💖",
      head_cap: "喵！棒球帽反戴超帥氣，今天背單字我也要全力打出全壘打！⚾🧢",
      head_grad: "喵哈哈～戴上學霸博士帽，1200 單字會考通通交給我吧！🎓✨",
      head_ranger: "呼嚕嚕～戴上冒險獵鷹羽毛帽，我們已經征服 750 個單字囉！英勇旅伴出發！🏹🐾",
      head_wizard: "（揮舞法杖）喵拉哩拉～把易錯單字通通變成小魚乾！🧙‍♀️✨",
      head_crown: "呼嚕嚕～頭戴璀璨皇冠，感謝妳一路陪我進化成 1200 單字傳奇神獸！👑🐾",
      face_blush: "喵...臉紅紅的被妳發現了！因為妳今天背單字好認真嘛～✨",
      face_glasses: "推推眼鏡～看清楚了！forty 真的沒有 u，我都記在腦子裡了！👓📚",
      face_sunglasses: "喵～戴上酷炫墨鏡，本喵就是夜市最拉風的街頭貓霸！🕶️😎",
      neck_bell: "叮噹～叮噹～聽到了嗎？這是小魚乾快要來敲門的聲音喵！🔔",
      neck_scarf: "好暖和喔～戴上紅色圍巾，就算外面吹冷風也能精神滿滿背單字！🧣❤️",
      neck_bowtie: "喵～英倫紳士領結！今天上英文課我有沒有特別有氣質呢？👔✨",
      neck_medal: "第一名金牌！這是我們一起努力征服 1200 單字的榮耀證書喵！🥇🌟",
      outfit_backpack: "喵！背起小探險背包，今天也要去單字森林挖掘好多新寶藏！🎒✨",
      outfit_cloak: "喵嗚～帥氣冒險披風！風吹起來好有大俠風範，我是妳最勇敢的旅伴！🧥⚔️",
      outfit_hoodie: "穿上軟綿綿的柴犬連帽衛衣～胸前的貓爪小口袋可以裝三條小魚乾耶！溫暖又好動喵！🐱💛",
      outfit_overalls: "丹寧牛仔吊帶褲穿好囉！胸前還插著考試專用小鉛筆，活力滿滿～今天一定要背完所有單字喵！👖✏️✨",
      outfit_maid: "主人，歡迎回來！萌系女僕咪咪今天為您準備了酥脆小魚乾與滿分英文筆記喵！☕🐾❤️",
      outfit_sailor: "水手服套裝登場！加長的海軍藍A字百褶裙好飄逸，雙白線條紋超青春，今天模擬考一定能拿滿分喵！⚓💙",
      outfit_dress: "哇～換上修身顯瘦的粉紅公主裙！微翹荷葉袖配上垂墜A字蕾絲裙擺好優雅，咪咪身材看起來超纖細苗條喵！👗✨",
      outfit_witch: "（輕揮魔杖念咒）萬聖星夜小魔女咪咪登場！月牙胸針閃爍光芒，把所有的英文難題通通變不見喵！🧹🌙✨",
      hand_fishbone: "嚼嚼嚼～現烤出爐的香脆金黃烤魚！熱騰騰好美味，背單字更有力氣了！🐟♨️😋",
      hand_book: "抱著英漢小字典，隨時隨地查單字，學霸貓不是叫假的喵！📘🎓",
      hand_icecream: "嘴裡咬著草莓冰淇淋甜筒！滴滴答答好消暑～吃完再來背十個單字喵！🍦🍓",
      hand_wand: "星星魔法杖發光了！點石成金，祝福妳所有的英文考試都順利通過！🪄⭐",
      aura_sparkle: "哇～閃閃發光的金色星芒！咪咪周圍都在發光耶！✨",
      aura_sakura: "喵～花瓣飄飄好浪漫喔，一邊賞花一邊背單字最幸福了～🌸",
      aura_wings: "展開兩倍身長星空大天使羽翼！如夢幻之翼般展翅翱翔，守護著會考全滿分喵！🪽🌟",
      aura_fish: "好多小魚乾在身邊游來游去！天啊～這是貓咪的天堂喵！🐟🐟🐟",
      aura_rainbow: "喵嗚～！七彩祥雲彩虹光芒！我是守護會考的傳奇神獸咪咪！🌈👑",
      head_rabbit: "喵哈哈～戴上萌兔長長耳朵，我有沒有跳得跟小白兔一樣快呀？🐰🐾",
      head_flower_tiara: "呼嚕嚕～晶透的花冠散發著森林清香，咪咪是守護綠意的小仙子喵！🧚‍♀️🌸",
      head_cupcake: "頂著草莓奶油蛋糕帽～甜滋滋的派對氣氛！背單字就像吃點心一樣開心喵！🧁🍓",
      face_strawberry: "臉頰貼了小草莓貼布～俏皮又可愛！背錯單字也不要氣餒，貼一貼就精神百倍喵！🍓✨",
      face_star_sparkle: "閃亮亮的小星星貼紙！每次我眨眨眼，都會發射滿分幸運光波給妳喔！⭐✨",
      face_masquerade: "（輕輕遮臉）猜猜我是誰？我是充滿神秘魔法的假面貓俠喵！🎭✨",
      neck_strawberry: "胸前掛著紅通通的小草莓項圈，走起路來一晃一晃的好可愛喵！🍓❤️",
      neck_lace: "哇～雪白夢幻的蕾絲荷葉領！像洋娃娃一樣精緻高雅，貓貓好喜歡！🎀🤍",
      neck_sapphire: "晶瑩剔透的深藍星辰寶石！閃耀著知性與專注的光芒，會考高分勢在必得喵！💎🌟",
      outfit_kimono: "穿上優雅粉紅和風櫻花祭浴衣～邁著小碎步一起去逛祭典吃烤魚喵！👘🌸",
      outfit_princess: "換上星空璀璨公主裙！午夜藍的裙擺綴滿星辰微光，今晚咪咪就是最美的公主殿下喵！👑✨",
      hand_boba: "吸一口甜甜的珍珠奶茶～波霸珍珠ＱＱ彈彈，背單字更有嚼勁了喵！🧋😋",
      hand_lollipop: "舔一口彩虹旋轉大棒棒糖～甜入心坎！今天也要開開心心拿滿分喵！🍭🌈",
      hand_teddy: "抱著毛茸茸的泰迪小熊布偶～軟綿綿好安心，跟著小熊一起陪妳背單字喵！🧸🤎",
      aura_bubbles: "啵啵啵～身邊漂浮著七彩泡泡雨！輕輕一碰就會化成幸運星光喔！🫧🌈",
      aura_butterflies: "微光的幻蝶在身邊翩翩起舞～好夢幻的魔幻仙境，祝福女孩考試順利過關喵！🦋✨"
    };
    let currentWardrobeTab = 'head';
    let catWardrobe = {
      equipped: {
        head: 'head_none',
        face: 'face_none',
        neck: 'neck_none',
        outfit: 'outfit_none',
        hand: 'hand_none',
        aura: 'aura_none'
      },
      unlocked: [
        'head_none', 'head_sakura',
        'face_none', 'face_blush',
        'neck_none', 'neck_bell',
        'outfit_none', 'hand_none', 'aura_none'
      ]
    };
    function loadCatWardrobe() {
      try {
        const saved = JSON.parse(localStorage.getItem(WARDROBE_STORAGE_KEY) || 'null');
        if (saved && saved.equipped && Array.isArray(saved.unlocked)) {
          catWardrobe = saved;
          if (!catWardrobe.equipped.outfit) catWardrobe.equipped.outfit = 'outfit_none';
          if (!catWardrobe.equipped.hand) catWardrobe.equipped.hand = 'hand_none';
        }
        if (!catWardrobe.unlocked) catWardrobe.unlocked = [];
        let hasRecovered = false;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('wordchecking_account_snapshot_')) {
            try {
              const snap = JSON.parse(localStorage.getItem(k) || '{}');
              const snapUnlocked = snap?.catGamification?.wardrobe?.unlocked;
              if (Array.isArray(snapUnlocked)) {
                snapUnlocked.forEach(id => {
                  if (!catWardrobe.unlocked.includes(id)) {
                    catWardrobe.unlocked.push(id);
                    hasRecovered = true;
                    console.log(`[WardrobeRecovery] 已自快照 ${k} 自動復原裝備:`, id);
                  }
                });
              }
            } catch (err) {}
          }
        }
        if (hasRecovered) {
          localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(catWardrobe));
        }
      } catch (e) {
        console.warn("Wardrobe load error:", e);
      }
      checkLevelUnlocks(false);
    }
    function saveCatWardrobe() {
      try {
        const existingRaw = localStorage.getItem(WARDROBE_STORAGE_KEY);
        if (existingRaw) {
          const existing = JSON.parse(existingRaw);
          if (existing && Array.isArray(existing.unlocked)) {
            existing.unlocked.forEach(id => {
              if (!catWardrobe.unlocked.includes(id)) {
                catWardrobe.unlocked.push(id);
              }
            });
          }
        }
      } catch (e) {}
      localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(catWardrobe));
      triggerAutoSaveToPi();
    }
    function checkLevelUnlocks(notify = true, isDowngrade = false) {
      const totalMastered = calculateTotalMasteredWords();
      const catLevel = getCatLevelInfo(totalMastered).level;
      let newUnlocks = [];
      let relockedItems = [];
      let unequippedItems = [];
      if (!catWardrobe.unlocked) catWardrobe.unlocked = [];
      Object.keys(WARDROBE_CATALOG).forEach(catKey => {
        WARDROBE_CATALOG[catKey].forEach(item => {
          if (item.unlockType === 'level') {
            if (catLevel >= item.reqLevel) {
              if (!catWardrobe.unlocked.includes(item.id)) {
                catWardrobe.unlocked.push(item.id);
                newUnlocks.push(item.name);
              }
            } else if (isDowngrade) {
              const uIdx = catWardrobe.unlocked.indexOf(item.id);
              if (uIdx !== -1) {
                catWardrobe.unlocked.splice(uIdx, 1);
                relockedItems.push(item.name);
              }
              if (catWardrobe.equipped && catWardrobe.equipped[catKey] === item.id) {
                catWardrobe.equipped[catKey] = catKey + '_none';
                unequippedItems.push(item.name);
              }
            }
          }
        });
      });
      if (newUnlocks.length > 0 || relockedItems.length > 0 || unequippedItems.length > 0) {
        saveCatWardrobe();
        renderCatAccessories();
        const wModal = document.getElementById('wardrobeModal');
        if (wModal && !wModal.classList.contains('hidden')) {
          if (typeof renderWardrobeItems === 'function') renderWardrobeItems(currentWardrobeTab);
        }
      }
      if (notify) {
        if (newUnlocks.length > 0) {
          sayCatSpeech(`恭喜升級！衣櫥解鎖了里程碑專屬獎勵：【${newUnlocks.join('、')}】！快去換裝室試穿吧～👗🐾`, "解鎖里程碑新裝");
        } else if (unequippedItems.length > 0 || relockedItems.length > 0) {
          sayCatSpeech(`等級變更為 Lv.${catLevel}，已自動將未解鎖的進階里程碑裝備卸下並鎖定喵～🐾`, "裝備重整");
        }
      }
    }
    function renderCatAccessories() {
      ['mainCat', 'wardrobeCat', 'roamingCat'].forEach(prefix => {
        const auraEl = document.getElementById(prefix + 'AccAura');
        const faceEl = document.getElementById(prefix + 'AccFace');
        const headEl = document.getElementById(prefix + 'AccHead');
        const neckEl = document.getElementById(prefix + 'AccNeck');
        const outfitEl = document.getElementById(prefix + 'AccOutfit');
        const handEl = document.getElementById(prefix + 'AccHand');
        if (auraEl) auraEl.innerHTML = ACCESSORIES_SVG.aura[catWardrobe.equipped.aura] || '';
        if (faceEl) faceEl.innerHTML = ACCESSORIES_SVG.face[catWardrobe.equipped.face] || '';
        if (headEl) headEl.innerHTML = ACCESSORIES_SVG.head[catWardrobe.equipped.head] || '';
        if (neckEl) neckEl.innerHTML = ACCESSORIES_SVG.neck[catWardrobe.equipped.neck] || '';
        if (outfitEl) outfitEl.innerHTML = (ACCESSORIES_SVG.outfit && ACCESSORIES_SVG.outfit[catWardrobe.equipped.outfit]) || '';
        if (handEl) handEl.innerHTML = (ACCESSORIES_SVG.hand && ACCESSORIES_SVG.hand[catWardrobe.equipped.hand]) || '';
      });
      updateWardrobeTags();
    }
    function updateWardrobeTags() {
      const tagsContainer = document.getElementById('wardrobeOutfitTags');
      if (!tagsContainer) return;
      tagsContainer.innerHTML = '';
      const eq = catWardrobe.equipped;
      let count = 0;
      Object.keys(eq).forEach(slot => {
        const id = eq[slot];
        if (id && !id.endsWith('_none')) {
          count++;
          const catalogList = WARDROBE_CATALOG[slot] || [];
          const item = catalogList.find(x => x.id === id);
          if (item) {
            const tag = document.createElement('span');
            tag.className = 'text-[11px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-800';
            tag.innerText = item.name;
            tagsContainer.appendChild(tag);
          }
        }
      });
      if (count === 0) {
        const tag = document.createElement('span');
        tag.className = 'text-[11px] text-slate-400 dark:text-slate-500';
        tag.innerText = '目前穿搭：自然小貓樣貌 🐾';
        tagsContainer.appendChild(tag);
      }
    }
    function handleMascotClick(event) {
    }
    function handleHeadClick(event) {
      if (event) event.stopPropagation();
      petTheCat();
    }
    function handleBellyClick(event) {
      if (event) event.stopPropagation();
      const box = document.getElementById('catAvatarBox');
      if (box) {
        box.classList.remove('cat-hop');
        void box.offsetWidth;
        box.classList.add('cat-hop');
      }
      playCatMeowSound();
      spawnFloatingHeart("🐾");
      sayCatSpeech("呼嚕嚕～搔小肚肚好癢好舒服喔！精神百倍喵～🐾", "搔肚肚");
      gainAffection(3);
    }
    function handleTailClick(event) {
      if (event) event.stopPropagation();
      const tail = document.getElementById('mainCatTail');
      if (tail) {
        tail.classList.remove('tail-wag');
        tail.classList.remove('tail-wag-fast');
        void tail.offsetWidth;
        tail.classList.add('tail-wag-fast');
        setTimeout(() => {
          if (tail) {
            tail.classList.remove('tail-wag-fast');
            tail.classList.add('tail-wag');
          }
        }, 1600);
      }
      playCatMeowSound();
      sayCatSpeech("喵嗚～！尾巴很敏感的啦！不要偷拉尾巴喵～🐾", "被拉尾巴");
    }
    function openFeedGourmetModal() {
      document.getElementById('feedGourmetModal').classList.remove('hidden');
    }
    function closeFeedGourmetModal() {
      document.getElementById('feedGourmetModal').classList.add('hidden');
      if (typeof flushPendingSyncToPi === 'function') flushPendingSyncToPi();
    }
    function feedMimiGourmet(type, cost, affectionGain, extraFever = 0) {
      if (fishCount < cost) {
        alert(`小魚乾不足喔！這道點心需要 ${cost} 條小魚乾，多背背單字賺小魚乾吧喵～🐟`);
        return;
      }
      fishCount -= cost;
      localStorage.setItem(FISH_STORAGE_KEY, fishCount);
      document.getElementById('fishCount').innerText = fishCount;
      const wFish = document.getElementById('wardrobeFishCount');
      if (wFish) wFish.innerText = fishCount;
      playCatMunchSound();
      spawnFloatingHeart("🐟");
      spawnFloatingHeart("💖");
      gainAffection(affectionGain);
      if (extraFever > 0) {
        feverRemainingQuestions += extraFever;
        localStorage.setItem('wordchecking_fever_remaining_v1', feverRemainingQuestions);
        updateFeverBadge();
      }
      touchMimiInteraction();
      if (type === 'snack') {
        sayCatSpeech("嚼嚼嚼～脆脆小魚乾真好吃！親密度 +5% 喵～🐟", "吃小魚乾");
      } else if (type === 'sashimi') {
        spawnFloatingHeart("🍣");
        sayCatSpeech("哇！特級鮭魚生魚片好鮮甜多汁喔！咪咪太幸福了～親密度 +30% 💖！", "大啖鮭魚");
      } else if (type === 'banquet') {
        spawnFloatingHeart("👑");
        spawnFloatingHeart("🍱");
        sayCatSpeech("天啊～！是頂級滿漢海鮮全席！親密度直接補滿 100%！加贈 10 題狂熱雙倍小魚乾時段！🔥🐟", "海鮮盛宴");
      }
      closeFeedGourmetModal();
      triggerAutoSaveToPi();
    }
    function closeGachaModal() {
      const modal = document.getElementById('gachaResultModal');
      if (modal) modal.classList.add('hidden');
      if (typeof flushPendingSyncToPi === 'function') flushPendingSyncToPi();
    }
    function openGachaModal(data) {
      const modal = document.getElementById('gachaResultModal');
      if (!modal) return;
      const iconEl = document.getElementById('gachaModalIcon');
      const titleEl = document.getElementById('gachaModalTitle');
      const subEl = document.getElementById('gachaModalSubtitle');
      const bodyEl = document.getElementById('gachaModalBody');
      const actionsEl = document.getElementById('gachaModalActions');
      if (data.status === 'NOT_ENOUGH_FISH') {
        iconEl.innerHTML = '🐟';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-400/20';
        titleEl.innerText = '小魚乾還不夠開盲盒喵！';
        titleEl.className = 'font-black text-lg text-rose-600 dark:text-rose-400 pt-2';
        subEl.innerText = '每次抽取幸運盲盒需要 20 條小魚乾';
        bodyEl.innerHTML = `
          <div class="text-sm text-slate-700 dark:text-slate-200 space-y-2">
            <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
              <span class="text-xs text-slate-500 dark:text-slate-400">目前擁有小魚乾：</span>
              <span class="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>🐟</span> <span>${data.currentFish}</span> 條
              </span>
            </div>
            <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
              <span class="text-xs text-slate-500 dark:text-slate-400">還缺少小魚乾：</span>
              <span class="font-black text-rose-600 dark:text-rose-400">
                ${data.cost - data.currentFish} 條
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
              🐾 <b>賺魚乾秘笈</b>：只要背單字或做測驗，每答對一題就能獲得 1 條小魚乾（若觸發狂熱雙倍時段可得 2 條）！累積滿 20 條就能來抽驚喜大獎囉！
            </p>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal()" class="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition cursor-pointer">
            我知道了喵！去背單字賺魚乾
          </button>
        `;
      } else if (data.status === 'SUCCESS') {
        iconEl.innerHTML = '🎁';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-400/20 cat-hop';
        titleEl.innerText = '🎉 幸運盲盒大驚喜！';
        titleEl.className = 'font-black text-lg text-amber-600 dark:text-amber-400 pt-2';
        subEl.innerText = `成功消耗 20 條小魚乾（剩餘：${data.remainingFish} 條）`;
        const slotMap = {
          head: '🎀 頭飾帽子',
          face: '👓 面部裝飾',
          neck: '🧣 頸部項鍊',
          outfit: '👗 全身服裝',
          hand: '🐾 手持道具',
          aura: '✨ 特效光環'
        };
        const slotText = slotMap[data.item.slot] || '造型配件';
        bodyEl.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-amber-200 dark:border-slate-600 shadow-xs">
              <div class="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-3xl">
                ${data.item.icon}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                    ${slotText}
                  </span>
                </div>
                <h4 class="font-black text-base text-slate-900 dark:text-white truncate pt-0.5">
                  ${data.item.name}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                  ${data.item.desc}
                </p>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold text-center flex items-center justify-center gap-1.5">
              <span>✨</span>
              <span>已自動為咪咪穿戴上新造型！外觀已立即更新！</span>
            </div>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal(); openWardrobeModal();" class="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-xs cursor-pointer">
            👗 前往換裝室查看
          </button>
          <button onclick="closeGachaModal()" class="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition cursor-pointer">
            太棒了！
          </button>
        `;
      } else if (data.status === 'CURRENT_TIER_MAXED') {
        iconEl.innerHTML = '⭐';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-400/20 cat-hop';
        titleEl.innerText = `🎉 Lv.${data.catLevel} 造型全數解鎖！`;
        titleEl.className = 'font-black text-lg text-rose-500 dark:text-rose-400 pt-2';
        subEl.innerText = `成功消耗 20 條小魚乾（剩餘：${data.remainingFish} 條）`;
        bodyEl.innerHTML = `
          <div class="text-sm text-slate-700 dark:text-slate-200 space-y-2.5">
            <div class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs leading-relaxed text-rose-900 dark:text-rose-200">
              🐾 <b>太厲害了！</b>目前貓咪 Lv.${data.catLevel} 可抽取的造型已經被妳全部收集完畢囉！
              <br>只要多背單字、手寫拼字與測驗，將貓咪升級到 <b>Lv.${data.nextReqLevel}</b>，就能開啟下一階段的華麗盲盒抽獎池喵！✨
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">🔥</span> 狂熱雙倍時段加油
                </span>
                <span class="font-black text-amber-600 dark:text-amber-400">+10 題雙倍魚乾</span>
              </div>
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-rose-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">💖</span> 咪咪親密度獎勵
                </span>
                <span class="font-black text-rose-500">+30% 親密度</span>
              </div>
            </div>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal()" class="w-full py-2.5 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white font-bold rounded-xl text-sm transition shadow-xs cursor-pointer">
            好棒！繼續背單字升級到 Lv.${data.nextReqLevel} 🐾
          </button>
        `;
      } else if (data.status === 'ALL_UNLOCKED') {
        iconEl.innerHTML = '👑';
        iconEl.className = 'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20';
        titleEl.innerText = '🏆 全圖鑑收藏大師！';
        titleEl.className = 'font-black text-lg text-purple-600 dark:text-purple-400 pt-2';
        subEl.innerText = `成功消耗 20 條小魚乾（剩餘：${data.remainingFish} 條）`;
        bodyEl.innerHTML = `
          <div class="text-sm text-slate-700 dark:text-slate-200 space-y-2.5">
            <div class="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs leading-relaxed text-purple-900 dark:text-purple-200">
              🌟 <b>太震撼了！</b>衣櫥中的所有配件與服裝已經被妳全部收集齊全囉！目前沒有尚未解鎖的衣物了！
            </div>
            <div class="space-y-1.5">
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">🔥</span> 狂熱雙倍時段加碼
                </span>
                <span class="font-black text-amber-600 dark:text-amber-400">+15 題雙倍魚乾</span>
              </div>
              <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-slate-600">
                <span class="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span class="text-base">💖</span> 咪咪親密度爆棚
                </span>
                <span class="font-black text-rose-500">+50% 親密度</span>
              </div>
            </div>
          </div>
        `;
        actionsEl.innerHTML = `
          <button onclick="closeGachaModal()" class="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-xs cursor-pointer">
            收下傳奇大獎喵！🔥
          </button>
        `;
      }
      modal.classList.remove('hidden');
    }
    function playLuckyGacha() {
      const GACHA_COST = 20;
      if (fishCount < GACHA_COST) {
        openGachaModal({
          status: 'NOT_ENOUGH_FISH',
          currentFish: fishCount,
          cost: GACHA_COST
        });
        return;
      }
      const catLevel = (typeof currentCatLevel !== 'undefined') ? currentCatLevel : 1;
      let candidates = [];
      let allLockedItems = [];
      Object.keys(WARDROBE_CATALOG).forEach(catKey => {
        WARDROBE_CATALOG[catKey].forEach(item => {
          if (!catWardrobe.unlocked.includes(item.id)) {
            allLockedItems.push(item);
            if (catLevel >= (item.reqLevel || 1)) {
              candidates.push({ slot: catKey, ...item });
            }
          }
        });
      });
      fishCount -= GACHA_COST;
      localStorage.setItem(FISH_STORAGE_KEY, fishCount);
      document.getElementById('fishCount').innerText = fishCount;
      const wFish = document.getElementById('wardrobeFishCount');
      if (wFish) wFish.innerText = fishCount;
      playCatCheerSound();
      spawnFloatingHeart("🎁");
      spawnFloatingHeart("✨");
      if (candidates.length > 0) {
        const prize = candidates[Math.floor(Math.random() * candidates.length)];
        catWardrobe.unlocked.push(prize.id);
        catWardrobe.equipped[prize.slot] = prize.id;
        saveCatWardrobe();
        renderCatAccessories();
        sayCatSpeech(`🎁 哇！幸運盲盒大驚喜！成功開出【${prize.name}】並已自動換上！太美了喵～✨🐾`, "開箱大獎");
        openGachaModal({
          status: 'SUCCESS',
          item: prize,
          remainingFish: fishCount
        });
      } else if (allLockedItems.length > 0) {
        const nextReqLevel = Math.min(...allLockedItems.map(it => it.reqLevel || 1));
        feverRemainingQuestions += 10;
        localStorage.setItem('wordchecking_fever_remaining_v1', feverRemainingQuestions);
        updateFeverBadge();
        gainAffection(30);
        sayCatSpeech(`🎁 太厲害了！Lv.${catLevel} 可抽造型已全數收集！努力背單字升到 Lv.${nextReqLevel} 就能解鎖更高階抽獎池喵！🐾🔥`, "分級集齊");
        openGachaModal({
          status: 'CURRENT_TIER_MAXED',
          catLevel: catLevel,
          nextReqLevel: nextReqLevel,
          remainingFish: fishCount
        });
      } else {
        feverRemainingQuestions += 15;
        localStorage.setItem('wordchecking_fever_remaining_v1', feverRemainingQuestions);
        updateFeverBadge();
        gainAffection(50);
        sayCatSpeech(`🎁 太震撼了！全圖鑑 43 款造型全部集齊！盲盒獎勵轉化為「15 題狂熱雙倍時段」與 +50% 親密度喵！🔥✨`, "全造型傳奇");
        openGachaModal({
          status: 'ALL_UNLOCKED',
          remainingFish: fishCount
        });
      }
      triggerAutoSaveToPi();
    }
    function openWardrobeModal() {
      checkLevelUnlocks(false);
      document.getElementById('wardrobeFishCount').innerText = fishCount;
      document.getElementById('wardrobeModal').classList.remove('hidden');
      renderCatAccessories();
      switchWardrobeTab(currentWardrobeTab);
      playCatMeowSound();
    }
    function closeWardrobeModal() {
      document.getElementById('wardrobeModal').classList.add('hidden');
      if (typeof flushPendingSyncToPi === 'function') flushPendingSyncToPi();
    }
    function switchWardrobeTab(tabKey) {
      currentWardrobeTab = tabKey;
      ['head', 'face', 'neck', 'outfit', 'hand', 'aura'].forEach(k => {
        const btn = document.getElementById('tabBtn_' + k);
        if (btn) {
          if (k === tabKey) {
            btn.className = 'wardrobe-tab-btn flex-1 py-1.5 px-2 rounded-xl transition text-center cursor-pointer whitespace-nowrap bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-300 shadow-2xs font-black';
          } else {
            btn.className = 'wardrobe-tab-btn flex-1 py-1.5 px-2 rounded-xl transition text-center cursor-pointer whitespace-nowrap text-slate-600 dark:text-slate-300 hover:text-slate-900 font-medium';
          }
        }
      });
      renderWardrobeItems(tabKey);
    }
    function renderWardrobeItems(tabKey) {
      const grid = document.getElementById('wardrobeItemsGrid');
      if (!grid) return;
      grid.innerHTML = '';
      const items = WARDROBE_CATALOG[tabKey] || [];
      const equippedId = catWardrobe.equipped[tabKey] || (tabKey + '_none');
      items.forEach(item => {
        const isEquipped = equippedId === item.id;
        const isUnlocked = catWardrobe.unlocked.includes(item.id);
        const card = document.createElement('div');
        card.className = `p-3 rounded-2xl border transition relative flex flex-col justify-between ${
          isEquipped
            ? 'bg-pink-50/90 dark:bg-pink-950/40 border-pink-400 dark:border-pink-600 shadow-xs'
            : isUnlocked
            ? 'bg-white dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 hover:border-pink-300'
            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-80'
        }`;
        let actionBtnHtml = '';
        if (isEquipped) {
          actionBtnHtml = `
            <button onclick="equipAccessory('${tabKey}', '${item.id}')" class="w-full mt-2 py-1 px-2 text-xs font-black rounded-xl bg-pink-500 text-white shadow-2xs hover:bg-pink-600 transition flex items-center justify-center gap-1 cursor-pointer">
              <span>✔</span> 穿戴中 (卸下)
            </button>`;
        } else if (isUnlocked) {
          actionBtnHtml = `
            <button onclick="equipAccessory('${tabKey}', '${item.id}')" class="w-full mt-2 py-1 px-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-pink-100 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 hover:text-pink-600 transition flex items-center justify-center cursor-pointer">
              穿戴造型
            </button>`;
        } else {
          if (item.unlockType === 'level') {
            actionBtnHtml = `
              <div class="w-full mt-2 py-1 px-2 text-[11px] font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1">
                <span>🔒</span> Lv.${item.reqLevel} 里程碑解鎖
              </div>`;
          } else if (item.unlockType === 'fish') {
            const catLvl = (typeof currentCatLevel !== 'undefined') ? currentCatLevel : 1;
            const isLevelLocked = (catLvl < (item.reqLevel || 1));
            const canAfford = fishCount >= item.price;
            if (isLevelLocked) {
              actionBtnHtml = `
                <div class="w-full mt-2 py-1 px-2 text-[11px] font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 text-center flex items-center justify-center gap-1" title="需先升級至 Lv.${item.reqLevel} 才能在商店兌換或於盲盒抽取">
                  <span>🔒</span> Lv.${item.reqLevel} 解鎖 (${item.price}魚)
                </div>`;
            } else {
              actionBtnHtml = `
                <button onclick="unlockAccessoryWithFish('${tabKey}', '${item.id}', ${item.price})" class="w-full mt-2 py-1 px-2 text-xs font-bold rounded-xl ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                } transition flex items-center justify-center gap-1" ${canAfford ? '' : 'disabled'}>
                  <span>🐟</span> 兌換 (${item.price}魚)
                </button>`;
            }
          }
        }
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between">
              <span class="text-2xl">${item.icon}</span>
              ${isEquipped ? '<span class="text-[10px] px-2 py-0.2 rounded-full bg-pink-500 text-white font-black">已裝備</span>' : ''}
              ${!isUnlocked && item.unlockType === 'fish' ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold dark:bg-amber-950 dark:text-amber-300">🐟 ${item.price}</span>` : ''}
              ${!isUnlocked && item.unlockType === 'level' ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold dark:bg-purple-950 dark:text-purple-300">Lv.${item.reqLevel}</span>` : ''}
            </div>
            <div class="font-bold text-xs text-slate-800 dark:text-white mt-1.5">${item.name}</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">${item.desc}</div>
          </div>
          ${actionBtnHtml}
        `;
        grid.appendChild(card);
      });
    }
    function equipAccessory(category, itemId) {
      const isAlreadyEquipped = catWardrobe.equipped[category] === itemId;
      if (isAlreadyEquipped && itemId !== (category + '_none')) {
        catWardrobe.equipped[category] = category + '_none';
        sayCatSpeech("喵～脫下飾品，回歸純真自然的可愛小貓樣貌！🐾", "輕鬆換裝");
        document.getElementById('wardrobeCatSpeech').innerText = "喵～脫下飾品，清清爽爽好舒服！🐾";
      } else {
        catWardrobe.equipped[category] = itemId;
        playCatMeowSound();
        spawnFloatingHeart("✨");
        const reaction = ACCESSORY_REACTIONS[itemId] || "喵～這套造型好漂亮喔！謝謝主人幫我打扮～💖";
        sayCatSpeech(reaction, "開心換裝");
        document.getElementById('wardrobeCatSpeech').innerText = reaction;
      }
      saveCatWardrobe();
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
    }
    function unlockAccessoryWithFish(category, itemId, price) {
      const catLvl = (typeof currentCatLevel !== 'undefined') ? currentCatLevel : 1;
      const catalogList = WARDROBE_CATALOG[category] || [];
      const item = catalogList.find(x => x.id === itemId);
      if (item && catLvl < (item.reqLevel || 1)) {
        alert(`這件造型需要貓咪達到 Lv.${item.reqLevel} 才能購買或於盲盒抽取喔！快去背單字升級吧喵～🐾`);
        return;
      }
      if (fishCount < price) {
        alert(`小魚乾不足喔！需要 ${price} 條小魚乾，多背背單字做測驗就能獲得囉喵～🐟`);
        return;
      }
      fishCount -= price;
      localStorage.setItem(FISH_STORAGE_KEY, fishCount);
      document.getElementById('fishCount').innerText = fishCount;
      document.getElementById('wardrobeFishCount').innerText = fishCount;
      if (!catWardrobe.unlocked.includes(itemId)) {
        catWardrobe.unlocked.push(itemId);
      }
      catWardrobe.equipped[category] = itemId;
      saveCatWardrobe();
      playCatCheerSound();
      spawnFloatingHeart("💖");
      spawnFloatingHeart("🐟");
      const reaction = ACCESSORY_REACTIONS[itemId] || "哇！太棒了～新衣服好適合咪咪喔！💖";
      sayCatSpeech(`消耗 ${price} 條魚乾兌換造型！${reaction}`, "開箱新衣服");
      document.getElementById('wardrobeCatSpeech').innerText = reaction;
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
    }
    function randomizeCatOutfit() {
      ['head', 'face', 'neck', 'outfit', 'hand', 'aura'].forEach(catKey => {
        const items = (WARDROBE_CATALOG[catKey] || []).filter(item => catWardrobe.unlocked.includes(item.id));
        if (items.length > 0) {
          const picked = items[Math.floor(Math.random() * items.length)];
          catWardrobe.equipped[catKey] = picked.id;
        }
      });
      playCatMeowSound();
      spawnFloatingHeart("🎲");
      const speech = "喵嗚～今天的全身隨機穿搭真特別！妳覺得我有沒有變更漂亮呢？✨🐾";
      sayCatSpeech(speech, "隨機打扮");
      document.getElementById('wardrobeCatSpeech').innerText = speech;
      saveCatWardrobe();
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
    }
    function resetCatOutfit() {
      catWardrobe.equipped = {
        head: 'head_none',
        face: 'face_none',
        neck: 'neck_none',
        outfit: 'outfit_none',
        hand: 'hand_none',
        aura: 'aura_none'
      };
      saveCatWardrobe();
      renderCatAccessories();
      renderWardrobeItems(currentWardrobeTab);
      sayCatSpeech("喵～所有衣服飾品都收進衣櫥囉！素顏小貓最純真可愛了對不對？🐾", "素顏小貓");
      document.getElementById('wardrobeCatSpeech').innerText = "喵～所有衣服飾品都收好囉！素顏小貓也超可愛對不對？🐾";
    }
    loadCatWardrobe();
    renderCatAccessories();