import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { animate } from 'animejs';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import ScrollVelocity from './bits/ScrollVelocity';
import ScrollReveal from './bits/ScrollReveal';
import DecryptedText from './bits/DecryptedText';
import Magnet from './bits/Magnet';
import TargetCursor from './bits/TargetCursor';
import { ANVIL_D, ANVIL_VB, WORD_D, WORD_VB } from './logoPaths';
import Build from './Build';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const A = (f) => `assets/${f}`;
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
// The rail, as it hangs in vault-inside.webp (1672 x 941 px): centre + height of each piece.
const RAIL = [
  { no: '04', name: 'Heavyweight Hoodie', who: 'Unisex', fabric: '450 gsm brushed fleece', cw: 'BLK / BONE', grade: 5, cx: 455, cy: 517, h: 295, line: 'Contrast-stitched seams, a kangaroo pocket piped in bone, the anvil on the chest.' },
  { no: '01', name: 'Wide-Leg Track Pant', who: 'Unisex', fabric: '380 gsm brushed fleece', cw: 'BLK / BONE', grade: 4, cx: 660, cy: 587, h: 435, line: 'Wide through the leg, bone side stripes, the wordmark at the hip.' },
  { no: '03', name: 'Compression Tee', who: 'Men', fabric: '220 gsm 4-way stretch', cw: 'BLK / BONE', grade: 3, cx: 845, cy: 507, h: 275, line: 'Holds close and moves with you. Bone piping traces every seam.' },
  { no: '05', name: 'Fitted Crop Tee', who: 'Women', fabric: '200 gsm stretch jersey', cw: 'ROSE / BURG', grade: 2, cx: 1042, cy: 500, h: 260, line: 'Rose marl, burgundy piping, cut to sit right at the waist.' },
  { no: '02', name: 'Flare Track Pant', who: 'Women', fabric: '300 gsm brushed interlock', cw: 'ROSE / BURG', grade: 3, cx: 1230, cy: 587, h: 435, line: 'High rise, a flared hem and a double burgundy stripe down the leg.' }
];
const GAR = {
  '04': { l: 20.993, t: 43.146, w: 12.679, h: 26.249, ox: 49.87 }, '01': { l: 34.091, t: 42.402, w: 10.646, h: 43.252, ox: 44.3 },
  '03': { l: 45.395, t: 43.252, w: 10.467, h: 24.336, ox: 49.4 }, '05': { l: 57.237, t: 44.74, w: 10.347, h: 22.529, ox: 50.22 },
  '02': { l: 68.122, t: 43.039, w: 10.766, h: 42.614, ox: 43.27 }
};
const R0 = 5.8;                       // timeline time the rail tour starts (after the hover pause)
const FW = 1672, FH = 941;           // render frame
const SZ = 1.457, OX = 856, OY = 513; // interior-wide = vault-open zoomed 1.457x about (856, 513)
const toOpen = (x, y) => [((x - OX) / SZ + OX) / FW, ((y - OY) / SZ + OY) / FH];

function Logo({ className = '' }) {
  return (
    <span className={`logo ${className}`} aria-label="IRONKIN">
      <svg viewBox={ANVIL_VB} className="logo__anvil" aria-hidden="true"><path d={ANVIL_D} /></svg>
      <svg viewBox={WORD_VB} className="logo__word" aria-hidden="true"><path d={WORD_D} /></svg>
    </span>
  );
}

const Code = ({ children, className = '' }) => <span className={`code ${className}`}><i className="code__dot" />{children}</span>;

function Grade({ n, light }) {
  return (
    <div className={`grade ${light ? 'grade--light' : ''}`}>
      <div className="grade__bars">{[0, 1, 2, 3, 4].map((k) => <i key={k} className={k < n ? 'on' : ''} />)}</div>
      <span className="mono">Forge grade {String(n).padStart(2, '0')} / 05</span>
    </div>
  );
}

