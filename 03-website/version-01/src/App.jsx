import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from './bits/SplitText';
import ScrollVelocity from './bits/ScrollVelocity';
import ScrollReveal from './bits/ScrollReveal';
import DecryptedText from './bits/DecryptedText';
import Magnet from './bits/Magnet';
import Noise from './bits/Noise';
import TargetCursor from './bits/TargetCursor';
import GlareHover from './bits/GlareHover';
import { ANVIL_D, ANVIL_VB, WORD_D, WORD_VB } from './logoPaths';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const A = (f) => `/assets/${f}`;
const PIECES = [
  { no: '01', name: 'Wide-Leg Track Pant', who: 'Unisex', fabric: '380 gsm brushed fleece', grade: 4, img: 'piece-01.webp', cw: 'BLK / BONE' },
  { no: '02', name: 'Flare Track Pant', who: 'Women', fabric: '300 gsm brushed interlock', grade: 3, img: 'piece-02.webp', cw: 'ROSE / BURG' },
  { no: '03', name: 'Compression Tee', who: 'Men', fabric: '220 gsm 4-way stretch', grade: 3, img: 'piece-03.webp', cw: 'BLK / BONE' },
  { no: '04', name: 'Heavyweight Hoodie', who: 'Unisex', fabric: '450 gsm brushed fleece', grade: 5, img: 'piece-04.webp', cw: 'BLK / BONE' },
  { no: '05', name: 'Fitted Crop Tee', who: 'Women', fabric: '200 gsm stretch jersey', grade: 2, img: 'piece-05.webp', cw: 'ROSE / BURG' }
];
const SESSIONS = [
  { img: 'session-lift.webp', s: 'SESSION 001', sport: 'LIFT', t: '05:38', line: 'Trained in first. Sold second.' },
  { img: 'session-box.webp', s: 'SESSION 014', sport: 'BOX', t: '21:40', line: 'Last round, then home.' },
  { img: 'session-run.webp', s: 'SESSION 007', sport: 'RUN', t: '06:10', line: 'Before work.' },
  { img: 'session-court.webp', s: 'SESSION 011', sport: 'COURT', t: '19:30', line: 'Same kit. Different floor.' },
  { img: 'session-sprint.webp', s: 'SESSION 009', sport: 'SPRINT', t: '06:45', line: 'Stairs x 6.' },
  { img: 'session-crew.webp', s: 'SESSION 021', sport: 'THE KIN', t: '07:15', line: 'Forged together.' }
];
const CITIES = [['CAI', '20:00'], ['DXB', '22:00'], ['RUH', '21:00'], ['LDN', '18:00'], ['NYC', '13:00']];
const DROP = new Date('2026-12-12T20:00:00+02:00');
const CALLOUTS = [
  { x: 50, y: 6, side: 'L', n: '01', t: 'Hood', d: 'Double-layer, no drawcord' },
  { x: 17, y: 30, side: 'L', n: '02', t: 'Dropped shoulder', d: 'Bone flatlock seam' },
  { x: 66, y: 34, side: 'R', n: '03', t: 'Anvil', d: 'Tonal embroidery' },
  { x: 50, y: 66, side: 'R', n: '04', t: 'Pocket', d: 'Bar-tacked, bone stitch' },
  { x: 8, y: 90, side: 'L', n: '05', t: 'Cuff', d: '2x2 rib, 8 cm' },
  { x: 50, y: 95, side: 'R', n: '06', t: 'Hem', d: 'Rib, bone tipping' }
];

