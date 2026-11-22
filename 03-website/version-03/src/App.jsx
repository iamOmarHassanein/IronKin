import { useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { animate, createTimeline, utils } from 'animejs';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { toast } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import ScrollVelocity from './bits/ScrollVelocity';
import ScrollReveal from './bits/ScrollReveal';
import DecryptedText from './bits/DecryptedText';
import TargetCursor from './bits/TargetCursor';
import Magnet from './bits/Magnet';
import { ANVIL_D } from './logoPaths';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const A = (f) => `/assets/${f}`;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DROP = new Date('2026-11-26T23:00:00+02:00');
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const DROP_ITEMS = [
  { code: 'KS-001', name: 'Society Tee', line: 'Chrome arch front. The crest, 32 cm, on the back.', front: 'ks-001-front.webp', back: 'ks-001-back.webp', tag: 'SOCIETY' },
  { code: 'KS-002', name: 'Stone Tee', line: '1,100 hotfix stones set as the anvil.', front: 'ks-002-front.webp', back: 'ks-002-back.webp', tag: 'STONES' },
  { code: 'KS-003', name: 'Yard Tee', line: 'Oxblood. The Yard and its coordinates on the back.', front: 'ks-003-front.webp', back: 'ks-003-back.webp', tag: 'THE YARD' },
  { code: 'FRG-0104', name: 'Heavyweight Hoodie', line: '450 gsm brushed fleece, bone flatlock seams.', front: 'piece-04.webp', tag: 'COLLECTION 001', cut: true },
  { code: 'FRG-0101', name: 'Wide-Leg Track Pant', line: '380 gsm fleece, cut wide for the walk home.', front: 'piece-01.webp', tag: 'COLLECTION 001', cut: true },
  { code: 'FRG-0103', name: 'Compression Tee', line: '220 gsm four-way stretch, second skin.', front: 'piece-03.webp', tag: 'COLLECTION 001', cut: true },
  { code: 'FRG-0102', name: 'Flare Track Pant', line: '300 gsm interlock, burgundy piping.', front: 'piece-02.webp', tag: 'COLLECTION 001', cut: true },
  { code: 'FRG-0105', name: 'Fitted Crop Tee', line: '200 gsm stretch jersey, made to move.', front: 'piece-05.webp', tag: 'COLLECTION 001', cut: true }
];
const MEMBERS = [
  { img: 'm-crew', no: '0007', tag: 'THE KIN · 07:15', span: 'tall' },
  { img: 'm-box', no: '0014', tag: 'BOX · 21:40' },
  { img: 'm-street', no: '0001', tag: 'LIFT · 05:38', span: 'tall' },
  { img: 'm-court', no: '0011', tag: 'COURT · 19:30' },
  { img: 'm-run', no: '0023', tag: 'RUN · 06:10' },
  { img: 'm-lift', no: '0002', tag: 'LIFT · 05:52', span: 'tall' },
  { img: 'm-sprint', no: '0009', tag: 'SPRINT · 06:45' }
];

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const ms = Math.max(0, target - now); const p = (v) => String(v).padStart(2, '0');
  return { d: p(Math.floor(ms / 864e5)), h: p(Math.floor(ms / 36e5) % 24), m: p(Math.floor(ms / 6e4) % 60), s: p(Math.floor(ms / 1e3) % 60) };
}