function Plate({ children, red, className = '', ...p }) {
  return <button className={`plate ${red ? 'plate--red' : ''} ${className}`} {...p}><span>{children}</span></button>;
}

/* ------------------------------------------------------------------ preloader */
function Preloader({ onDone }) {
  const root = useRef(null);
  useEffect(() => {
    const el = root.current, clock = el.querySelector('.pre__clock');
    const t = { s: 55 };
    let done = false;
    const finish = () => { if (done) return; done = true; onDone(); };
    const fail = setTimeout(finish, 3800);
    animate(t, {
      s: 60, duration: 1300, ease: 'inOutQuad',
      onUpdate: () => { const s = Math.min(59, Math.floor(t.s)); clock.textContent = t.s >= 60 ? '05:00:00' : `04:59:${String(s).padStart(2, '0')}`; },
      onComplete: () => {
        clock.textContent = '05:00:00';
        el.classList.add('is-struck');
        animate(el.querySelector('.pre__anvil'), { scale: [1, 1.14, 1], duration: 420, ease: 'outExpo' });
        animate(el, { opacity: [1, 0], delay: 520, duration: 650, ease: 'inOutQuad', onComplete: finish });
      }
    });
    return () => clearTimeout(fail);
  }, [onDone]);
  return (
    <div className="pre" ref={root} aria-hidden="true">
      <svg viewBox={ANVIL_VB} className="pre__anvil"><path d={ANVIL_D} /></svg>
      <div className="pre__clock display">04:59:55</div>
      <span className="mono pre__note">The vault opens at 05:00</span>
    </div>
  );
}

/* ------------------------------------------------------------------ hanger physics: each piece swings from its hook */
function useSwing() {
  const els = useRef([]), shadows = useRef([]);
  const st = useRef(RAIL.map(() => ({ a: 0, v: 0 })));
  const running = useRef(false);
  const loop = () => {
    let moving = false;
    st.current.forEach((s, k) => {
      s.v += -s.a * 0.055;            // spring back to hanging straight
      s.v *= 0.93;                    // air + fabric damping
      s.a += s.v;
      if (Math.abs(s.a) > 0.015 || Math.abs(s.v) > 0.015) moving = true; else { s.a = 0; s.v = 0; }
      const n = els.current[k]; if (n) n.style.transform = `rotate(${s.a.toFixed(3)}deg)`;
      const sh = shadows.current[k]; if (sh) sh.style.transform = `translate(${(-s.a * 1.6).toFixed(2)}px, 10px) rotate(${(s.a * 0.6).toFixed(3)}deg)`;
    });
    if (moving) requestAnimationFrame(loop); else running.current = false;
  };
  const kick = (k, dx) => {
    const s = st.current[k]; if (!s) return;
    s.v += Math.max(-1.4, Math.min(1.4, dx * 0.045));
    if (!running.current) { running.current = true; requestAnimationFrame(loop); }
  };
  return { els, shadows, kick };
}