/* ---------------------------------------------------------------- small parts */
const Anvil = ({ className = '', fill = 'currentColor' }) => (
  <svg className={className} viewBox={ANVIL_VB} aria-hidden="true"><path d={ANVIL_D} fill={fill} fillRule="evenodd" /></svg>
);
const Logo = ({ className = '' }) => (
  <span className={`logo ${className}`} aria-label="IRONKIN">
    <Anvil className="logo__anvil" />
    <svg className="logo__word" viewBox={WORD_VB} aria-hidden="true"><path d={WORD_D} fill="currentColor" fillRule="evenodd" /></svg>
  </span>
);
const Code = ({ children, className = '' }) => <span className={`code ${className}`}><i />{children}</span>;
const Grade = ({ n }) => (
  <span className="grade" aria-label={`Forge grade ${n} of 5`}>
    <span className="grade__bars">{[0, 1, 2, 3, 4].map((k) => <b key={k} className={k < n ? 'on' : ''} />)}</span>
    <span className="grade__txt">FORGE GRADE {String(n).padStart(2, '0')} / 05</span>
  </span>
);
const Corners = () => <span className="corners" aria-hidden="true"><i /><i /><i /><i /></span>;
const Plate = ({ children, red = false }) => <span className={`plate ${red ? 'plate--red' : ''}`}><i />{children}<i /></span>;

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const ms = Math.max(0, target - now);
  const p = (v) => String(v).padStart(2, '0');
  return { d: p(Math.floor(ms / 864e5)), h: p(Math.floor(ms / 36e5) % 24), m: p(Math.floor(ms / 6e4) % 60), s: p(Math.floor(ms / 1e3) % 60) };
}

/* ---------------------------------------------------------------- sections */
function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="nav__logo cursor-target" data-cursor-label="HOME"><Logo /></a>
      <nav className="nav__links">
        <a href="#collection" className="cursor-target" data-cursor-label="FRG-01">Collection 001</a>
        <a href="#floor" className="cursor-target">The Forge Floor</a>
        <a href="#spec" className="cursor-target">Spec</a>
        <a href="#sessions" className="cursor-target">Sessions</a>
        <a href="#kin" className="cursor-target">The Kin</a>
      </nav>
      <a href="#kin" className="nav__bag cursor-target">Bag (0)</a>
    </header>
  );
}