/* ---------------------------------------------------------------- marks */
const Code = ({ children, className = '' }) => <span className={`code ${className}`}>[ {children} ]</span>;
const Star = ({ className = '' }) => (
  <svg className={`star ${className}`} viewBox="-10 -10 20 20" aria-hidden="true"><path d="M0,-10 L2.35,-3.24 L9.51,-3.09 L3.8,1.24 L5.88,8.09 L0,4 L-5.88,8.09 L-3.8,1.24 L-9.51,-3.09 L-2.35,-3.24 Z" /></svg>
);
function Crest({ className = '', size = 320 }) {
  const id = useMemo(() => `c${Math.random().toString(36).slice(2, 7)}`, []);
  return (
    <svg className={`crest ${className}`} viewBox="-160 -160 320 320" width={size} height={size} role="img" aria-label="The Kin Society crest">
      <defs>
        <path id={`${id}t`} d="M -128 0 A 128 128 0 0 1 128 0" />
        <path id={`${id}b`} d="M -138 0 A 138 138 0 0 0 138 0" />
      </defs>
      <circle r="154" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle r="114" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g fill="currentColor">
        <g transform="rotate(-45)"><rect x="-5" y="-108" width="10" height="190" /><path d="M -34 -112 L 34 -112 L 30 -80 L -30 -80 Z" /></g>
        <g transform="rotate(45)"><rect x="-5" y="-108" width="10" height="190" /><path d="M -34 -112 L 34 -112 L 30 -80 L -30 -80 Z" /></g>
        <g transform="translate(-76,-44) scale(0.4)"><path d={ANVIL_D} fillRule="evenodd" stroke="#060607" strokeWidth="22" paintOrder="stroke" /></g>
      </g>
      <text className="crest__ring"><textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">IRONKIN · KIN SOCIETY</textPath></text>
      <text className="crest__ring crest__ring--b"><textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">FORGED TOGETHER</textPath></text>
      <text className="crest__year" y="70" textAnchor="middle">MMXXVI</text>
      <g fill="#BE1E28"><path transform="translate(-134,0) scale(0.75)" d="M0,-10 L2.35,-3.24 L9.51,-3.09 L3.8,1.24 L5.88,8.09 L0,4 L-5.88,8.09 L-3.8,1.24 L-9.51,-3.09 L-2.35,-3.24 Z" /><path transform="translate(134,0) scale(0.75)" d="M0,-10 L2.35,-3.24 L9.51,-3.09 L3.8,1.24 L5.88,8.09 L0,4 L-5.88,8.09 L-3.8,1.24 L-9.51,-3.09 L-2.35,-3.24 Z" /></g>
    </svg>
  );
}