/* ------------------------------------------------------------------ the vault: shutter, walk-in, rail */
function Vault({ onAdd }) {
  const root = useRef(null);
  const [sizes, setSizes] = useState(() => RAIL.map(() => 'M'));
  const [hover, setHover] = useState(-1);
  const goto = useRef(() => {});
  const swing = useSwing();

  useGSAP(() => {
    const el = root.current;
    const stage = el.querySelector('.stage');
    const geo = {};
    const measure = () => {
      const vw = el.clientWidth, vh = window.innerHeight, ar = FW / FH;
      const W = vw / vh > ar ? vw : vh * ar, H = W / ar;
      Object.assign(geo, { vw, vh, W, H, L: (vw - W) / 2, T: (vh - H) / 2, mobile: vw < 760 });
      gsap.set(stage, { width: W, height: H, left: geo.L, top: geo.T });
    };
    measure();
    el.querySelectorAll('img').forEach((i) => i.decode?.().catch(() => {}));   // decode early: no hitch when the interior fades in
    // camera: put stage point (fx, fy) at screen point (ax, ay) with scale S
    const cam = (fx, fy, S, ax, ay) => ({ x: ax - geo.L - fx * geo.W * S, y: ay - geo.T - fy * geo.H * S, scale: S });
    const home = () => cam(0.5, 0.5, 1, geo.vw / 2, geo.vh / 2);
    const inside = () => { const [fx, fy] = [OX / FW, OY / FH]; return cam(fx, fy, SZ, geo.L + fx * geo.W, geo.T + fy * geo.H); };
    const piece = (p) => {
      const [fx, fy] = toOpen(p.cx, p.cy);
      const Z = Math.min(2.6, (geo.mobile ? 0.5 : 0.74) * geo.vh * FH / (p.h * geo.H));
      return cam(fx, fy, SZ * Z, geo.vw * (geo.mobile ? 0.5 : 0.34), geo.vh * (geo.mobile ? 0.36 : 0.52));
    };
    ScrollTrigger.addEventListener('refreshInit', measure);
    gsap.set(stage, { transformOrigin: '0 0', ...home() });

    const panels = gsap.utils.toArray('.rp', el);
    gsap.set(panels, { autoAlpha: 0, x: 40 });
    const hud = el.querySelector('.hud__pct'), hudStep = el.querySelector('.hud__step');
    const steps = ['01  Closed', '02  The shutter', '03  Walk in', '04  The rail', '05  Into the collection'];

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el, start: 'top top', end: () => '+=' + window.innerHeight * 10, pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: (st) => {
          hud.textContent = String(Math.round(st.progress * 100)).padStart(3, '0') + '%';
          const t = st.progress * tl.duration();
          el.classList.toggle('is-inside', t > 4.0);
          hudStep.textContent = steps[t < 0.4 ? 0 : t < 2.8 ? 1 : t < 4.4 ? 2 : t < 15.2 ? 3 : 4];
        }
      }
    });
    tl.to('.hero', { autoAlpha: 0, y: -50, duration: 1.0, ease: 'power1.in' }, 0.3)
      .to('.cue', { autoAlpha: 0, duration: 0.4 }, 0.2)
      .to('.shutter', { yPercent: -100, duration: 2.6, ease: 'power1.inOut' }, 0.4)
      .to('.redline', { autoAlpha: 0, duration: 0.8 }, 0.5)
      .to('.spill', { autoAlpha: 1, duration: 2.2 }, 0.8)
      .to(stage, { ...{}, x: () => inside().x, y: () => inside().y, scale: () => inside().scale, duration: 1.8, ease: 'power2.inOut' }, 2.6)
      .to('.inside', { opacity: 1, duration: 0.8 }, 3.6)
      .to('.vignette', { autoAlpha: 1, duration: 1.2 }, 3.2)
      .fromTo('.hint', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 4.2)
      .to('.hint', { autoAlpha: 0, duration: 0.4 }, R0 - 0.3)
      .to('.railbar', { autoAlpha: 1, duration: 0.4 }, R0 - 0.4);
    RAIL.forEach((p, k) => {
      const t0 = R0 + k * 1.9;
      tl.to(stage, { x: () => piece(p).x, y: () => piece(p).y, scale: () => piece(p).scale, duration: 0.9, ease: 'power2.inOut' }, t0)
        .to(panels[k], { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, t0 + 0.55)
        .to(`.railbar__tick:nth-child(${k + 1})`, { color: '#eee7dc', duration: 0.2 }, t0 + 0.5);
      if (k < RAIL.length - 1) tl.to(panels[k], { autoAlpha: 0, x: -30, duration: 0.35, ease: 'power1.in' }, t0 + 1.55);
    });
    tl.fromTo('.railbar__fill', { scaleX: 0 }, { scaleX: 1, duration: 9.5 }, R0)
      .to(panels[RAIL.length - 1], { autoAlpha: 0, x: -30, duration: 0.35 }, R0 + 9.5)
      .to(stage, { x: () => inside().x, y: () => inside().y, scale: () => inside().scale, duration: 1.1, ease: 'power2.inOut' }, R0 + 9.6)
      .to('.railbar', { autoAlpha: 0, duration: 0.4 }, R0 + 9.7)
      .to('.outro', { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, R0 + 10.2)
      .to({}, { duration: 0.6 });
    // click a piece: glide to its rail stop
    goto.current = (k) => {
      const st = tl.scrollTrigger, t = R0 + k * 1.9 + 1.1;
      const y = st.start + (st.end - st.start) * (t / tl.duration());
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.8 }); else window.scrollTo({ top: y, behavior: 'smooth' });
    };

    // torch light + pointer depth: the rail sits a little in front of the wall
    const depthX = gsap.quickTo('.gars', 'x', { duration: 0.8, ease: 'power3.out' });
    const depthY = gsap.quickTo('.gars', 'y', { duration: 0.8, ease: 'power3.out' });
    const onMove = (e) => {
      el.style.setProperty('--mx', e.clientX + 'px'); el.style.setProperty('--my', e.clientY + 'px');
      depthX((e.clientX / geo.vw - 0.5) * -10); depthY((e.clientY / geo.vh - 0.5) * -6);
    };
    el.addEventListener('pointermove', onMove);

    // live HUD clock, Cairo time
    const clock = el.querySelector('.hud__clock');
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => { clock.textContent = 'CAI ' + fmt.format(new Date()); };
    tick(); const iv = setInterval(tick, 1000);
    return () => { ScrollTrigger.removeEventListener('refreshInit', measure); el.removeEventListener('pointermove', onMove); clearInterval(iv); };
  }, { scope: root });

  return (
    <section className="vault" id="vault" ref={root} aria-label="The Vault">
      <div className="stage">
        <img className="layer" src={A('vault-open.webp')} alt="The IRONKIN vault seen from the street at night, the rail of Collection 001 inside." />
        <div className={`layer inside ${hover > -1 ? 'has-hover' : ''}`}>
          <img className="inside__bg" src={A('vault-inside-empty.webp')} alt="" aria-hidden="true" />
          <div className="gars">
            {RAIL.map((p, k) => {
              const g = GAR[p.no];
              const box = { left: g.l + '%', top: g.t + '%', width: g.w + '%', height: g.h + '%' };
              // the baked shadow carries 30px padding around a garment crop
              const pw = g.w * 30 / (g.w / 100 * FW), ph = g.h * 30 / (g.h / 100 * FH);
              return (
                <div key={p.no} className="gslot">
                  <img className="gshadow" src={A(`g-${p.no}-shadow.webp`)} alt="" aria-hidden="true" ref={(n) => (swing.shadows.current[k] = n)}
                    style={{ left: (g.l - pw) + '%', top: (g.t - ph) + '%', width: (g.w + 2 * pw) + '%', height: (g.h + 2 * ph) + '%' }} />
                  <button className={`gar cursor-target ${hover === k ? 'is-hover' : ''}`} style={{ ...box, transformOrigin: `${g.ox}% 0%` }}
                    ref={(n) => (swing.els.current[k] = n)} data-cursor-label={`FRG-01${p.no} · ${p.name} · walk to it`}
                    aria-label={`${p.name}: walk to it on the rail`}
                    onPointerEnter={(e) => { setHover(k); swing.kick(k, e.movementX || 6); }}
                    onPointerMove={(e) => swing.kick(k, e.movementX * 0.35)}
                    onPointerLeave={() => setHover(-1)}
                    onClick={() => { swing.kick(k, 14); goto.current(k); }}>
                    <span className="gar__in"><img src={A(`g-${p.no}.webp`)} alt="" draggable="false" /></span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="spill" aria-hidden="true" />
        <div className="door" aria-hidden="true">
          <img className="shutter" src={A('shutter.webp')} alt="" />
        </div>
        <div className="redline" aria-hidden="true" />
      </div>
      <div className="vignette" aria-hidden="true" />
      <div className="torch" aria-hidden="true" />
      <div className="vf-frame" aria-hidden="true"><i className="vf vf--tl" /><i className="vf vf--tr" /><i className="vf vf--bl" /><i className="vf vf--br" /></div>
      <div className="hint mono" aria-hidden="true"><span className="hint__b">[</span> Hover the rail. Click a piece to walk to it. <span className="hint__b">]</span></div>

      <div className="hero">
        <Code>FRG-WEB-04 · Drop 002</Code>
        <h1 className="display hero__t">The work<br />nobody sees.</h1>
        <p className="hero__s">Drop 002 opens at 05:00. Scroll to open the vault and walk the rail.</p>
      </div>
      <div className="cue mono" aria-hidden="true"><i />Scroll to open</div>

      <div className="hud mono" aria-hidden="true"><span className="hud__rec"><i />Live</span><span className="hud__clock">CAI 05:00:00</span><span className="hud__geo">30.04 N 31.23 E</span><span className="hud__step">01  Closed</span><span className="hud__pct">000%</span></div>

      <div className="rps">
        {RAIL.map((p, k) => (
          <article className="rp" key={p.no} aria-label={p.name}>
            <i className="vf vf--tl" /><i className="vf vf--tr" /><i className="vf vf--bl" /><i className="vf vf--br" />
            <DecryptedText text={`FRG-01${p.no}`} animateOn="view" sequential speed={40} characters="0123456789-FRG" className="rp__code" parentClassName="rp__codewrap" />
            <h2 className="display rp__t">{p.name}</h2>
            <p className="mono rp__meta">{p.who} · {p.fabric} · {p.cw}</p>
            <Grade n={p.grade} light />
            <p className="rp__line">{p.line}</p>
            <div className="sizes" role="group" aria-label="Size">
              {SIZES.map((s) => (
                <button key={s} className={sizes[k] === s ? 'on' : ''} aria-pressed={sizes[k] === s}
                  onClick={() => setSizes((a) => a.map((v, i) => (i === k ? s : v)))}>{s}</button>
              ))}
            </div>
            <Magnet padding={40} magnetStrength={6}>
              <Plate red className="cursor-target" data-cursor-label="Hold it until 05:00" onClick={() => onAdd(p, sizes[k])}>Add to bag · {sizes[k]}</Plate>
            </Magnet>
            <span className="mono rp__stop">Stop {k + 1} / 05</span>
          </article>
        ))}
      </div>

      <div className="railbar">
        <div className="railbar__track"><div className="railbar__fill" /></div>
        <div className="railbar__ticks mono">{RAIL.map((p) => <span key={p.no} className="railbar__tick">FRG-01{p.no}</span>)}</div>
      </div>

      <div className="outro">
        <p className="mono">The rail is yours</p>
        <p className="display outro__t">Keep scrolling into Collection 001</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ collection */
function Card({ p, onAdd }) {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 180, damping: 18 });
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); };
  return (
    <motion.article className="card cursor-target" data-cursor-label={`FRG-01${p.no}`} style={{ rotateX: rx, rotateY: ry }} onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0); }}>
      <div className="card__img">
        <img src={A(`piece-${p.no}.webp`)} alt={`${p.name}, ${p.cw.toLowerCase()}, on the vault rail`} loading="lazy" />
        <i className="vf vf--tl" /><i className="vf vf--tr" /><i className="vf vf--bl" /><i className="vf vf--br" />
      </div>
      <Code>FRG-01{p.no}</Code>
      <h3 className="display card__t">{p.name}</h3>
      <p className="mono card__m">{p.who} · {p.fabric}</p>
      <Grade n={p.grade} />
      <button className="card__add" onClick={() => onAdd(p, 'M')}>Add · M</button>
    </motion.article>
  );
}

