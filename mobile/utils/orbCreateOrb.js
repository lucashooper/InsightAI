var createOrb = function createOrb(container, config) {

  var cfg = {};

  var TAU = Math.PI * 2;

  /* Fullscreen triangle straight from gl_VertexID — no vertex buffer at all

     (WebGL2 only). Covers the viewport with 3 vertices. */

  var VERT = `#version 300 es

void main() {

  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));

  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);

}`;

  var FRAG = `#version 300 es

precision highp float;

precision highp int;      // the hash needs full 32-bit ints; mediump would break it

uniform vec2  uRes;

uniform float uPhase;     // 0..TAU, wraps exactly once per loop

uniform vec3  uLab[4];    // palette stops, already in OkLab

uniform float uCount;

uniform float uScaleN;    // noise frequency

uniform float uFlow;      // how far the flow field carries the field per loop

uniform float uTurb;      // strength of the second, nested warp

uniform float uWobble;    // silhouette deformation

uniform float uIrid;      // fresnel-driven hue rotation

uniform float uShift;     // palette shift

uniform float uBalance;   // colour dominance exponent

uniform float uChroma;    // hue ripple amount

uniform float uContrast;  // lightness contrast around mid

uniform float uSoft;

uniform float uGlow;

uniform float uShading;

uniform float uSpec;

uniform float uRim;

uniform float uRefract;

uniform float uInner;     // internal scatter (fake subsurface)

uniform float uAberr;     // rim dispersion

uniform float uGrain;

uniform vec3  uLight;

out vec4 fragColor;

const float TAU = 6.28318530718;

const float RAD = 0.86;             // sphere radius in uv units, rest is glow room

const float RMAX = 1.0 / RAD;       // radius reached at the nearest canvas edge

/* Integer hash built from the MurmurHash3 finalizer, which Austin Appleby

   placed in the public domain. Exact at any lattice coordinate, so unlike a

   fract(sin(...)) hash it never bands or repeats as coordinates grow — which

   matters for the grain, whose input runs into the thousands. */

uint hashU(uint x) {

  x ^= x >> 16; x *= 0x85EBCA6Bu;

  x ^= x >> 13; x *= 0xC2B2AE35u;

  x ^= x >> 16;

  return x;

}

uint hashU2(uvec2 p) { return hashU(p.x * 0x9E3779B9u ^ hashU(p.y)); }

uint hashU3(uvec3 p) { return hashU(p.x * 0x9E3779B9u ^ hashU(p.y) ^ hashU(p.z) * 0x27D4EB2Fu); }

float rand2(ivec2 p) { return float(hashU2(uvec2(p + 4096)) >> 8) / 16777216.0; }

float rand3(ivec3 p) { return float(hashU3(uvec3(p + 4096)) >> 8) / 16777216.0; }

// Value noise, smoothstep-interpolated. Four hashes per octave.

float vnoise(vec2 p) {

  ivec2 i = ivec2(floor(p));

  vec2 f = fract(p);

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(mix(rand2(i),                 rand2(i + ivec2(1, 0)), u.x),

             mix(rand2(i + ivec2(0, 1)),   rand2(i + ivec2(1, 1)), u.x), u.y);

}

float fbm(vec2 p) {

  float s = 0.0, a = 0.5;

  for (int k = 0; k < 3; k++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }

  return s / 0.875;

}

/* The flow field is where all the motion lives. Every point walks a circle

   whose angle advances by exactly TAU over one loop, so the displacement

   returns to its start and the loop is seamless by construction rather than by

   a trick specific to one noise type. Neighbouring points start at different

   angles, which is what reads as swirling instead of pulsing. */

vec2 flowField(vec2 p) {

  float ang = TAU * vnoise(p + 11.3) + uPhase;

  float mag = 0.35 + 0.65 * vnoise(p + 27.9);

  return vec2(cos(ang), sin(ang)) * mag;

}

/* Fresnel-driven hue rotation in the OkLab a/b plane — thin-film sheen.

   The rotation runs counter-clockwise (negative angle): for most palettes that

   sends the rim toward the violet/blue side, which reads as a soap-bubble

   sheen. The clockwise direction pushed pinks and magentas into orange, which

   read as dirt rather than light. */

vec3 iridesce(vec3 lab, float f) {

  float a = uIrid * f * -2.2;

  float c = cos(a), s = sin(a);

  return vec3(lab.x, c * lab.y - s * lab.z, s * lab.y + c * lab.z);

}

vec3 labRamp(float x) {

  float xx = clamp(x, 0.0, 1.0) * (uCount - 1.0);

  vec3 c = mix(uLab[0], uLab[1], clamp(xx, 0.0, 1.0));

  c = mix(c, uLab[2], clamp(xx - 1.0, 0.0, 1.0));

  c = mix(c, uLab[3], clamp(xx - 2.0, 0.0, 1.0));

  return c;

}

/* Palette in OkLab: perceptually even lightness, no muddy midpoint, and the

   picked hex reproduces exactly at its own stop. Hue ripple is a rotation in

   the a/b plane, i.e. a real hue shimmer rather than an RGB nudge. */

vec3 paletteLab(float t) {

  float x = pow(clamp(0.5 + 0.5 * cos(TAU * t), 0.0, 1.0), uBalance);

  vec3 lab = labRamp(x);

  float ang = TAU * (t * 2.0 + 0.123);

  float amp = 0.17 * uChroma * length(lab.yz);

  lab.yz += amp * vec2(sin(ang), cos(ang * 1.37 + 1.1));

  /* Cap the ripple to roughly the sRGB chroma ceiling. Scaling a/b keeps the

     hue angle; letting it overshoot and clamping negative RGB later instead

     posterises into flat black and magenta patches. */

  float ch = length(lab.yz);

  if (ch > 0.33) lab.yz *= 0.33 / ch;

  lab.x = clamp(0.5 + (lab.x - 0.5) * uContrast, 0.0, 1.0);

  return lab;

}

/* OkLab transform matrices as published by Björn Ottosson (reference

   implementation released into the public domain / MIT). Colour-space

   constants, the same kind of thing as the sRGB matrices. */

vec3 oklabToLinear(vec3 c) {

  float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;

  float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;

  float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;

  vec3 lms = vec3(l_ * l_ * l_, m_ * m_ * m_, s_ * s_ * s_);

  return mat3( 4.0767416621, -1.2684380046, -0.0041960863,

              -3.3077115913,  2.6097574011, -0.7034186147,

               0.2309699292, -0.3413193965,  1.7076147010) * lms;

}

vec3 linearToSrgb(vec3 c) {

  c = clamp(c, 0.0, 1.0);

  vec3 lo = c * 12.92;

  vec3 hi = 1.055 * pow(max(c, 1e-5), vec3(1.0 / 2.4)) - 0.055;

  return mix(lo, hi, step(0.0031308, c));

}

void main() {

  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);

  uv /= RAD;

  /* Silhouette wobble. Integer harmonics in the angle keep it continuous around

     the circle, integer multiples of the phase keep it periodic in time. Faded

     in with radius so the rim deforms like a liquid drop while the core stays

     put — that also avoids atan()'s singularity at the centre. */

  if (uWobble > 0.0) {

    float r0 = length(uv);

    float th = atan(uv.y, uv.x + 1e-6);

    float wob = 0.60 * sin(3.0 * th + uPhase)

              + 0.40 * sin(5.0 * th - 2.0 * uPhase)

              + 0.25 * sin(7.0 * th + 3.0 * uPhase);

    uv *= 1.0 - uWobble * 0.055 * wob * smoothstep(0.0, 0.5, r0);

  }

  float r = length(uv);

  vec2 pd = uv / max(r, 1.0);       // clamp to unit disc so glow keeps rim colour

  float z = sqrt(max(1.0 - dot(pd, pd), 0.0));

  vec3 n = vec3(pd, z);             // analytic sphere normal

  /* Domain warping: the base fBm is static and cheap, and the animation comes

     entirely from warping its input through the looping flow field. Nesting a

     second warp is what turns smooth blobs into marbled, ink-in-water flow. */

  vec2 p0 = (pd - n.xy * uRefract) * uScaleN;

  vec2 p1 = p0 + uFlow * flowField(p0);

  vec2 p2 = p1 + uTurb * flowField(p1 * 1.7 + 5.2);

  float noise = mix(0.5, fbm(p2 + 3.7), 1.35);

  float t = noise + uShift;

  float fres3 = pow(1.0 - n.z, 3.0);

  vec3 lab = iridesce(paletteLab(t), fres3);

  vec3 base;

  if (uAberr > 0.001) {

    // Dispersion: shift the palette lookup per channel, strongest at the rim.

    float d = uAberr * 0.05 * r * r;

    base = vec3(oklabToLinear(iridesce(paletteLab(t - d), fres3)).r,

                oklabToLinear(lab).g,

                oklabToLinear(iridesce(paletteLab(t + d), fres3)).b);

  } else {

    base = oklabToLinear(lab);

  }

  base = max(base, 0.0);

  // Lighting is added in linear light, which is where it physically belongs.

  vec3 L = normalize(uLight);

  float diffD = clamp(dot(n, L), 0.0, 1.0);

  vec3 col = mix(base, vec3(diffD), uShading);

  // Internal scatter: a soft core offset away from the highlight, so the orb

  // reads as a translucent body rather than a lit opaque ball.

  vec2 op = pd + L.xy * 0.45;

  col += uInner * exp(-dot(op, op) * 2.2) * base;

  float fres = pow(1.0 - n.z, 8.0) * uRim;

  vec3 half_ = normalize(L + vec3(0.0, 0.0, 1.0));

  float spec = pow(max(dot(n, half_), 0.0), 24.3) * uSpec;

  col += fres + spec;

  vec3 lit = linearToSrgb(col);

  vec3 flat_ = linearToSrgb(base);

  // Edge width never drops below ~1.5 device px, so the rim stays smooth even

  // in a tiny embed. fwidth() needs no extension in GLSL ES 3.00.

  float w = max(uSoft, 1.5 * fwidth(r));

  float body = 1.0 - smoothstep(1.0 - w, 1.0, r);

  float glowF = uGlow * exp(-max(r - 1.0, 0.0) * 20.0);

  /* Take the glow tail to exactly zero before the canvas boundary. Left alone

     it is still ~1.5/255 at the edge and gets cut off square, which makes the

     canvas box visible as a faint rectangle around the orb. */

  glowF *= 1.0 - smoothstep(0.45, 1.0, (r - 1.0) / (RMAX - 1.0));

  float a = clamp(body + glowF * (1.0 - body), 0.0, 1.0);

  vec3 outCol = mix(flat_, lit, body);

  // Grain + always-on deband dither, in display space. Stepped to 24 frames

  // per loop so the noise animates without breaking the seamless loop.

  int frame = int(uPhase / TAU * 24.0);

  float gn = rand3(ivec3(ivec2(gl_FragCoord.xy), frame)) - 0.5;

  outCol += gn * (uGrain * 0.1 + 1.0 / 255.0);

  outCol = clamp(outCol, 0.0, 1.0);

  fragColor = vec4(outCol * a, a);   // premultiplied

}`;

  function hexToRGB(hex) {

    var h = String(hex || '').replace('#', '');

    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];

    var v = parseInt(h, 16);

    if (isNaN(v)) v = 0;

    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];

  }

  function srgbToOklab(hex) {

    var c = hexToRGB(hex).map(function (u) {

      return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);

    });

    var l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2];

    var m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2];

    var s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2];

    var l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);

    return [

      0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,

      1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,

      0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

    ];

  }

  var canvas = document.createElement('canvas');

  canvas.style.cssText = 'width:100%;height:100%;display:block;';

  container.appendChild(canvas);

  var gl = null;

  try {

    gl = canvas.getContext('webgl2', {

      alpha: true,

      premultipliedAlpha: true,

      antialias: false,        // fullscreen quad has no geometric edges to sample

      depth: false,

      stencil: false,

      powerPreference: 'low-power'

    });

  } catch (e) { gl = null; }

  /* No WebGL2: paint a static CSS gradient instead of throwing and taking the

     rest of the page's scripts down with us. */

  if (!gl) {

    canvas.remove();

    var fb = document.createElement('div');

    fb.style.cssText = 'width:100%;height:100%;border-radius:50%;';

    container.appendChild(fb);

    var applyFallback = function (next) {

      for (var k in next) cfg[k] = next[k];

      var cs = (cfg.colors || ['#888888', '#444444']).slice(0, 4);

      fb.style.background = 'radial-gradient(circle at 35% 32%, ' + cs.join(', ') + ')';

    };

    applyFallback(config);

    return {

      update: applyFallback,

      capture: function () { return null; },

      destroy: function () { fb.remove(); },

      supported: false

    };

  }

  var prog = null, loc = {}, vals = {};

  function compile(type, src) {

    var sh = gl.createShader(type);

    gl.shaderSource(sh, src);

    gl.compileShader(sh);

    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {

      var log = gl.getShaderInfoLog(sh);

      gl.deleteShader(sh);

      throw new Error('Orb shader compile failed: ' + log);

    }

    return sh;

  }

  function buildProgram() {

    var vs = compile(gl.VERTEX_SHADER, VERT);

    var fs = compile(gl.FRAGMENT_SHADER, FRAG);

    var p = gl.createProgram();

    gl.attachShader(p, vs);

    gl.attachShader(p, fs);

    gl.linkProgram(p);

    gl.deleteShader(vs);

    gl.deleteShader(fs);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {

      throw new Error('Orb program link failed: ' + gl.getProgramInfoLog(p));

    }

    prog = p;

    loc = {};

    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);

    for (var i = 0; i < n; i++) {

      var name = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, '');

      loc[name] = gl.getUniformLocation(p, name);

    }

    gl.useProgram(p);

    gl.disable(gl.DEPTH_TEST);

    gl.disable(gl.BLEND);   // shader writes premultiplied RGBA straight out

    pushUniforms();

  }

  function pushUniforms() {

    if (!prog) return;

    gl.useProgram(prog);

    for (var k in vals) {

      var l = loc[k];

      if (!l) continue;

      var v = vals[k];

      if (typeof v === 'number') gl.uniform1f(l, v);

      else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);

      else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);

      else gl.uniform3fv(l, v);

    }

  }

  function update(next) {

    for (var k in next) cfg[k] = next[k];

    var cols = cfg.colors.slice(0, 4);

    while (cols.length < 4) cols.push(cols[cols.length - 1]);

    var lab = new Float32Array(12);

    for (var i = 0; i < 4; i++) {

      var v = srgbToOklab(cols[i]);

      lab[i * 3] = v[0]; lab[i * 3 + 1] = v[1]; lab[i * 3 + 2] = v[2];

    }

    vals.uLab = lab;

    vals.uCount = Math.max(2, Math.min(cfg.colors.length, 4));

    // Slider reads as "blob size", so invert it into cell frequency.

    vals.uScaleN = 1.45 / Math.max(cfg.blobScale, 0.05);

    vals.uFlow = cfg.flow;

    vals.uTurb = cfg.turbulence;

    vals.uWobble = cfg.wobble;

    vals.uIrid = cfg.iridescence;

    vals.uShift = cfg.shift;

    vals.uBalance = Math.pow(5, (0.5 - cfg.balance) * 2);

    vals.uChroma = cfg.chroma;

    vals.uContrast = cfg.contrast;

    vals.uSoft = cfg.softness;

    vals.uGlow = cfg.glow;

    vals.uShading = cfg.shading;

    vals.uSpec = cfg.specular;

    vals.uRim = cfg.rim;

    vals.uRefract = cfg.refraction;

    vals.uInner = cfg.inner;

    vals.uAberr = cfg.aberration;

    vals.uGrain = cfg.grain;

    vals.uLight = [cfg.lightX, cfg.lightY, 0.65];

    pushUniforms();

    if (!running) render();

  }

  function resize(entry) {

    var w, h;

    var box = entry && entry.devicePixelContentBoxSize;

    if (box && box.length) {

      w = box[0].inlineSize;

      h = box[0].blockSize;

    } else {

      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      var fallback = window.__ORB_PIXEL_SIZE__ || 1;

      w = Math.round((container.clientWidth || fallback) * dpr);

      h = Math.round((container.clientHeight || fallback) * dpr);

    }

    w = Math.max(1, w); h = Math.max(1, h);

    if (canvas.width === w && canvas.height === h) return false;

    canvas.width = w;

    canvas.height = h;

    gl.viewport(0, 0, w, h);

    vals.uRes = [w, h];

    pushUniforms();

    return true;

  }

  function render() {

    if (!prog) return;

    gl.useProgram(prog);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

  }

  var phase = 0, pending = 0, last = 0, raf = 0, running = false;

  var onScreen = true, reduced = false;

  var CAP = 1000 / 60;   // ambient motion gains nothing from 120 Hz

  function frame(now) {

    raf = requestAnimationFrame(frame);

    var dt = last ? Math.min(now - last, 100) : 16.7;

    last = now;

    pending += dt;

    /* Allow a half-frame of slack, otherwise a display whose vsync divides

       CAP almost exactly drops an extra frame and the cadence stutters. */

    if (pending < CAP - dt * 0.5) return;

    phase = (phase + (pending / 1000) / cfg.duration) % 1;

    pending = 0;

    vals.uPhase = phase * TAU;

    gl.useProgram(prog);

    gl.uniform1f(loc.uPhase, vals.uPhase);

    render();

  }

  function start() {

    if (running || reduced || !onScreen || !prog) return;

    running = true;

    last = 0;

    pending = 0;

    raf = requestAnimationFrame(frame);

  }

  function stop() {

    running = false;

    if (raf) cancelAnimationFrame(raf);

    raf = 0;

  }

  vals.uPhase = 0;

  buildProgram();

  resize();

  update(config);

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function applyMotionPref() {

    reduced = !!(mq && mq.matches);

    if (reduced) {

      stop();

      phase = 0;

      vals.uPhase = 0;

      pushUniforms();

      render();

    } else {

      start();

    }

  }

  if (mq && mq.addEventListener) mq.addEventListener('change', applyMotionPref);

  var ro = null;

  if (window.ResizeObserver) {

    ro = new ResizeObserver(function (entries) {

      if (resize(entries[0]) && !running) render();

    });

    try { ro.observe(container, { box: 'device-pixel-content-box' }); }

    catch (e) { ro.observe(container); }

  }

  /* Scrolled out of view is the common case for an embed — don't burn GPU on

     something nobody can see. */

  var io = null;

  if (window.IntersectionObserver) {

    io = new IntersectionObserver(function (entries) {

      onScreen = entries[entries.length - 1].isIntersecting;

      if (onScreen) start(); else stop();

    }, { rootMargin: '120px' });

    io.observe(container);

  }

  if (window.__ORB_EMBED__ === 'rn') {
    onScreen = true;
    start();
  }

  function onLost(e) { e.preventDefault(); stop(); prog = null; }

  function onRestored() {

    buildProgram();

    resize();

    update({});

    applyMotionPref();

  }

  canvas.addEventListener('webglcontextlost', onLost);

  canvas.addEventListener('webglcontextrestored', onRestored);

  applyMotionPref();   // draws the first frame, and starts the loop if allowed

  /* Grab the frame currently on screen at an arbitrary square resolution.

     The context has no preserveDrawingBuffer, so the draw and the readPixels

     have to happen in one task, before the compositor clears the buffer.

     Returns premultiplied rows bottom-up, exactly as GL hands them over. */

  function capture(size) {

    if (!prog) return null;

    size = Math.max(1, Math.min(Math.round(size || 2048), 4096));

    var pw = canvas.width, ph = canvas.height;

    canvas.width = size;

    canvas.height = size;

    gl.viewport(0, 0, size, size);

    vals.uRes = [size, size];

    pushUniforms();

    render();

    var px = new Uint8Array(size * size * 4);

    gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, px);

    canvas.width = pw;

    canvas.height = ph;

    gl.viewport(0, 0, pw, ph);

    vals.uRes = [pw, ph];

    pushUniforms();

    render();

    return { width: size, height: size, premultiplied: px };

  }

  return {

    update: update,

    capture: capture,

    supported: true,

    destroy: function () {

      stop();

      if (ro) ro.disconnect();

      if (io) io.disconnect();

      if (mq && mq.removeEventListener) mq.removeEventListener('change', applyMotionPref);

      canvas.removeEventListener('webglcontextlost', onLost);

      canvas.removeEventListener('webglcontextrestored', onRestored);

      if (prog) gl.deleteProgram(prog);

      var ext = gl.getExtension('WEBGL_lose_context');

      if (ext) ext.loseContext();

      canvas.remove();

    }

  };

};