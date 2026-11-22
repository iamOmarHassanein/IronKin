import { useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import { animate, createTimeline, stagger, svg, onScroll, utils } from 'animejs';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ArrowUpRight, Play, Pause, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { ANVIL_D, ANVIL_VB, WORD_D, WORD_VB } from './logoPaths';

const A = (f) => `/assets/${f}`;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PIECES = [
  { no: '04', name: 'Heavyweight Hoodie', who: 'Unisex', fabric: '450 gsm brushed fleece, 100% cotton', grade: 5, img: 'piece-04.webp', tone: '#1a1918', ink: '#eee7dc', cw: 'BLK / BONE', line: 'The one we train in first.' },
  { no: '01', name: 'Wide-Leg Track Pant', who: 'Unisex', fabric: '380 gsm brushed fleece, 80/20 cotton-poly', grade: 4, img: 'piece-01.webp', tone: '#d9d2c5', ink: '#0b0b0a', cw: 'BLK / BONE', line: 'Cut wide for the walk home.' },
  { no: '02', name: 'Flare Track Pant', who: 'Women', fabric: '300 gsm brushed interlock, 88/12 poly-elastane', grade: 3, img: 'piece-02.webp', tone: '#a46363', ink: '#f4ece4', cw: 'ROSE / BURG', line: 'Holds its line through the last set.' },
  { no: '03', name: 'Compression Tee', who: 'Men', fabric: '220 gsm 4-way stretch, 78/22 poly-elastane', grade: 3, img: 'piece-03.webp', tone: '#2a2a28', ink: '#eee7dc', cw: 'BLK / BONE', line: 'Second skin, bone flatlock seams.' },
  { no: '05', name: 'Fitted Crop Tee', who: 'Women', fabric: '200 gsm stretch jersey, 92/8 cotton-elastane', grade: 2, img: 'piece-05.webp', tone: '#791f26', ink: '#f4ece4', cw: 'ROSE / BURG', line: 'Short, fitted, made to move.' }
];
const HERO = [
  { img: 'session-street.webp', tag: 'SESSION 001 · LIFT · 05:38', where: 'Walking home' },
  { img: 'session-box.webp', tag: 'SESSION 014 · BOX · 21:40', where: 'Under the bridge' },
  { img: 'session-run.webp', tag: 'SESSION 007 · RUN · 06:10', where: 'Before work' },
  { img: 'session-court.webp', tag: 'SESSION 011 · COURT · 19:30', where: 'Same kit, different floor' },
  { img: 'session-crew.webp', tag: 'SESSION 021 · THE KIN · 07:15', where: 'Forged together' }
];
const FILM = [
  { t: [0, 4], img: 'session-street.webp', beat: 'Hood up. The clock says 05:41.', sound: 'Zip. Breath. Distant traffic.' },
  { t: [4, 9], img: 'session-run.webp', beat: 'Out into blue dawn, running for the tram.', sound: 'Feet on wet pavement.' },
  { t: [9, 13], img: 'street-wide.webp', beat: 'The tram pulls away. He looks to the footbridge.', sound: 'Tram bell. Doors hiss.' },
  { t: [13, 20], img: 'session-sprint.webp', beat: 'Up the stairs, two at a time.', sound: 'Breath louder. Bag on the same shoulder.' },
  { t: [20, 25], img: 'session-lift.webp', beat: 'Across the road the shutter starts to rise.', sound: 'Shutter rattle.' },
  { t: [25, 30], img: 'session-crew.webp', beat: 'The crew is already there. One nod. Six o’clock.', sound: 'Room tone.' }
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

/* ---------------------------------------------------------------- parts */
const Anvil = ({ className = '', id }) => (
  <svg className={className} viewBox={ANVIL_VB} aria-hidden="true"><path id={id} d={ANVIL_D} fillRule="evenodd" /></svg>
);
const Logo = ({ className = '' }) => (
  <span className={`ik-logo ${className}`} aria-label="IRONKIN">
    <Anvil className="ik-logo__anvil" />
    <svg className="ik-logo__word" viewBox={WORD_VB} aria-hidden="true"><path d={WORD_D} fillRule="evenodd" /></svg>
  </span>
);
const Code = ({ children, className = '' }) => <span className={`ik-code ${className}`}><i />{children}</span>;
const Grade = ({ n, className = '' }) => (
  <span className={`ik-grade ${className}`} aria-label={`Forge grade ${n} of 5`}>
    <span className="ik-grade__bars">{[0, 1, 2, 3, 4].map((k) => <b key={k} className={k < n ? 'on' : ''} />)}</span>
    <span className="ik-grade__txt">FORGE GRADE {String(n).padStart(2, '0')} / 05</span>
  </span>
);

/* ---------------------------------------------------------------- preloader (anime.js: draw the anvil, count, lift) */
function Preloader({ onDone }) {
  const root = useRef(null);
  useEffect(() => {
    if (reduced()) { onDone(); return; }
    const count = { v: 0 };
    const [drawable] = svg.createDrawable('#loader-anvil');
    const tl = createTimeline({ defaults: { ease: 'inOutQuart' }, onComplete: onDone });
    tl.add(drawable, { draw: ['0 0', '0 1'], duration: 1300 }, 0)
      .add(count, { v: 100, duration: 1500, ease: 'outQuad', modifier: utils.round(0),
        onUpdate: () => { const el = root.current?.querySelector('.loader__count'); if (el) el.textContent = String(count.v).padStart(3, '0'); } }, 0)
      .add('#loader-anvil', { fillOpacity: [0, 1], duration: 400 }, 1250)
      .add('.loader__word span', { y: ['110%', '0%'], delay: stagger(40), duration: 600, ease: 'outExpo' }, 1100)
      .add(root.current, { clipPath: ['inset(0 0 0% 0)', 'inset(0 0 100% 0)'], duration: 900, ease: 'inOutExpo' }, 2000);
    return () => tl.pause();
  }, [onDone]);
  return (
    <div className="loader" ref={root} aria-hidden="true">
      <svg className="loader__anvil" viewBox={ANVIL_VB}><path id="loader-anvil" d={ANVIL_D} fillRule="evenodd" /></svg>
      <div className="loader__word">{'IRONKIN'.split('').map((c, k) => <span key={k}>{c}</span>)}</div>
      <div className="loader__count">000</div>
    </div>
  );
}

/* ---------------------------------------------------------------- nav + bag */
function Nav({ bag, setBag }) {
  const total = bag.reduce((s, i) => s + i.qty, 0);
  return (
    <header className="nav">
      <a href="#top" aria-label="IRONKIN home"><Logo /></a>
      <nav className="nav__links">
        <a href="#collection">Collection 001</a><a href="#film">Film 001</a><a href="#grade">Forge Grade</a><a href="#kin">The Kin</a>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="pill pill--glass"><ShoppingBag className="size-4" /> Bag ({total})</Button>
        </SheetTrigger>
        <SheetContent className="ik-sheet">
          <SheetHeader>
            <SheetTitle className="ik-sheet__title">Your bag</SheetTitle>
            <SheetDescription className="ik-sheet__desc">Collection 001 drops 12.12.26. Items are held until then.</SheetDescription>
          </SheetHeader>
          <div className="bag">
            {bag.length === 0 && <p className="mono muted">EMPTY. ONE KIT, EVERY SESSION.</p>}
            {bag.map((i) => (
              <div key={i.key} className="bag__row">
                <img src={A(i.img)} alt="" />
                <div><Code>FRG-01{i.no}</Code><p className="bag__name">{i.name}</p><p className="mono muted">SIZE {i.size} · QTY {i.qty}</p></div>
                <button className="bag__x mono" onClick={() => setBag((b) => b.filter((x) => x.key !== i.key))} aria-label={`Remove ${i.name}`}>REMOVE</button>
              </div>
            ))}
          </div>
          <SheetFooter>
            <Button className="pill pill--red w-full" disabled={!bag.length} onClick={() => toast('Checkout opens at the drop', { description: 'We’ll email you at 20:00 Cairo, 12.12.26.' })}>Reserve for the drop</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
}

/* ---------------------------------------------------------------- hero (motion crossfade + anime.js headline) */
function Hero({ ready }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % HERO.length), 4800); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!ready) return;
    if (reduced()) { utils.set('.hero__line span, .hero__fade', { opacity: 1, y: 0 }); return; }
    animate('.hero__line span', { y: ['105%', '0%'], delay: stagger(28, { start: 100 }), duration: 1000, ease: 'outExpo' });
    animate('.hero__fade', { opacity: [0, 1], y: [24, 0], delay: stagger(90, { start: 600 }), duration: 900, ease: 'outExpo' });
  }, [ready]);
  const s = HERO[i];
  const chars = (t) => t.split('').map((c, k) => <span key={k}>{c === ' ' ? ' ' : c}</span>);
  return (
    <section className="hero" id="top">
      <div className="hero__frame">
        <AnimatePresence mode="popLayout">
          <motion.img key={s.img} src={A(s.img)} alt={`${s.where}: IRONKIN Collection 001`} className="hero__img"
            initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.1 }, scale: { duration: 5.5, ease: 'linear' } }} />
        </AnimatePresence>
        <div className="hero__shade" />
        <div className="hero__ui">
          <div className="hero__top hero__fade">
            <Badge className="ik-badge"><i /> Drop 001 · 12.12.26</Badge>
          </div>
          <div className="hero__bottom">
            <h1 className="hero__h1" aria-label="One kit. Every session.">
              <span className="hero__line">{chars('ONE KIT.')}</span>
              <span className="hero__line hero__line--muted">{chars('EVERY SESSION.')}</span>
            </h1>
            <div className="hero__side">
              <p className="hero__sub hero__fade">Five pieces built heavy enough for the platform and clean enough for the street. Trained in for six weeks before they went on sale.</p>
              <div className="hero__ctas hero__fade">
                <Button asChild className="pill pill--light"><a href="#collection">Shop Collection 001 <span className="pill__chip"><ArrowUpRight className="size-4" /></span></a></Button>
                <Button asChild variant="ghost" className="pill pill--ghost"><a href="#film"><Play className="size-4" /> Watch Film 001</a></Button>
              </div>
            </div>
          </div>
          <div className="hero__index hero__fade">
            <AnimatePresence mode="wait">
              <motion.span key={s.tag} className="mono hero__tag" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
                <i /> {s.tag} · {s.where.toUpperCase()}
              </motion.span>
            </AnimatePresence>
            <div className="hero__dots">
              {HERO.map((h, k) => (
                <button key={h.img} onClick={() => setI(k)} aria-label={`Show ${h.where}`} className={k === i ? 'on' : ''}>
                  {k === i && <motion.b layoutId="heroDot" className="hero__dotfill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- collection: colour-crossfade carousel + quick view sheet */
function Collection({ addToBag }) {
  const [i, setI] = useState(0);
  const [size, setSize] = useState('M');
  const p = PIECES[i];
  const go = (d) => setI((v) => (v + d + PIECES.length) % PIECES.length);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (reduced()) return;
    animate('.col__grade .ik-grade__bars b', { scaleX: [0, 1], delay: stagger(70), duration: 500, ease: 'outBack(1.6)' });
  }, [i]);
  return (
    <motion.section className="col" id="collection" animate={{ backgroundColor: p.tone, color: p.ink }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
      <div className="col__head">
        <Code>FRG-01 · COLLECTION 001</Code>
        <span className="mono">{String(i + 1).padStart(2, '0')} / {String(PIECES.length).padStart(2, '0')}</span>
      </div>
      <div className="col__stage">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.h2 key={p.name} className="col__ghost" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 0.13, y: 0 }} exit={{ opacity: 0, y: -60 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            {p.name.split(' ').slice(-1)[0]}
          </motion.h2>
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img key={p.img} src={A(p.img)} alt={p.name} className="col__img"
            initial={{ opacity: 0, x: 120, rotate: 4 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -120, rotate: -4 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        </AnimatePresence>
        <button className="col__arrow col__arrow--l" onClick={() => go(-1)} aria-label="Previous piece"><ChevronLeft /></button>
        <button className="col__arrow col__arrow--r" onClick={() => go(1)} aria-label="Next piece"><ChevronRight /></button>
      </div>
      <div className="col__info">
        <div>
          <Code>FRG-01{p.no}</Code>
          <h3 className="col__name">{p.name}</h3>
          <p className="col__line">{p.line}</p>
        </div>
        <div className="col__meta mono">
          <span>{p.fabric.toUpperCase()}</span><span>{p.who.toUpperCase()} · {p.cw}</span>
          <Grade n={p.grade} className="col__grade" />
        </div>
        <Sheet>
          <SheetTrigger asChild><Button className="pill" style={{ background: p.ink, color: p.tone }}>Quick view <span className="pill__chip" style={{ background: p.tone, color: p.ink }}><ArrowUpRight className="size-4" /></span></Button></SheetTrigger>
          <SheetContent className="ik-sheet ik-sheet--wide">
            <SheetHeader>
              <Code>FRG-01{p.no}</Code>
              <SheetTitle className="ik-sheet__title">{p.name}</SheetTitle>
              <SheetDescription className="ik-sheet__desc">{p.fabric}. {p.who}.</SheetDescription>
            </SheetHeader>
            <div className="qv__img" style={{ background: p.tone }}><img src={A(p.img)} alt={p.name} /></div>
            <div className="qv__body">
              <Grade n={p.grade} />
              <p className="mono muted">SIZE</p>
              <ToggleGroup type="single" value={size} onValueChange={(v) => v && setSize(v)} className="qv__sizes">
                {SIZES.map((s) => <ToggleGroupItem key={s} value={s} aria-label={`Size ${s}`} className="qv__size">{s}</ToggleGroupItem>)}
              </ToggleGroup>
              <p className="mono muted">PRICE AT LAUNCH · {p.cw}</p>
            </div>
            <SheetFooter>
              <Button className="pill pill--red w-full" onClick={() => addToBag(p, size)}>Add to bag · {size}</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <div className="col__thumbs">
        {PIECES.map((q, k) => (
          <button key={q.no} onClick={() => setI(k)} className={`col__thumb ${k === i ? 'on' : ''}`} aria-label={q.name}>
            <img src={A(q.img)} alt="" />
            {k === i && <motion.span layoutId="thumbRing" className="col__ring" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
          </button>
        ))}
      </div>
    </motion.section>
  );
}

/* ---------------------------------------------------------------- film 001: storyboard player (anime.js timeline) */
function Film() {
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tl = useRef(null);
  const clock = useRef(null);
  const root = useRef(null);
  useEffect(() => {
    const t = { s: 0 };
    tl.current = createTimeline({ autoplay: false, loop: true,
      onUpdate: () => {
        const sec = t.s; const k = FILM.findIndex((b) => sec >= b.t[0] && sec < b.t[1]);
        setBeat((prev) => (k >= 0 && k !== prev ? k : prev));
        if (clock.current) clock.current.textContent = `00:${String(Math.floor(sec)).padStart(2, '0')}:${String(Math.floor((sec % 1) * 24)).padStart(2, '0')}`;
      } });
    tl.current.add(t, { s: [0, 30], duration: 30000, ease: 'linear' }, 0)
      .add('.film__bar b', { scaleX: [0, 1], duration: 30000, ease: 'linear' }, 0);
    const obs = onScroll({ target: root.current, enter: 'bottom-=20% top', leave: 'top+=20% bottom',
      onEnter: () => { if (!reduced()) { tl.current.play(); setPlaying(true); } },
      onLeave: () => { tl.current.pause(); setPlaying(false); } });
    return () => { tl.current.pause(); obs.revert(); };
  }, []);
  const toggle = () => { if (playing) tl.current.pause(); else tl.current.play(); setPlaying(!playing); };
  const b = FILM[beat];
  return (
    <section className="film" id="film" ref={root}>
      <div className="film__head">
        <div>
          <Code className="on-dark">FILM 001 · STORYBOARD · IN PRODUCTION</Code>
          <h2 className="film__title">The Six O’Clock</h2>
        </div>
        <p className="film__logline">He has to make the 06:00 crew session. He misses the tram, takes the footbridge stairs instead, and arrives as the shutter rises. The crew is already there, in the same kit.</p>
      </div>
      <div className="film__screen">
        <AnimatePresence mode="popLayout">
          <motion.img key={b.img + beat} src={A(b.img)} alt={b.beat} className="film__img"
            initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1.02 }} exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.6 }, scale: { duration: (b.t[1] - b.t[0]) + 0.6, ease: 'linear' } }} />
        </AnimatePresence>
        <div className="film__bars" />
        <div className="film__hud mono">
          <span className="film__rec"><i /> {playing ? 'PLAYING' : 'PAUSED'}</span>
          <span ref={clock}>00:00:00</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={beat} className="film__caption" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }}>
            <span className="mono">{String(b.t[0]).padStart(2, '0')}–{String(b.t[1]).padStart(2, '0')}s · BEAT {beat + 1} / {FILM.length}</span>
            <p>{b.beat}</p>
            <span className="mono muted">SOUND · {b.sound.toUpperCase()}</span>
          </motion.div>
        </AnimatePresence>
        <button className="film__play" onClick={toggle} aria-label={playing ? 'Pause storyboard' : 'Play storyboard'}>{playing ? <Pause /> : <Play />}</button>
      </div>
      <div className="film__bar"><b /></div>
      <div className="film__beats">
        {FILM.map((f, k) => (
          <button key={k} className={k === beat ? 'on' : ''} onClick={() => { tl.current.seek(f.t[0] * 1000); setBeat(k); }}>
            <span className="mono">{String(f.t[0]).padStart(2, '0')}s</span>{f.beat}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- forge grade: tabs + size guide accordion */
function ForgeGrade() {
  const root = useRef(null);
  useEffect(() => {
    if (reduced()) return;
    const obs = onScroll({ target: root.current, enter: 'bottom-=15% top', onEnter: () =>
      animate('.fg__row .ik-grade__bars b', { scaleX: [0, 1], opacity: [0, 1], delay: stagger(45), duration: 500, ease: 'outBack(1.4)' }) });
    return () => obs.revert();
  }, []);
  return (
    <section className="fg" id="grade" ref={root}>
      <div className="fg__left">
        <Code>THE FORGE GRADE</Code>
        <h2 className="fg__title">Rated like steel.</h2>
        <p className="fg__sub">Every piece gets a grade from 01 to 05 for how much abuse it’s built for. 05 means the platform, chalk and every day for years. We rate in-house after six weeks of wear testing.</p>
        <div className="fg__rows">
          {PIECES.map((p) => (
            <div key={p.no} className="fg__row"><span className="mono">FRG-01{p.no}</span><span className="fg__name">{p.name}</span><Grade n={p.grade} /></div>
          ))}
        </div>
      </div>
      <div className="fg__right">
        <Tabs defaultValue="fabric" className="fg__tabs">
          <TabsList className="fg__tabslist">
            <TabsTrigger value="fabric">Fabric</TabsTrigger><TabsTrigger value="fit">Fit</TabsTrigger><TabsTrigger value="care">Care</TabsTrigger>
          </TabsList>
          <TabsContent value="fabric" className="fg__tab"><p>Brushed-back fleece from 380 to 450 gsm for the outer layers; four-way stretch from 200 to 300 gsm for the second-skin pieces. Bone flatlock seams so nothing rubs under a bar.</p></TabsContent>
          <TabsContent value="fit" className="fg__tab"><p>Tops are cut boxy with a dropped shoulder; the compression tee and crop tee are fitted. Track pants sit at the natural waist. If you are between sizes, size up for tops and stay true for bottoms.</p></TabsContent>
          <TabsContent value="care" className="fg__tab"><p>Wash cold, inside out, with similar colours. Don’t tumble dry, don’t iron the prints. Hang the fleece to dry and it keeps its shape for years.</p></TabsContent>
        </Tabs>
        <Accordion type="single" collapsible className="fg__faq">
          <AccordionItem value="a"><AccordionTrigger>When does Collection 001 drop?</AccordionTrigger><AccordionContent>12.12.26 at 20:00 Cairo time, the same moment worldwide. Kin members get access an hour earlier.</AccordionContent></AccordionItem>
          <AccordionItem value="b"><AccordionTrigger>Will there be restocks?</AccordionTrigger><AccordionContent>Collection 001 is made in small runs. If a size sells out we say so plainly; no fake countdowns.</AccordionContent></AccordionItem>
          <AccordionItem value="c"><AccordionTrigger>What is a Kin number?</AccordionTrigger><AccordionContent>The first 500 people get a permanent number: early access, the sessions, and a first look at Collection 002. It’s stamped on your hangtag.</AccordionContent></AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- the kin */
function Kin() {
  const [open, setOpen] = useState(false);
  const [num] = useState(() => String(37 + Math.floor(Math.random() * 400)).padStart(4, '0'));
  const ref = useRef(null);
  useEffect(() => {
    if (!open || reduced()) return;
    const o = { v: 0 };
    animate(o, { v: Number(num), duration: 1400, ease: 'outExpo', modifier: utils.round(0),
      onUpdate: () => { if (ref.current) ref.current.textContent = `No. ${String(o.v).padStart(4, '0')}`; } });
  }, [open, num]);
  return (
    <section className="kin" id="kin">
      <Anvil className="kin__bg" />
      <Code className="on-dark">THE KIN · MEMBERS FIRST</Code>
      <h2 className="kin__title">Get your<br />Kin number.</h2>
      <p className="kin__sub">500 numbers. Early access to every drop, the sessions, and a first look at Collection 002.</p>
      <form className="kin__form" onSubmit={(e) => { e.preventDefault(); setOpen(true); }}>
        <label htmlFor="kin-email" className="sr-only">Email</label>
        <Input id="kin-email" type="email" required placeholder="Email address" className="kin__input" autoComplete="email" />
        <Button type="submit" className="pill pill--red">Claim a number <span className="pill__chip"><ArrowUpRight className="size-4" /></span></Button>
      </form>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="kin__dialog">
          <DialogHeader>
            <Code>KIN NUMBER · RESERVED</Code>
            <DialogTitle className="kin__no" ref={ref}>No. {num}</DialogTitle>
            <DialogDescription>Held for you until the drop. Preview only: sign-ups aren’t connected yet, so nothing has been sent.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <p className="foot__big">Forged together.</p>
      <Separator className="foot__sep" />
      <div className="foot__row">
        <Logo />
        <nav className="mono foot__links"><a href="#collection">Collection 001</a><a href="#film">Film 001</a><a href="#grade">Forge Grade</a><a href="#kin">The Kin</a></nav>
        <Code>EST. 2026 · CAIRO</Code>
      </div>
    </footer>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [bag, setBag] = useState([]);
  const done = useMemo(() => () => setReady(true), []);
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09 });
    let id; const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); }; id = requestAnimationFrame(raf);
    const onClick = (e) => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const el = document.querySelector(a.getAttribute('href')); if (el) { e.preventDefault(); lenis.scrollTo(el, { duration: 1.3 }); } };
    document.addEventListener('click', onClick);
    return () => { cancelAnimationFrame(id); lenis.destroy(); document.removeEventListener('click', onClick); };
  }, []);
  const addToBag = (p, size) => {
    setBag((b) => {
      const key = `${p.no}-${size}`; const hit = b.find((x) => x.key === key);
      return hit ? b.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x)) : [...b, { key, no: p.no, name: p.name, img: p.img, size, qty: 1 }];
    });
    toast(`${p.name} · ${size}`, { description: 'Added to your bag. Held until the drop.' });
  };
  return (
    <div className="dark ik">
      {!ready && <Preloader onDone={done} />}
      <Nav bag={bag} setBag={setBag} />
      <main>
        <Hero ready={ready} />
        <Collection addToBag={addToBag} />
        <Film />
        <ForgeGrade />
        <Kin />
      </main>
      <Footer />
      <Toaster position="bottom-left" />
    </div>
  );
}