/* ---------------------------------------------------------------- signature: the stone anvil (canvas) */
function StoneAnvil({ ready }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const path = new Path2D(ANVIL_D);
    let W, H, dpr, stones = [], raf = 0, mouse = { x: -9999, y: -9999, on: false }, t0 = performance.now(), intro = 0, onScreen = true;
    const still = reduced();
    const sprite = document.createElement('canvas');
    const build = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr;
      const mobile = W < 680, aw = mobile ? W * 0.86 : Math.min(W * 0.46, 700), s = aw / 380, ah = 204 * s, ox = (W - aw) / 2, oy = H * (mobile ? 0.42 : 0.5) - ah / 2;
      const step = Math.max(7, aw / 58), r = step * 0.43;
      sprite.width = sprite.height = Math.ceil(r * 2 * dpr) + 2;
      const sc = sprite.getContext('2d'), c = sprite.width / 2, g = sc.createRadialGradient(c - r * dpr * 0.35, c - r * dpr * 0.35, 0, c, c, r * dpr);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#d9dbe0'); g.addColorStop(0.75, '#7d8088'); g.addColorStop(1, '#2a2b2f');
      sc.clearRect(0, 0, sprite.width, sprite.height); sc.fillStyle = g; sc.beginPath(); sc.arc(c, c, r * dpr, 0, Math.PI * 2); sc.fill();
      const probe = document.createElement('canvas').getContext('2d');
      stones = [];
      for (let row = 0, y = step / 2; y < 204; y += (step * 0.88) / s, row++) {
        for (let x = step / 2 / s + (row % 2 ? step / 2 / s : 0); x < 380; x += step / s) {
          if (probe.isPointInPath(path, x, y, 'evenodd')) {
            const hx = ox + x * s, hy = oy + y * s;
            const a = Math.random() * Math.PI * 2, d = 300 + Math.random() * 600;
            stones.push({ hx, hy, x: W / 2 + Math.cos(a) * d, y: H / 2 + Math.sin(a) * d, vx: 0, vy: 0, tw: Math.random() * 6.28, r });
          }
        }
      }
    };
    const tick = (now) => {
      const t = (now - t0) / 1000;
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const R = 120, k = 0.05 + 0.1 * intro, damp = 0.76;
      const steps = Math.min(6, Math.max(1, Math.round((now - (tick.last || now - 16.7)) / 16.7))); tick.last = now;   // time-based: settles on slow screens too
      if (ready && intro < 1) intro = Math.min(1, intro + steps * 0.025);
      for (const p of stones) {
       for (let st = 0; st < steps; st++) {
        let fx = (p.hx - p.x) * k, fy = (p.hy - p.y) * k;
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 9; fx += (dx / d) * f; fy += (dy / d) * f; }
        } else if (!still) {
          fx += Math.sin(t * 1.3 + p.hx * 0.012) * 0.06; fy += Math.cos(t * 1.1 + p.hy * 0.015) * 0.06;
        }
        p.vx = (p.vx + fx) * damp; p.vy = (p.vy + fy) * damp; p.x += p.vx; p.y += p.vy;
        if (st < steps - 1) { fx = (p.hx - p.x) * k; fy = (p.hy - p.y) * k; }
       }
        const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
        const glint = Math.max(0, Math.sin(t * 2.2 + p.tw)) ** 24;
        ctx.globalAlpha = 0.7 + 0.3 * Math.max(glint, sp);
        const sz = sprite.width / dpr;
        ctx.drawImage(sprite, p.x - sz / 2, p.y - sz / 2, sz, sz);
        if (glint > 0.6) {
          ctx.globalAlpha = (glint - 0.6) * 2.2; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
          const L = p.r * 2.6; ctx.beginPath(); ctx.moveTo(p.x - L, p.y); ctx.lineTo(p.x + L, p.y); ctx.moveTo(p.x, p.y - L); ctx.lineTo(p.x, p.y + L); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      raf = onScreen ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e) => { const b = cv.getBoundingClientRect(); mouse = { x: e.clientX - b.left, y: e.clientY - b.top, on: true }; };
    const onLeave = () => { mouse.on = false; };
    build(); raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen && !raf) raf = requestAnimationFrame(tick); });
    io.observe(cv);
    window.addEventListener('resize', build); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', onLeave);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', build); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave); };
  }, [ready]);
  return <canvas ref={ref} className="stones" aria-label="The IRONKIN anvil set in stones. Move your cursor through it." role="img" />;
}

/* ---------------------------------------------------------------- preloader (anime.js) */
function Preloader({ onDone }) {
  const root = useRef(null);
  useEffect(() => {
    if (reduced()) { onDone(); return; }
    const n = { v: 0 };
    const tl = createTimeline({ onComplete: onDone });
    tl.add('.pre__mark', { opacity: [0, 1], y: [16, 0], duration: 700, ease: 'outExpo' }, 0)
      .add(n, { v: 500, duration: 1300, ease: 'inOutQuad', modifier: utils.round(0),
        onUpdate: () => { const el = root.current?.querySelector('.pre__n'); if (el) el.textContent = String(n.v).padStart(4, '0'); } }, 150)
      .add('.pre__bar i', { scaleX: [0, 1], duration: 1300, ease: 'inOutQuad' }, 150)
      .add(root.current, { opacity: [1, 0], duration: 500, ease: 'outQuad' }, 1600);
    return () => tl.pause();
  }, [onDone]);
  return (
    <div className="pre" ref={root} aria-hidden="true">
      <img className="pre__mark" src={A('chrome-small.webp')} alt="" />
      <div className="pre__row mono"><span>SETTING STONES</span><span className="pre__n">0000</span></div>
      <div className="pre__bar"><i /></div>
    </div>
  );
}

/* ---------------------------------------------------------------- sections */
function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="nav__logo cursor-target" aria-label="IRONKIN home"><img src={A('chrome-small.webp')} alt="IRONKIN" /></a>
      <nav className="nav__links mono" aria-label="Main">
        <a href="#drop" className="cursor-target">Drop 001</a><a href="#society" className="cursor-target">Kin Society</a>
        <a href="#members" className="cursor-target">Members</a><a href="#yard" className="cursor-target">The Yard</a>
      </nav>
      <a href="#yard" className="nav__join mono cursor-target"><Star /> Join the Kin</a>
    </header>
  );
}