function Collection({ onAdd }) {
  return (
    <section className="collection" id="collection">
      <div className="sec__head">
        <Code>FRG-01 · Catalogue</Code>
        <h2 className="display sec__t">Collection 001</h2>
        <p className="sec__s">Five pieces, worn for six weeks before anyone saw them. The same rail you just walked.</p>
      </div>
      <div className="cards">{RAIL.map((p) => <Card key={p.no} p={p} onAdd={onAdd} />)}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ the vaults (locations) */
function Vaults() {
  const [open, setOpen] = useState(-1);
  const v = [
    { n: '01', city: 'Cairo', name: 'The Steel Vault', door: 'exterior-steel-door', inn: 'exterior-steel-in', note: 'Sawtooth roof, red door frame. Opens for the drop, then shuts.' },
    { n: '02', city: 'Alexandria', name: 'The Red Door', door: 'exterior-concrete-door', inn: 'exterior-concrete-in', note: 'Raw concrete, a sliding oxblood door, one long light inside.' }
  ];
  return (
    <section className="vaults" id="vaults">
      <div className="sec__head sec__head--dark">
        <Code>The vaults</Code>
        <h2 className="display sec__t">Where the drops open</h2>
        <p className="sec__s">Hover or tap a door. Each vault opens at 05:00 for the drop, and closes when the rail is empty.</p>
      </div>
      <div className="vaults__row">
        {v.map((x, k) => (
          <button className={`vcard cursor-target ${open === k ? 'is-open' : ''}`} key={x.n} onClick={() => setOpen(open === k ? -1 : k)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(k)} onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(-1)}
            aria-pressed={open === k} aria-label={`Vault ${x.n}, ${x.city}: open the door`}>
            <img className="vcard__door" src={A(`${x.door}.webp`)} alt="" loading="lazy" />
            <img className="vcard__in" src={A(`${x.inn}.webp`)} alt="" loading="lazy" />
            <span className="vcard__txt">
              <span className="mono">Vault {x.n} · {x.city}</span>
              <span className="display vcard__t">{x.name}</span>
              <span className="vcard__n">{x.note}</span>
            </span>
            <span className="vcard__plate">05:00 - 08:00</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ the kin */
function Kin() {
  return (
    <section className="kin" id="kin">
      <div className="kin__l">
        <Code>The Kin Register</Code>
        <h2 className="display sec__t">Earn your<br /><em>Iron Number.</em></h2>
        <p className="sec__s">No application form, no follower count, nothing to buy. Log 30 days, send the proof, and we stamp a number into steel that's yours for life.</p>
        <ol className="kin__steps">
          <li><span className="mono">01</span>Log the work for 30 days.</li>
          <li><span className="mono">02</span>DM the word IRON with your log.</li>
          <li><span className="mono">03</span>Your plate is stamped and shipped.</li>
        </ol>
      </div>
      <div className="kin__r">
        <div className="kplate" role="img" aria-label="A blank Kin plate: KIN, number unclaimed">
          <i className="kplate__hole" />
          <span className="mono kplate__tier">Steel</span>
          <span className="display kplate__n">KIN <DecryptedText text="____" animateOn="view" loop loopDelay={2400} characters="0123456789" /></span>
          <span className="mono kplate__sub">Any sport · Any city · Day 001</span>
          <svg viewBox={ANVIL_VB} className="kplate__anvil" aria-hidden="true"><path d={ANVIL_D} /></svg>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <svg viewBox={WORD_VB} className="foot__word" aria-hidden="true"><path d={WORD_D} /></svg>
      <div className="foot__row mono">
        <span>© 2026 IRONKIN · Forged together.</span>
        <span>The vault opens at 05:00 · Cairo</span>
        <a href="#vault" className="cursor-target">Back to the door</a>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ app */
export default function App() {
  const [ready, setReady] = useState(false);
  const [bag, setBag] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [fine] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000); gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
    const onClick = (e) => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const el = document.querySelector(a.getAttribute('href')); if (el) { e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 }); } };
    document.addEventListener('click', onClick);
    window.__lenis = lenis;
    return () => { gsap.ticker.remove(raf); lenis.destroy(); document.removeEventListener('click', onClick); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !ready);
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  // the nav turns dark over the light sections
  useGSAP(() => {
    gsap.utils.toArray('.collection, .kin').forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 40px', end: 'bottom 40px', toggleClass: { targets: '.nav', className: 'nav--light' } }));
  });

  const add = (p, size) => {
    setBag((b) => [...b, { key: Date.now() + Math.random(), no: p.no, name: p.name, size }]);
    toast(`${p.name} · ${size}`, { description: 'In the bag. Checkout opens at 05:00 (demo, nothing is charged).' });
  };

  return (
    <>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      {fine && <TargetCursor cursorColor="#B3202B" spinDuration={3} blendMode="normal" size={34} cornerSize={10} thickness={2} />}
      <header className="nav">
        <a href="#vault" aria-label="IRONKIN, back to the door"><Logo /></a>
        <nav className="nav__links" aria-label="Sections">
          <a href="#vault" className="cursor-target">The vault</a><a href="#collection" className="cursor-target" data-cursor-label="FRG-01">Collection</a><a href="#build" className="cursor-target" data-cursor-label="Behind the scenes">The build</a><a href="#vaults" className="cursor-target">Vaults</a><a href="#kin" className="cursor-target">The Kin</a>
        </nav>
        <button className="nav__bag cursor-target" data-cursor-label="Held until 05:00" onClick={() => setBagOpen(true)}>Bag ({bag.length})</button>
      </header>
      <main>
        <Vault onAdd={add} />
        <section className="manifesto" aria-label="Manifesto">
          <Code>FRG-01 · Manifesto</Code>
          <ScrollReveal baseOpacity={0.08} enableBlur blurStrength={6} baseRotation={2} textClassName="manifesto__t">
            What you do in the dark decides who you are in the light.
          </ScrollReveal>
        </section>
        <Collection onAdd={add} />
        <div className="band" aria-hidden="true">
          <ScrollVelocity texts={['THE VAULT OPENS AT 05:00 · DROP 002 · NO RESTOCK ·', 'THE WORK NOBODY SEES · FORGED TOGETHER · IRONKIN ·']} velocity={45} className="band__t" numCopies={6} />
        </div>
        <Build />
        <Vaults />
        <Kin />
      </main>
      <Footer />

      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent className="bag">
          <SheetHeader>
            <SheetTitle className="display bag__t">Your bag</SheetTitle>
            <SheetDescription className="mono">Held until 05:00. Demo only: nothing is sent or charged.</SheetDescription>
          </SheetHeader>
          <ul className="bag__list">
            {bag.length === 0 && <li className="bag__empty">Empty. Walk the rail.</li>}
            {bag.map((i) => (
              <li key={i.key}>
                <img src={A(`piece-${i.no}.webp`)} alt="" />
                <span><Code>FRG-01{i.no}</Code><b className="display">{i.name}</b><span className="mono">Size {i.size}</span></span>
                <button className="mono" onClick={() => setBag((b) => b.filter((x) => x.key !== i.key))} aria-label={`Remove ${i.name}`}>Remove</button>
              </li>
            ))}
          </ul>
          <SheetFooter>
            <Plate red disabled={!bag.length} onClick={() => { toast('Checkout opens at 05:00', { description: 'This is a demo. Nothing is charged.' }); setBagOpen(false); }}>Checkout at 05:00</Plate>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Toaster position="bottom-left" />
    </>
  );
}
