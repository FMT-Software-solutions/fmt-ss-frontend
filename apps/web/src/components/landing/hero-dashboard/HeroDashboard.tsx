import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Package,
  Printer,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { ChurchScreen, PrintScreen, StockScreen } from "./screens";
import { ease } from "./anim";

const SCREENS = [
  {
    app: "StockFlow",
    branch: "Accra Central",
    icon: Package,
    Screen: StockScreen,
    nav: ["Dashboard", "Products", "Sales", "Customers", "Reports"],
  },
  {
    app: "Print Suite Pro",
    branch: "Osu Branch",
    icon: Printer,
    Screen: PrintScreen,
    nav: ["Job tracker", "Calculator", "Invoices", "Customers", "Reports"],
  },
  {
    app: "Church Hub 360",
    branch: "Grace Chapel · Main",
    icon: Users,
    Screen: ChurchScreen,
    nav: ["Overview", "People", "Attendance", "Finance", "Events"],
  },
];

// The app is drawn at this size and scaled to fit, so it looks identical on
// every screen width.
const NAV_ICONS = [LayoutDashboard, Package, Wallet, Users, BarChart3];

const CANVAS_W = 1240;
const CANVAS_H = 790;
const SLIDE_MS = 6500;

/**
 * The homepage hero: a laptop showing our apps, built in code rather than a
 * screenshot so it stays sharp, animated and on-brand. Cycles through the
 * apps; tabs switch directly; hovering pauses.
 */
export function HeroDashboard() {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / CANVAS_W),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setTimeout(
      () => setActive((i) => (i + 1) % SCREENS.length),
      SLIDE_MS,
    );
    return () => clearTimeout(t);
  }, [active, paused, reduce]);

  const current = SCREENS[active];
  const Screen = current.Screen;

  return (
    <div
      className="relative mx-auto w-full max-w-5xl text-left"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glow behind the device */}
      <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-10 rounded-[40px] bg-primary/25 blur-3xl" />

      {/* Lid */}
      <div className="relative rounded-[22px] bg-linear-to-b from-neutral-700 to-neutral-900 p-[1.1%] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
        <div className="absolute left-1/2 top-[0.45%] h-[0.6%] w-[0.6%] min-h-1 min-w-1 -translate-x-1/2 rounded-full bg-neutral-600" />
        <div
          ref={boxRef}
          className="relative overflow-hidden rounded-[10px] bg-slate-50"
          style={{ height: CANVAS_H * scale }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${scale})`,
            }}
          >
            <MotionConfig reducedMotion="user">
              <AppWindow
                active={active}
                onSelect={setActive}
                paused={paused || !!reduce}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.app}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <Screen />
                  </motion.div>
                </AnimatePresence>
              </AppWindow>
            </MotionConfig>
          </div>
        </div>
      </div>

      {/* Base */}
      <div className="relative mx-auto h-[14px] w-[112%] -translate-x-[5.4%] rounded-b-[18px] bg-linear-to-b from-neutral-300 to-neutral-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] sm:h-[18px]">
        <div className="absolute left-1/2 top-0 h-[40%] w-[14%] -translate-x-1/2 rounded-b-lg bg-neutral-400" />
      </div>
    </div>
  );
}

function AppWindow({
  active,
  onSelect,
  paused,
  children,
}: {
  active: number;
  onSelect: (i: number) => void;
  paused: boolean;
  children: React.ReactNode;
}) {
  const current = SCREENS[active];
  const AppIcon = current.icon;
  return (
    <div className="flex h-full font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-5">
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={current.app}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm"
            >
              <AppIcon className="h-[18px] w-[18px]" />
            </motion.span>
          </AnimatePresence>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{current.app}</p>
            <p className="truncate text-[11px] text-slate-500">
              {current.branch}
            </p>
          </div>
        </div>
        {current.nav
          .map((label, i) => ({ label, icon: NAV_ICONS[i] }))
          .map(({ icon: Icon, label }, i) => (
            <div
              key={label + i}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] ${i === 0 ? "bg-primary/10 font-semibold text-primary" : "text-slate-500"}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </div>
          ))}
        <div className="mt-auto rounded-xl bg-slate-50 p-3">
          <p className="text-[12px] font-semibold text-slate-700">Synced</p>
          <p className="text-[11px] text-slate-500">All branches up to date</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar with the app tabs */}
        <header className="flex h-[62px] shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white px-6">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {SCREENS.map((s, i) => (
              <button
                key={s.app}
                type="button"
                onClick={() => onSelect(i)}
                className={`relative overflow-hidden rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors ${i === active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {s.app}
                {i === active && !paused && (
                  <motion.span
                    key={`progress-${active}`}
                    className="absolute bottom-0 left-0 h-[2px] bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-slate-400">
            <Search className="h-4 w-4" />
            Search
          </div>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
            </span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[12px] font-semibold text-white">
            AK
          </span>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden p-6">{children}</main>
      </div>
    </div>
  );
}