function Hero({ ready }) {
  const c = useCountdown(DROP);
  return (
    <section className={`hero ${ready ? 'is-in' : ''}`} id="top">
      <h1 className="sr-only">IRONKIN Kin Society, Drop 001</h1>
      <StoneAnvil ready={ready} />
      <img className="hero__arch" src={A('chrome-arch.webp')} alt="" />
      <p className="hero__hint mono hero__fade">MOVE THROUGH THE STONES. EVERY STONE IS A MEMBER.</p>
      <div className="hero__bottom">
        <div className="hero__left hero__fade">
          <Code>DROP 001 · 11.26 · 23:00</Code>
          <p className="hero__drop">The Yard.</p>
          <p className="hero__sub">Five heavyweight pieces and three society tees. No address, no pre-orders. The location goes to the Kin one hour before.</p>
        </div>
        <div className="hero__right hero__fade">
          <div className="count" aria-label="Time until the drop">
            {[['d', 'DAYS'], ['h', 'HRS'], ['m', 'MIN'], ['s', 'SEC']].map(([k, l]) => <span key={k}><b>{c[k]}</b><i className="mono">{l}</i></span>)}
          </div>
          <div className="hero__ctas">
            <Magnet padding={50} magnetStrength={5}><Button asChild className="pill pill--red cursor-target"><a href="#yard">Join the Kin <ArrowUpRight className="size-4" /></a></Button></Magnet>
            <Button asChild variant="ghost" className="pill pill--ghost cursor-target"><a href="#drop">See the drop</a></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  return (
    <section className="marquee" aria-label="Drop 001">
      <ScrollVelocity texts={['[ 11.26 ] THE YARD — KIN SOCIETY — NO RESTOCKS —', 'FORGED TOGETHER ★ IRONKIN ★ MMXXVI ★ FORGED TOGETHER ★']} velocity={55} className="marquee__t" numCopies={6} />
    </section>
  );
}

function Manifesto() {
  return (
    <section className="manifesto">
      <Code>THE RULES</Code>
      <ScrollReveal baseOpacity={0.1} enableBlur blurStrength={6} baseRotation={2} textClassName="manifesto__t">
        No address. No pre-orders. No restocks. The Yard opens once, the Kin hear first, and everyone who turns up leaves with a number. Iron is the work. Kin is the people.
      </ScrollReveal>
    </section>
  );
}

function Drop({ onOpen }) {
  const root = useRef(null), track = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const dist = () => track.current.scrollWidth - window.innerWidth + 64;
      gsap.to(track.current, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: 1, pin: true, invalidateOnRefresh: true } });
    });
  }, { scope: root });
  return (
    <section className="drop" id="drop" ref={root}>
      <div className="drop__head">
        <Code>DROP 001 · 8 PIECES</Code>
        <h2 className="h2">The drop.</h2>
        <p className="drop__sub">Three society tees made for The Yard, and Collection 001. Tap a piece to reserve a size.</p>
      </div>
      <div className="drop__track" ref={track}>
        {DROP_ITEMS.map((it) => (
          <button key={it.code} className={`card cursor-target ${it.cut ? 'card--cut' : ''}`} data-cursor-label={it.code} onClick={() => onOpen(it)}>
            <span className="card__media">
              <img className="card__img" src={A(it.front)} alt={`${it.name}${it.back ? ', front' : ''}`} loading="lazy" />
              {it.back && <img className="card__img card__img--back" src={A(it.back)} alt={`${it.name}, back`} loading="lazy" />}
              {it.back && <span className="card__flip mono">HOVER: BACK</span>}
            </span>
            <span className="card__body">
              <span className="code code--red">[ {it.code} ]</span>
              <span className="card__name">{it.name}</span>
              <span className="card__line">{it.line}</span>
              <span className="card__tag mono"><Star /> {it.tag}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function KinCard() {
  const x = useMotionValue(0), y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-16, 16]), { stiffness: 200, damping: 20 });
  const shine = useTransform(x, [-0.5, 0.5], ['20%', '80%']);
  return (
    <motion.div className="kcard cursor-target" data-cursor-label="KIN No. 0001" style={{ rotateX: rx, rotateY: ry }}
      onPointerMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - b.left) / b.width - 0.5); y.set((e.clientY - b.top) / b.height - 0.5); }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      <motion.span className="kcard__shine" style={{ left: shine }} />
      <div className="kcard__top"><img src={A('chrome-small.webp')} alt="" /><span className="mono">KIN SOCIETY</span></div>
      <DecryptedText text="No. 0001" animateOn="view" sequential speed={55} characters="0123456789" className="kcard__no" encryptedClassName="kcard__no kcard__no--enc" />
      <div className="kcard__foot mono"><span>MEMBER · DROP 001 · THE YARD</span><Star /></div>
    </motion.div>
  );
}

