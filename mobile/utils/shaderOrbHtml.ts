import type { AiPersonality } from './aiPersonalities';
import { PERSONALITY_ORB_COLORS } from '../constants/personalityOrbPalettes';
import { ORB_CREATE_ORB_SOURCE } from './orbCreateOrbSource';

export type ShaderOrbConfig = {
  colors: [string, string];
  duration: number;
  blobScale: number;
  flow: number;
  turbulence: number;
  shift: number;
  balance: number;
  chroma: number;
  contrast: number;
  rim: number;
  specular: number;
  inner: number;
  wobble: number;
  iridescence: number;
  shading: number;
  refraction: number;
  lightX: number;
  lightY: number;
  aberration: number;
  grain: number;
  softness: number;
  glow: number;
};

export const DEFAULT_SHADER_ORB_CONFIG: ShaderOrbConfig = {
  colors: ['#bd8af0', '#bae6fd'],
  duration: 7,
  blobScale: 3,
  flow: 0.3,
  turbulence: 0.6,
  shift: 0.23,
  balance: 0.5,
  chroma: 1,
  contrast: 1,
  rim: 1.3,
  specular: 0.2,
  inner: 0.38,
  wobble: 0,
  iridescence: 0,
  shading: 0.05,
  refraction: 0.25,
  lightX: -0.6,
  lightY: -1,
  aberration: 0.8,
  grain: 0.6,
  softness: 0.005,
  glow: 0,
};

export function getShaderOrbConfigForPersonality(
  personality: AiPersonality,
): ShaderOrbConfig {
  const { primary, secondary } = PERSONALITY_ORB_COLORS[personality];
  return {
    ...DEFAULT_SHADER_ORB_CONFIG,
    colors: [primary, secondary],
  };
}

function orbBootstrapScript(configJson: string, size: number): string {
  return `
(function () {
  window.__ORB_EMBED__ = 'rn';
  window.__ORB_PIXEL_SIZE__ = ${size};

  function postOrb(payload) {
    try {
      var msg = JSON.stringify(payload);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      }
    } catch (e) {}
  }

  var _log = console.log.bind(console);
  var _warn = console.warn.bind(console);
  var _error = console.error.bind(console);
  console.log = function () {
    _log.apply(console, arguments);
    postOrb({ type: 'console', level: 'log', msg: Array.prototype.slice.call(arguments).join(' ') });
  };
  console.warn = function () {
    _warn.apply(console, arguments);
    postOrb({ type: 'console', level: 'warn', msg: Array.prototype.slice.call(arguments).join(' ') });
  };
  console.error = function () {
    _error.apply(console, arguments);
    postOrb({ type: 'console', level: 'error', msg: Array.prototype.slice.call(arguments).join(' ') });
  };

  window.onerror = function (msg, src, line, col, err) {
    postOrb({
      type: 'error',
      msg: String(msg),
      src: src || '',
      line: line || 0,
      col: col || 0,
      stack: err && err.stack ? String(err.stack) : '',
    });
  };

  postOrb({
    type: 'boot',
    pixelSize: ${size},
    dpr: window.devicePixelRatio || 1,
    webgl2Probe: (function () {
      try {
        var c = document.createElement('canvas');
        return !!c.getContext('webgl2');
      } catch (e) {
        return false;
      }
    })(),
  });

  var orbConfig = ${configJson};
  var container = document.querySelector('.orb');

  try {
    if (typeof createOrb !== 'function') {
      throw new Error('createOrb is not defined — orb script failed to parse');
    }
    if (!container) {
      throw new Error('orb container (.orb) not found');
    }

    var orb = createOrb(container, orbConfig);
    var canvas = container.querySelector('canvas');
    postOrb({
      type: 'init',
      ok: true,
      supported: !!(orb && orb.supported),
      webgl: !!(orb && orb.supported),
      fallback: !(orb && orb.supported),
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0,
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
    });
  } catch (e) {
    postOrb({
      type: 'catch',
      ok: false,
      msg: e && e.message ? e.message : String(e),
      stack: e && e.stack ? String(e.stack) : '',
    });
  }
})();
`;
}

export function buildShaderOrbHtml(config: ShaderOrbConfig, size: number): string {
  const configJson = JSON.stringify(config);
  const showFace = size >= 88;
  const eye = Math.max(4, Math.round(size * 0.078));
  const eyeGap = Math.round(size * 0.155);
  const smileW = Math.round(size * 0.24);
  const smileH = Math.round(size * 0.11);
  const smileTop = Math.round(size * 0.55);
  const cheek = Math.max(6, Math.round(size * 0.09));
  const faceCss = showFace
    ? `
  .face {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }
  .eye {
    position: absolute;
    top: 37%;
    width: ${eye}px;
    height: ${eye}px;
    border-radius: 50%;
    background: rgba(28, 20, 48, 0.78);
    box-shadow: 0 ${Math.max(1, Math.round(size * 0.008))}px 0 rgba(255,255,255,0.25) inset;
  }
  .eye.left { left: calc(50% - ${eyeGap}px - ${eye / 2}px); animation: blink 5.4s ease-in-out infinite; }
  .eye.right { left: calc(50% + ${eyeGap}px - ${eye / 2}px); animation: blink 5.4s ease-in-out 0.12s infinite; }
  .cheek {
    position: absolute;
    top: 48%;
    width: ${cheek}px;
    height: ${Math.round(cheek * 0.62)}px;
    border-radius: 50%;
    background: rgba(244, 114, 182, 0.28);
  }
  .cheek.left { left: calc(50% - ${eyeGap + cheek}px); }
  .cheek.right { left: calc(50% + ${eyeGap}px); }
  .smile {
    position: absolute;
    top: ${smileTop}px;
    left: 50%;
    width: ${smileW}px;
    height: ${smileH}px;
    margin-left: -${Math.round(smileW / 2)}px;
    border-bottom: ${Math.max(2, Math.round(size * 0.03))}px solid rgba(28, 20, 48, 0.68);
    border-radius: 0 0 80% 80%;
    transform-origin: 50% 20%;
    animation: smileBob 3.6s ease-in-out infinite;
  }
  @keyframes blink {
    0%, 86%, 100% { transform: scaleY(1); }
    90% { transform: scaleY(0.08); }
    93% { transform: scaleY(1); }
  }
  @keyframes smileBob {
    0%, 100% { transform: translateY(0) scaleX(1); }
    50% { transform: translateY(${Math.max(1, Math.round(size * 0.012))}px) scaleX(1.06); }
  }`
    : '';
  const faceMarkup = showFace
    ? `<div class="face" aria-hidden="true"><span class="eye left"></span><span class="eye right"></span><span class="cheek left"></span><span class="cheek right"></span><span class="smile"></span></div>`
    : '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: ${size}px;
    height: ${size}px;
    overflow: hidden;
    background: transparent;
  }
  .orb {
    position: relative;
    width: ${size}px;
    height: ${size}px;
    max-width: 100%;
    aspect-ratio: 1;
  }
  ${faceCss}
</style>
</head>
<body>
<div class="orb">${faceMarkup}</div>
<script>
${ORB_CREATE_ORB_SOURCE}
</script>
<script>
${orbBootstrapScript(configJson, size)}
</script>
</body>
</html>`;
}
