import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Gift,
  HandCoins,
  Printer,
  Receipt,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { ease } from "./anim";
import {
  AreaChart,
  Avatar,
  Bars,
  Count,
  Kpi,
  Meter,
  Panel,
  Pill,
  Row,
} from "./parts";

// ---------------------------------------------------------------- StockFlow

export function StockScreen() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Kpi
        index={0}
        icon={ShoppingBag}
        label="Today's sales"
        value={<Count to={12480} prefix="GHS " />}
        trend="+18% vs yesterday"
      />
      <Kpi
        index={1}
        icon={Receipt}
        label="Orders"
        value={<Count to={146} />}
        trend="+12 this hour"
      />
      <Kpi
        index={2}
        icon={AlertTriangle}
        label="Low stock"
        value={<Count to={3} suffix=" items" />}
        tone="warn"
      />
      <Kpi
        index={3}
        icon={HandCoins}
        label="Owed by customers"
        value={<Count to={2310} prefix="GHS " />}
        tone="good"
      />

      <Panel
        title="Sales this week"
        action={<Pill tone="primary">All branches</Pill>}
        className="col-span-3"
        delay={0.25}
      >
        <AreaChart
          values={[6200, 7400, 6900, 8800, 8200, 10900, 12480]}
          labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"]}
          highlight={6}
        />
      </Panel>

      <Panel
        title="Low stock"
        action={<Pill tone="amber">Reorder</Pill>}
        delay={0.35}
      >
        {[
          { name: "Frytol Oil 1L", left: 4, pct: 12, tone: "red" as const },
          { name: "Milo 400g", left: 9, pct: 28, tone: "amber" as const },
          {
            name: "Indomie Chicken",
            left: 14,
            pct: 35,
            tone: "amber" as const,
          },
        ].map((p, i) => (
          <Row key={p.name} index={i} base={0.6}>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="truncate font-medium text-slate-800">
                  {p.name}
                </span>
                <span className="text-slate-500">{p.left} left</span>
              </div>
              <Meter value={p.pct} tone={p.tone} delay={0.8 + i * 0.1} />
            </div>
          </Row>
        ))}
      </Panel>

      <Panel title="Recent sales" className="col-span-4" delay={0.45}>
        <div className="grid grid-cols-2 gap-x-8">
          {[
            {
              who: "Ama Mensah",
              what: "3 items · Accra Central",
              amount: "GHS 186.00",
              pay: "MoMo",
            },
            {
              who: "Kwame Boateng",
              what: "1 item · Kumasi",
              amount: "GHS 42.50",
              pay: "Cash",
            },
            {
              who: "Efua Owusu",
              what: "6 items · Tema",
              amount: "GHS 512.00",
              pay: "MoMo",
            },
            {
              who: "Yaw Asante",
              what: "2 items · Accra Central",
              amount: "GHS 96.00",
              pay: "Card",
            },
          ].map((s, i) => (
            <Row key={s.who} index={i} base={0.8}>
              <Avatar name={s.who} tone={i} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-800">
                  {s.who}
                </p>
                <p className="truncate text-[12px] text-slate-500">{s.what}</p>
              </div>
              <Pill
                tone={
                  s.pay === "MoMo"
                    ? "amber"
                    : s.pay === "Card"
                      ? "blue"
                      : "slate"
                }
              >
                {s.pay}
              </Pill>
              <span className="w-24 text-right text-[13px] font-semibold tabular-nums text-slate-900">
                {s.amount}
              </span>
            </Row>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- Print Suite Pro

const JOBS = {
  Quoted: [
    { title: "Banner 10 × 4 ft", client: "Kofi's Bakery", meta: "GHS 480" },
    { title: "Business cards ×500", client: "Adwoa Legal", meta: "GHS 350" },
  ],
  Printing: [
    { title: "Church programme ×300", client: "Grace Chapel", meta: "60%" },
    { title: "Shop sticker 3 × 2 ft", client: "Nana's Mart", meta: "35%" },
  ],
  Ready: [
    { title: "Flyers A5 ×1000", client: "Tema Gym", meta: "Collect" },
    { title: "Rollup banner", client: "Sika Events", meta: "Collect" },
  ],
};

export function PrintScreen() {
  const columns = Object.entries(JOBS);
  return (
    <div className="grid grid-cols-4 gap-4">
      <Kpi
        index={0}
        icon={Printer}
        label="Jobs in progress"
        value={<Count to={18} />}
      />
      <Kpi
        index={1}
        icon={Clock}
        label="Due today"
        value={<Count to={5} />}
        tone="warn"
      />
      <Kpi
        index={2}
        icon={Receipt}
        label="Quoted this week"
        value={<Count to={9850} prefix="GHS " />}
        trend="+24 quotes"
      />
      <Kpi
        index={3}
        icon={Wallet}
        label="Collected"
        value={<Count to={7200} prefix="GHS " />}
        tone="good"
      />

      <Panel
        title="Job board"
        action={<Pill tone="primary">This week</Pill>}
        className="col-span-3"
        delay={0.25}
      >
        <div className="grid grid-cols-3 gap-3">
          {columns.map(([stage, jobs], c) => (
            <div key={stage} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  {stage}
                </span>
                <span className="text-[12px] text-slate-400">
                  {jobs.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {jobs.map((job, j) => (
                  <motion.div
                    key={job.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.5 + c * 0.15 + j * 0.1,
                      ease,
                    }}
                    className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    <p className="text-[13px] font-medium text-slate-800">
                      {job.title}
                    </p>
                    <p className="mb-2 text-[12px] text-slate-500">
                      {job.client}
                    </p>
                    {stage === "Printing" ? (
                      <Meter value={parseInt(job.meta)} delay={0.9 + j * 0.1} />
                    ) : (
                      <Pill tone={stage === "Ready" ? "green" : "slate"}>
                        {job.meta}
                      </Pill>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Quick quote" delay={0.35}>
        <div className="space-y-3 text-[13px]">
          {[
            ["Size", "10 × 4 ft"],
            ["Area", "40 sq ft"],
            ["Rate", "GHS 12 / sq ft"],
          ].map(([k, v], i) => (
            <Row key={k} index={i} base={0.5}>
              <span className="flex-1 text-slate-500">{k}</span>
              <span className="font-medium text-slate-800">{v}</span>
            </Row>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease }}
            className="rounded-xl bg-primary px-4 py-3 text-white"
          >
            <p className="text-[12px] opacity-80">Total</p>
            <p className="text-[22px] font-semibold">
              <Count to={480} prefix="GHS " decimals={2} delay={1.1} />
            </p>
          </motion.div>
        </div>
      </Panel>

      <Panel title="Recent invoices" className="col-span-4" delay={0.45}>
        <div className="grid grid-cols-2 gap-x-8">
          {(
            [
              {
                who: "Kofi Mensah",
                what: "Kofi's Bakery · Banner 10 × 4 ft",
                amount: "GHS 480.00",
                tag: "Paid",
                tone: "green",
              },
              {
                who: "Grace Chapel",
                what: "Church programme ×300",
                amount: "GHS 900.00",
                tag: "Part paid",
                tone: "amber",
              },
              ] as const
          ).map((s, i) => (
            <Row key={s.who} index={i} base={0.8}>
              <Avatar name={s.who} tone={i} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-800">
                  {s.who}
                </p>
                <p className="truncate text-[12px] text-slate-500">{s.what}</p>
              </div>
              <Pill tone={s.tone}>{s.tag}</Pill>
              <span className="w-24 text-right text-[13px] font-semibold tabular-nums text-slate-900">
                {s.amount}
              </span>
            </Row>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- Church Hub 360

function Donut({
  parts,
}: {
  parts: { label: string; value: number; color: string }[];
}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const r = 54;
  const c = 2 * Math.PI * r;
  const lengths = parts.map((p) => (p.value / total) * c);
  const starts = lengths.map((_, i) =>
    lengths.slice(0, i).reduce((s, l) => s + l, 0),
  );
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 140 140"
        className="h-[104px] w-[104px] shrink-0 -rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="18"
        />
        {parts.map((p, i) => {
          const len = lengths[i];
          return (
            <motion.circle
              key={p.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth="18"
              strokeDasharray={`${len} ${c}`}
              initial={{ strokeDashoffset: len }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.9, delay: 0.5 + i * 0.25, ease }}
              style={{
                rotate: (starts[i] / c) * 360,
                transformOrigin: "70px 70px",
              }}
            />
          );
        })}
      </svg>
      <div className="space-y-2.5">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-2 text-[13px]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: p.color }}
            />
            <span className="w-16 text-slate-500">{p.label}</span>
            <span className="font-semibold tabular-nums text-slate-800">
              {Math.round((p.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChurchScreen() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Kpi
        index={0}
        icon={Users}
        label="Members"
        value={<Count to={1248} />}
        trend="+36 this month"
      />
      <Kpi
        index={1}
        icon={CalendarCheck}
        label="Sunday attendance"
        value={<Count to={864} />}
        trend="+6% vs last week"
      />
      <Kpi
        index={2}
        icon={Wallet}
        label="Giving this month"
        value={<Count to={38600} prefix="GHS " />}
        tone="good"
      />
      <Kpi
        index={3}
        icon={CheckCircle2}
        label="Pledges fulfilled"
        value={<Count to={72} suffix="%" />}
      />

      <Panel
        title="Attendance"
        action={<Pill tone="primary">Last 8 Sundays</Pill>}
        className="col-span-2"
        delay={0.25}
      >
        <Bars
          values={[712, 748, 731, 790, 802, 768, 815, 864]}
          labels={["Sep 7", "14", "21", "28", "Oct 5", "12", "19", "26"]}
        />
      </Panel>

      <Panel title="Giving" delay={0.35}>
        <Donut
          parts={[
            { label: "Tithes", value: 21800, color: "var(--primary)" },
            { label: "Offering", value: 10400, color: "#f59e0b" },
            { label: "Pledges", value: 6400, color: "#10b981" },
          ]}
        />
      </Panel>

      <Panel
        title="Birthdays this week"
        action={<Gift className="h-4 w-4 text-primary" />}
        delay={0.45}
      >
        {[
          { name: "Abena Darko", day: "Today" },
          { name: "Samuel Ofori", day: "Thu" },
          { name: "Esi Quaye", day: "Sat" },
        ].map((b, i) => (
          <Row key={b.name} index={i} base={0.7}>
            <Avatar name={b.name} tone={i + 1} />
            <span className="flex-1 text-[13px] font-medium text-slate-800">
              {b.name}
            </span>
            <Pill tone={b.day === "Today" ? "primary" : "slate"}>{b.day}</Pill>
          </Row>
        ))}
      </Panel>

      <Panel title="Recent giving" className="col-span-4" delay={0.45}>
        <div className="grid grid-cols-2 gap-x-8">
          {(
            [
              {
                who: "Kwesi Appiah",
                what: "Tithe · Sunday service",
                amount: "GHS 500.00",
                tag: "MoMo",
                tone: "amber",
              },
              {
                who: "Akosua Frimpong",
                what: "Building fund pledge",
                amount: "GHS 1,200.00",
                tag: "Pledge",
                tone: "primary",
              },
              {
                who: "Nii Armah",
                what: "Offering · Mid-week",
                amount: "GHS 80.00",
                tag: "Cash",
                tone: "slate",
              },
              {
                who: "Mabel Tetteh",
                what: "Tithe · Sunday service",
                amount: "GHS 350.00",
                tag: "MoMo",
                tone: "amber",
              },
            ] as const
          ).map((s, i) => (
            <Row key={s.who} index={i} base={0.8}>
              <Avatar name={s.who} tone={i} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-800">
                  {s.who}
                </p>
                <p className="truncate text-[12px] text-slate-500">{s.what}</p>
              </div>
              <Pill tone={s.tone}>{s.tag}</Pill>
              <span className="w-24 text-right text-[13px] font-semibold tabular-nums text-slate-900">
                {s.amount}
              </span>
            </Row>
          ))}
        </div>
      </Panel>
    </div>
  );
}