function Society() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.fromTo('.society__crest', { rotate: -40, scale: 0.85 }, { rotate: 40, scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.perk', { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.perks', start: 'top 80%' } });
  }, { scope: root });
  return (
    <section className="society" id="society" ref={root}>
      <div className="society__crestwrap"><Crest className="society__crest" size={560} /></div>
      <div className="society__grid">
        <div>
          <Code>THE KIN SOCIETY · 0001–0500</Code>
          <h2 className="h2">A crew with a number.</h2>
          <ul className="perks">
            <li className="perk"><b>01</b><span><strong>The location first.</strong> The Yard's coordinates reach members one hour before anyone else.</span></li>
            <li className="perk"><b>02</b><span><strong>A number for life.</strong> Stamped on a steel dog tag, never reused, carried to every drop.</span></li>
            <li className="perk"><b>03</b><span><strong>The sessions.</strong> Free crew training before every drop, wherever The Yard is.</span></li>
          </ul>
        </div>
        <KinCard />
      </div>
    </section>
  );
}

function Members() {
  return (
    <section className="members" id="members">
      <div className="drop__head">
        <Code>MEMBERS · NOT MODELS</Code>
        <h2 className="h2">The Kin, in the kit.</h2>
      </div>
      <div className="wall">
        {MEMBERS.map((m) => (
          <figure key={m.img} className={`tile cursor-target ${m.span === 'tall' ? 'tile--tall' : ''}`} data-cursor-label={`KIN No. ${m.no}`}>
            <img src={A(`${m.img}.webp`)} alt="Kin member training in IRONKIN" loading="lazy" />
            <img className="tile__c" src={A(`${m.img}-c.webp`)} alt="" loading="lazy" />
            <figcaption className="mono"><span>KIN No. {m.no}</span><span>{m.tag}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Yard() {
  const c = useCountdown(DROP);
  const [open, setOpen] = useState(false);
  const [num] = useState(() => String(24 + Math.floor(Math.random() * 470)).padStart(4, '0'));
  const tagRef = useRef(null);
  useEffect(() => {
    if (!open || reduced()) return;
    const o = { v: 0 };
    animate(o, { v: Number(num), duration: 1500, ease: 'outExpo', modifier: utils.round(0), onUpdate: () => { if (tagRef.current) tagRef.current.textContent = `No. ${String(o.v).padStart(4, '0')}`; } });
  }, [open, num]);
  return (
    <section className="yard" id="yard">
      <div className="yard__grid" aria-hidden="true" />
      <div className="yard__panel">
        <Code>THE YARD · LOCATION LOCKED</Code>
        <h2 className="yard__title">THE YARD</h2>
        <p className="yard__coords mono">
          <span>30.0444 N</span><span className="sep">·</span>
          <DecryptedText text="31.2357 E" animateOn="view" loop loopDelay={2600} characters="█▓▒░0123456789" className="yard__lock" />
        </p>
        <p className="yard__unlock mono">UNLOCKS FOR THE KIN · 11.26 · 22:00 · {c.d}D {c.h}H {c.m}M {c.s}S</p>
        <form className="yard__form" onSubmit={(e) => { e.preventDefault(); setOpen(true); }}>
          <label htmlFor="yard-email" className="sr-only">Email</label>
          <Input id="yard-email" type="email" required placeholder="EMAIL FOR THE COORDINATES" autoComplete="email" className="yard__input" />
          <Button type="submit" className="pill pill--red cursor-target">Claim a number <ArrowUpRight className="size-4" /></Button>
        </form>
        <p className="yard__small">500 numbers. Preview only: sign-ups aren’t connected yet, nothing is sent.</p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="tagdlg">
          <DialogHeader>
            <span className="code">[ KIN SOCIETY · RESERVED ]</span>
            <div className="dogtag"><span className="dogtag__hole" /><span className="dogtag__kin">KIN</span><span className="dogtag__no" ref={tagRef}>No. {num}</span><span className="dogtag__sm">BLOOD: IRON · MMXXVI</span></div>
            <DialogTitle className="tagdlg__t">Your number is held.</DialogTitle>
            <DialogDescription>Collect your steel tag at The Yard on 11.26. Coordinates arrive at 22:00. (Demo: nothing was sent.)</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <img className="foot__arch" src={A('chrome-arch.webp')} alt="IRONKIN" loading="lazy" />
      <div className="foot__row">
        <Crest size={92} className="foot__crest" />
        <nav className="mono foot__links"><a href="#drop">Drop 001</a><a href="#society">Kin Society</a><a href="#members">Members</a><a href="#yard">The Yard</a></nav>
        <span className="code">EST. MMXXVI · CAIRO</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [item, setItem] = useState(null);
  const [size, setSize] = useState('M');
  const [desktop, setDesktop] = useState(false);
  const done = useMemo(() => () => setReady(true), []);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
    const on = () => setDesktop(mq.matches); on(); mq.addEventListener('change', on);
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000); gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
    const onClick = (e) => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const el = document.querySelector(a.getAttribute('href')); if (el) { e.preventDefault(); lenis.scrollTo(el, { duration: 1.3 }); } };
    document.addEventListener('click', onClick);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); document.removeEventListener('click', onClick); mq.removeEventListener('change', on); };
  }, []);
  return (
    <div className="dark ks">
      {!ready && <Preloader onDone={done} />}
      {desktop && <TargetCursor cursorColor="#C4C6CA" spinDuration={3} blendMode="difference" size={30} cornerSize={9} thickness={2} />}
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Manifesto />
        <Drop onOpen={(it) => { setItem(it); setSize('M'); }} />
        <Society />
        <Members />
        <Yard />
      </main>
      <Footer />
      <Sheet open={!!item} onOpenChange={(o) => !o && setItem(null)}>
        <SheetContent className="qv">
          {item && (<>
            <SheetHeader>
              <span className="code code--red">[ {item.code} ]</span>
              <SheetTitle className="qv__t">{item.name}</SheetTitle>
              <SheetDescription className="qv__d">{item.line}</SheetDescription>
            </SheetHeader>
            <div className={`qv__img ${item.cut ? 'qv__img--cut' : ''}`}><img src={A(item.back || item.front)} alt={item.name} /></div>
            <div className="qv__body">
              <span className="mono">SIZE</span>
              <ToggleGroup type="single" value={size} onValueChange={(v) => v && setSize(v)} className="qv__sizes">
                {SIZES.map((s) => <ToggleGroupItem key={s} value={s} className="qv__size" aria-label={`Size ${s}`}>{s}</ToggleGroupItem>)}
              </ToggleGroup>
              <span className="mono qv__note">PRICE AT THE YARD · COLLECT ON 11.26</span>
            </div>
            <SheetFooter>
              <Button className="pill pill--red w-full" onClick={() => { toast(`${item.name} · ${size} held`, { description: 'Collect it at The Yard on 11.26. (Demo)' }); setItem(null); }}>Hold my size · {size}</Button>
            </SheetFooter>
          </>)}
        </SheetContent>
      </Sheet>
      <Toaster position="bottom-left" />
    </div>
  );
}
