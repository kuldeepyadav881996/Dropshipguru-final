"use client";

import { motion } from "framer-motion";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";

const CHART_DATA = [
  { month: "Jan", revenue: 42, trend: 38 },
  { month: "Feb", revenue: 55, trend: 48 },
  { month: "Mar", revenue: 48, trend: 52 },
  { month: "Apr", revenue: 62, trend: 58 },
  { month: "May", revenue: 58, trend: 65 },
  { month: "Jun", revenue: 72, trend: 70 },
  { month: "Jul", revenue: 68, trend: 78 },
  { month: "Aug", revenue: 85, trend: 82 },
  { month: "Sep", revenue: 78, trend: 88 },
];

const floatAnimation = {
  y: [0, -8, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
};

function IconCircle({
  children,
  variant = "gold",
}: {
  children: React.ReactNode;
  variant?: "gold" | "purple";
}) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        variant === "gold"
          ? "bg-gold/15 text-gold"
          : "bg-purple/15 text-purple"
      }`}
    >
      {children}
    </div>
  );
}

function MiniCard({
  icon,
  title,
  subtitle,
  variant = "gold",
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  variant?: "gold" | "purple";
  className?: string;
}) {
  return (
    <motion.div
      className={`glass-card rounded-2xl p-3.5 ${className}`}
      animate={floatAnimation}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-3">
        <IconCircle variant={variant}>{icon}</IconCircle>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-body-text">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Top floating cards */}
      <div className="relative z-20 mb-3 grid grid-cols-2 gap-3">
        <MiniCard
          icon={<ShoppingBag size={16} />}
          title="Top Selling Product"
          subtitle="Avg. profit ₹20K+"
          variant="gold"
        />
        <MiniCard
          icon={<Truck size={16} />}
          title="Order Tracking"
          subtitle="Delivered in 5–7 days"
          variant="purple"
          className="mt-2"
        />
      </div>

      {/* Main dashboard card */}
      <motion.div
        className="glass-card relative z-10 rounded-2xl p-5 lg:rotate-[1.5deg]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        {/* Mini stats row */}
        <div className="mb-5 grid grid-cols-3 gap-3 border-b border-white/5 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-body-text">
              Revenue
            </p>
            <p className="font-display text-lg font-bold text-gold">₹1.84L</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-body-text">
              Orders
            </p>
            <p className="font-display text-lg font-bold text-white">148</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-body-text">
              Margin
            </p>
            <p className="font-display text-lg font-bold text-white">38%</p>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-4 h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5B400" />
                  <stop offset="100%" stopColor="#FF8C00" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#A0A0A8", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Bar
                dataKey="revenue"
                fill="url(#barGold)"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: "#8B5CF6" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Order feed */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
            <p className="text-xs text-body-text">
              Order <span className="text-white">#DG-10482</span> dispatched
            </p>
            <span className="text-sm font-semibold text-gold">₹12,400</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
            <p className="text-xs text-body-text">Payment settled to bank</p>
            <span className="text-sm font-semibold text-gold">₹8,650</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom overlapping cards */}
      <div className="relative z-30 -mt-6 grid grid-cols-2 gap-3 px-2">
        <motion.div
          className="glass-card rounded-2xl p-3.5"
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 } }}
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center gap-3">
            <IconCircle variant="purple">
              <Wallet size={16} />
            </IconCircle>
            <div>
              <p className="text-sm font-semibold text-white">Automated Payouts</p>
              <p className="text-xs text-body-text">Weekly bank transfers</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="glass-card rounded-2xl p-3.5"
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 2 } }}
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center gap-3">
            <IconCircle variant="purple">
              <DollarSign size={16} />
            </IconCircle>
            <div>
              <p className="text-sm font-semibold text-white">Revenue Growth</p>
              <p className="text-xs font-semibold text-emerald-400">+32% this month</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