function Hero() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.from('.hero__model', { yPercent: 8, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.35 });
    gsap.from('.hero__meta > *', { y: 24, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', delay: 0.9 });
    gsap.from('.hero .corners i', { scale: 0, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'back.out(2)', delay: 1.1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    tl.to('.hero__type', { yPercent: -18, scale: 1.08, ease: 'none' }, 0)
      .to('.hero__model', { yPercent: 6, scale: 0.94, ease: 'none' }, 0)
      .to('.hero__meta', { opacity: 0, y: -40, ease: 'none' }, 0);
  }, { scope: root });
  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__type">
        <SplitText text="IRONKIN" tag="h1" className="hero__h1" splitType="chars" delay={45} duration={1.4} trigger="load" textAlign="center" />
      </div>
      <div className="hero__stage">
        <img className="hero__model" src={A('model-hoodie.webp')} alt="Athlete in the IRONKIN heavyweight hoodie and wide-leg track pant" />
        <Corners />
        <span className="hero__shadow" />
      </div>
      <div className="hero__meta">
        <div className="hero__left">
          <p className="eyebrow">Collection 001 · Drops 12.12.26</p>
          <h2 className="display hero__line">Heavy. Quiet. Exact.</h2>
        </div>
        <div className="hero__right cursor-target" data-cursor-label="FRG-0104">
          <Code>FRG-0104&nbsp;&nbsp;Heavyweight Hoodie</Code>
          <span className="mono muted">450 GSM · BRUSHED FLEECE · BLK / BONE</span>
          <Grade n={5} />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  return (
    <section className="marquee" aria-label="Collection 001">
      <ScrollVelocity
        texts={['Collection 001 — Forged together — Drop 12.12.26 —', 'Lift · Run · Box · Court · Sprint · Lift · Run · Box · Court · Sprint ·']}
        velocity={60} className="marquee__text" numCopies={6} />
    </section>
  );
}

function Manifesto() {
  return (
    <section className="manifesto">
      <Code className="manifesto__code">FRG-01 · MANIFESTO</Code>
      <ScrollReveal baseOpacity={0.12} enableBlur blurStrength={6} baseRotation={2} textClassName="manifesto__text">
        Five pieces. Built heavy, documented like tools, staged like an installation. We train in every one before it is sold. Iron is the work. Kin is the people. Forged together.
      </ScrollReveal>
    </section>
  );
}

function ForgeFloor() {
  const root = useRef(null);
  const c = useCountdown(DROP);
  useGSAP(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=140%', scrub: 1, pin: true } });
    tl.fromTo('.floor__img', { scale: 1.45, filter: 'brightness(0.55)' }, { scale: 1, filter: 'brightness(1)', ease: 'none' }, 0)
      .from('.floor__title span', { yPercent: 110, stagger: 0.12, ease: 'power3.out' }, 0.25)
      .from('.floor__plates > *', { y: 40, opacity: 0, stagger: 0.06, ease: 'power3.out' }, 0.45)
      .from('.floor__count', { opacity: 0, y: 20 }, 0.6);
  }, { scope: root });
  return (
    <section className="floor" id="floor" ref={root}>
      <div className="floor__media"><img className="floor__img" src={A('forge-floor.webp')} alt="Collection 001 laid out on a concrete floor in the shape of the IRONKIN anvil" /></div>
      <div className="floor__shade" />
      <div className="floor__ui">
        <Code className="on-dark">THE FORGE FLOOR · COLLECTION 001</Code>
        <h2 className="floor__title display">
          <span>172 pieces.</span>
          <span className="red">One anvil.</span>
        </h2>
        <div className="floor__bottom">
          <div className="floor__plates">
            {CITIES.map(([city, t]) => <Plate key={city}>{city} {t}</Plate>)}
            <Plate red>12.12.26</Plate>
          </div>
          <div className="floor__count mono" aria-live="polite">
            <span className="muted">DROP 001 IN</span>
            <strong>{c.d}<em>D</em> {c.h}<em>H</em> {c.m}<em>M</em> {c.s}<em>S</em></strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function Catalogue() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.from('.card', { y: 80, opacity: 0, stagger: 0.09, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
  }, { scope: root });
  return (
    <section className="catalogue" id="collection" ref={root}>
      <div className="sec-head">
        <Code>FRG-01 · CATALOGUE</Code>
        <SplitText text="Collection 001" tag="h2" className="display sec-title" splitType="chars" delay={30} textAlign="left" />
        <p className="sec-sub">Five pieces. Each one coded, graded and trained in for six weeks before it went on sale.</p>
      </div>
      <div className="cards">
        {PIECES.map((p) => (
          <article key={p.no} className="card cursor-target" data-cursor-label={`FRG-01${p.no}`}>
            <GlareHover background="transparent" borderRadius="0px" glareColor="#ffffff" glareOpacity={0.35} glareSize={60} width="100%" height="100%">
              <div className="card__img"><img src={A(p.img)} alt={p.name} loading="lazy" /></div>
            </GlareHover>
            <div className="card__body">
              <Code>FRG-01{p.no}</Code>
              <h3 className="display card__name">{p.name}</h3>
              <p className="mono muted card__fab">{p.fabric.toUpperCase()} · {p.who.toUpperCase()}</p>
              <p className="mono card__cw">{p.cw}</p>
              <Grade n={p.grade} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Spec() {
  const root = useRef(null);
  useGSAP(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', scrub: 1, pin: true } });
    tl.from('.spec__img', { scale: 0.86, opacity: 0, ease: 'power2.out' }, 0)
      .from('.spec__grid', { opacity: 0 }, 0);
    gsap.utils.toArray('.callout', root.current).forEach((el, k) => {
      tl.from(el.querySelector('.callout__line'), { scaleX: 0, ease: 'power2.out' }, 0.2 + k * 0.12)
        .from(el.querySelectorAll('.callout__dot, .callout__txt'), { opacity: 0, y: 8, ease: 'power2.out' }, 0.28 + k * 0.12);
    });
  }, { scope: root });
  return (
    <section className="spec" id="spec" ref={root}>
      <div className="spec__info">
        <Code className="spec__code">FRG-0104</Code>
        <h2 className="display spec__title">Heavyweight<br />Hoodie</h2>
        <ul className="mono spec__list">
          <li>450 GSM BRUSHED-BACK FLEECE</li><li>100% COTTON, GARMENT-DYED</li><li>BOXY FIT, DROPPED SHOULDER</li>
          <li>SIZES XS–XL · UNISEX</li><li>BLK / BONE · BONE / BLK</li>
        </ul>
        <Grade n={5} />
        <p className="spec__note"><span className="mono red">THE FORGE GRADE</span> How much abuse a piece is built for. 05 = platform, chalk, every day for years. Rated in-house after six weeks of wear testing.</p>
      </div>
      <div className="spec__stage">
        <div className="spec__grid" />
        <div className="spec__frame">
          <img className="spec__img" src={A('piece-04.webp')} alt="Heavyweight hoodie flat, front view" />
          {CALLOUTS.map((c) => (
            <div key={c.n} className={`callout callout--${c.side}`} style={{ left: `${c.x}%`, top: `${c.y}%`, '--reach': `calc(${c.side === 'L' ? c.x : 100 - c.x}cqw + 28px)` }}>
              <i className="callout__dot" />
              <span className="callout__line" />
              <span className="callout__txt"><b className="mono red">{c.n}</b><span className="mono">{c.t.toUpperCase()} · {c.d.toUpperCase()}</span></span>
            </div>
          ))}
          <Corners />
        </div>
      </div>
    </section>
  );
}

function Sessions() {
  const root = useRef(null);
  const track = useRef(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const dist = () => track.current.scrollWidth - window.innerWidth + 80;
      gsap.to(track.current, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: 1, pin: true, invalidateOnRefresh: true } });
    });
  }, { scope: root });
  return (
    <section className="sessions" id="sessions" ref={root}>
      <div className="sessions__head">
        <Code className="on-dark">ONE KIT · EVERY SESSION</Code>
        <h2 className="display sessions__title">Lift. Run. Box.<br />Court. Sprint.</h2>
      </div>
      <div className="sessions__track" ref={track}>
        {SESSIONS.map((s) => (
          <figure key={s.s} className="shot cursor-target" data-cursor-label={`${s.sport} · ${s.t}`}>
            <img src={A(s.img)} alt={`${s.sport} session in IRONKIN Collection 001`} loading="lazy" />
            <figcaption>
              <span className="shot__line">{s.line}</span>
              <span className="mono shot__tag"><i />{s.s} · {s.sport} · {s.t}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Kin() {
  const [sent, setSent] = useState(false);
  return (
    <section className="kin" id="kin">
      <div className="kin__copy">
        <Code className="on-dark">THE KIN · MEMBERS FIRST</Code>
        <h2 className="display kin__title">Get your<br />Kin number.</h2>
        <p className="kin__sub">The first 500 get a number for life: early access to every drop, the sessions, first look at Collection 002. It's stamped on your hangtag.</p>
        {sent ? (
          <p className="mono kin__ok">You're on the list. Your number arrives with Drop 001.</p>
        ) : (
          <form className="kin__form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <label htmlFor="email" className="sr">Email</label>
            <input id="email" type="email" required placeholder="EMAIL ADDRESS" autoComplete="email" />
            <Magnet padding={60} magnetStrength={4}>
              <button type="submit" className="btn btn--red cursor-target">Claim a number</button>
            </Magnet>
          </form>
        )}
      </div>
      <div className="kin__card cursor-target" data-cursor-label="KIN No. 0001">
        <div className="kin__cardtop"><Anvil className="kin__anvil" /><span className="mono">THE KIN</span></div>
        <DecryptedText text="No. 0001" animateOn="view" sequential revealDirection="start" speed={60} className="kin__no" encryptedClassName="kin__no kin__no--enc" characters="0123456789" />
        <span className="mono red">MEMBER SINCE COLLECTION 001 · DAY 001</span>
        <span className="mono muted">IRON IS THE WORK. KIN IS THE PEOPLE.</span>
        <Plate>KIN 0001</Plate>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="foot__big display">Forged<br />together.</div>
      <div className="foot__row">
        <Logo className="foot__logo" />
        <nav className="foot__links mono">
          <a href="#collection">Collection 001</a><a href="#floor">The Forge Floor</a><a href="#spec">Spec</a><a href="#kin">The Kin</a>
        </nav>
        <Code>EST. 2026 · CAIRO</Code>
      </div>
    </footer>
  );
}

export default function App() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
    const on = () => setDesktop(mq.matches); on(); mq.addEventListener('change', on);
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const el = document.querySelector(a.getAttribute('href')); if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: 0, duration: 1.4 }); }
    }));
    return () => { gsap.ticker.remove(raf); lenis.destroy(); mq.removeEventListener('change', on); };
  }, []);
  return (
    <>
      {desktop && <TargetCursor cursorColor="#B3202B" spinDuration={3} blendMode="normal" size={34} cornerSize={10} thickness={2} />}
      <Noise opacity={0.06} fixed blendMode="multiply" zIndex={60} />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <ForgeFloor />
        <Catalogue />
        <Spec />
        <Sessions />
        <Kin />
      </main>
      <Footer />
    </>
  );
}
