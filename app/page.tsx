"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Globe,
  CreditCard,
  ChevronDown,
  MessageCircle,
  Mail,
  BarChart3,
  Users,
  Rocket,
  CheckCircle2,
  Star,
  Play,
  Lock,
  Headphones,
  Sparkles,
} from "lucide-react";
import { BRAND, SUPPORT, FOOTER_CREDIT } from "@/lib/constants/brand";

/* ───────────────────────────────────────────────
   Animation variants
   ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

/* ───────────────────────────────────────────────
   Reusable components
   ─────────────────────────────────────────────── */
function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-gradient-to-r from-[${BRAND.colors.electricViolet}] via-[${BRAND.colors.neonCyan}] to-[${BRAND.colors.electricViolet}] bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan}, ${BRAND.colors.electricViolet})`,
        backgroundSize: "200% auto",
      }}
    >
      {children}
    </span>
  );
}

function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl ${
        hover ? "transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-violet-500/10" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle: string }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mx-auto max-w-3xl text-center">
      <motion.p variants={fadeUp} className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND.colors.neonCyan }}>
        {eyebrow}
      </motion.p>
      <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-400">
        {subtitle}
      </motion.p>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   Sections
   ─────────────────────────────────────────────── */

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[${BRAND.colors.deepSlate}]/80 backdrop-blur-xl"
      style={{ backgroundColor: `${BRAND.colors.deepSlate}CC` }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          {BRAND.name}
        </Link>
        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#how-it-works" className="transition hover:text-white">How it Works</a>
          <a href="#pricing" className="transition hover:text-white">Pricing</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-slate-300 transition hover:text-white sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan})` }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: `radial-gradient(circle, ${BRAND.colors.electricViolet}20, transparent 70%)` }}
        />
        <div
          className="absolute -right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: `radial-gradient(circle, ${BRAND.colors.neonCyan}15, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-4xl"
        >
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" style={{ color: BRAND.colors.neonCyan }} />
            Trusted by 50,000+ resellers worldwide
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Instant Social{" "}
            <GradientText>Authority</GradientText>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
            {BRAND.tagline} The all-in-one SMM panel for resellers who refuse to wait.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white transition hover:shadow-lg hover:shadow-violet-500/25"
              style={{ background: `linear-gradient(135deg, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan})` }}
            >
              Start Growing Free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
            >
              <Play className="h-4 w-4" />
              View Dashboard
            </Link>
          </motion.div>

          {/* Platform pills */}
          <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {["Instagram", "TikTok", "YouTube", "Twitter/X", "Facebook", "Spotify"].map((platform) => (
              <span
                key={platform}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-400 backdrop-blur-sm"
              >
                {platform}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero visual — abstract dashboard cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-1 backdrop-blur-sm">
            <div className="rounded-xl bg-[${BRAND.colors.deepSlate}] p-6 sm:p-8" style={{ backgroundColor: BRAND.colors.deepSlate }}>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Followers Delivered", value: "12.4M+", icon: Users, color: BRAND.colors.electricViolet },
                  { label: "Orders Processed", value: "890K+", icon: BarChart3, color: BRAND.colors.neonCyan },
                  { label: "Avg. Delivery Time", value: "< 5 min", icon: Clock, color: "#10B981" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <stat.icon className="mb-2 h-5 w-5" style={{ color: stat.color }} />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Growth Trajectory</span>
                    <span className="text-sm font-medium" style={{ color: BRAND.colors.neonCyan }}>+247%</span>
                  </div>
                  <div className="flex items-end gap-1">
                    {[35, 48, 42, 60, 55, 78, 72, 95, 88, 110, 105, 140].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${h}px`,
                          background: `linear-gradient(to top, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan})`,
                          opacity: 0.6 + i * 0.03,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="mb-3 text-sm text-slate-400">Recent Orders</p>
                  <div className="space-y-2">
                    {[
                      { service: "Instagram Followers", qty: "5,000", status: "Completed" },
                      { service: "TikTok Views", qty: "100,000", status: "In Progress" },
                      { service: "YouTube Subs", qty: "1,000", status: "Completed" },
                    ].map((order) => (
                      <div key={order.service} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{order.service}</span>
                        <span className={order.status === "Completed" ? "text-emerald-400" : "text-amber-400"}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "50K+", label: "Active Resellers", icon: Users },
    { value: "12.4M+", label: "Followers Delivered", icon: TrendingUp },
    { value: "99.8%", label: "Uptime Guarantee", icon: Shield },
    { value: "< 5 min", label: "Average Delivery", icon: Zap },
  ];

  return (
    <section className="relative border-y border-white/5 bg-white/[0.02] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
              <stat.icon className="mx-auto mb-3 h-6 w-6" style={{ color: BRAND.colors.electricViolet }} />
              <p className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Delivery",
      desc: "Most orders start processing within 60 seconds. No queues, no delays — just instant results.",
      color: BRAND.colors.electricViolet,
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      desc: "SSL-encrypted transactions, secure API endpoints, and zero password storage on our servers.",
      color: BRAND.colors.neonCyan,
    },
    {
      icon: Globe,
      title: "Global Coverage",
      desc: "Support for Instagram, TikTok, YouTube, Twitter/X, Facebook, Spotify, and 20+ platforms.",
      color: "#10B981",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      desc: "Pay with card, bank transfer, or crypto (BTC, ETH, USDT, LTC, SOL). Wallet system included.",
      color: "#F59E0B",
    },
    {
      icon: BarChart3,
      title: "Reseller API",
      desc: "White-label ready. Build your own storefront with our fully documented REST API and webhooks.",
      color: BRAND.colors.electricViolet,
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Real humans, real answers. Reach us via WhatsApp or email anytime — we never ghost.",
      color: BRAND.colors.neonCyan,
    },
  ];

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Features"
          title={<>Everything you need to <GradientText>scale</GradientText></>}
          subtitle="From individual creators to full-scale reseller agencies — MeFamous handles the heavy lifting so you focus on growth."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} custom={i}>
              <GlassCard className="h-full p-6">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${f.color}15` }}
                >
                  <f.icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Create Your Account",
      desc: "Sign up in 30 seconds. No verification delays, no complex onboarding — just email and go.",
      icon: Rocket,
    },
    {
      num: "02",
      title: "Fund Your Wallet",
      desc: "Add funds via card, bank, or crypto. Your balance is instant and ready to deploy.",
      icon: CreditCard,
    },
    {
      num: "03",
      title: "Place Orders & Scale",
      desc: "Choose from 500+ services, set your targets, and watch the numbers climb. Rinse, repeat, profit.",
      icon: TrendingUp,
    },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden px-6 py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-full w-px"
        style={{ background: `linear-gradient(to bottom, transparent, ${BRAND.colors.electricViolet}40, transparent)` }}
      />
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How it Works"
          title={<>Three steps to <GradientText>dominance</GradientText></>}
          subtitle="No learning curve. No technical setup. If you can click a button, you can grow a brand."
        />

        <div className="relative mt-16 space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`flex items-center gap-8 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}
            >
              <div className="hidden flex-1 lg:block" />
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan})` }}
              >
                <step.icon className="h-6 w-6" />
              </div>
              <GlassCard className="flex-1 p-6 lg:p-8">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Step {step.num}</span>
                <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-slate-400">{step.desc}</p>
              </GlassCard>
              <div className="hidden flex-1 lg:block" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "Free",
      desc: "Perfect for testing the waters.",
      features: ["Access to all services", "Standard delivery speed", "Email support", "Basic analytics"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Reseller",
      price: "$49",
      period: "/mo",
      desc: "For serious growth operators.",
      features: ["Everything in Starter", "Priority delivery (2x speed)", "API access", "White-label options", "WhatsApp support", "Custom pricing"],
      cta: "Start Reselling",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "Agency-grade infrastructure.",
      features: ["Dedicated account manager", "Custom API rate limits", "SLA guarantee", "Private server pool", "Volume discounts", "24/7 phone support"],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Pricing"
          title={<>Simple, transparent <GradientText>pricing</GradientText></>}
          subtitle="Start free, scale when ready. No hidden fees, no setup costs, no surprises."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 lg:grid-cols-3"
        >
          {tiers.map((tier, i) => (
            <motion.div key={tier.name} variants={fadeUp} custom={i}>
              <div
                className={`relative h-full rounded-2xl border p-6 sm:p-8 ${
                  tier.popular
                    ? "border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-transparent"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {tier.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan})` }}
                  >
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-slate-400">{tier.period}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-400">{tier.desc}</p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND.colors.neonCyan }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition ${
                    tier.popular
                      ? "text-white hover:shadow-lg hover:shadow-violet-500/25"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                  style={tier.popular ? { background: `linear-gradient(135deg, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan})` } : {}}
                >
                  {tier.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is this safe for my accounts?",
      a: "Yes. We use drip-feed delivery and natural-looking engagement patterns. No password access required — we only need your public profile link.",
    },
    {
      q: "How fast do orders start?",
      a: "Most orders begin processing within 60 seconds of placement. Larger campaigns may use drip-feed to maintain organic appearance.",
    },
    {
      q: "Can I resell under my own brand?",
      a: "Absolutely. The Reseller and Enterprise plans include white-label API access, custom pricing margins, and webhook notifications.",
    },
    {
      q: "What payment methods do you accept?",
      a: "Cards (Visa, Mastercard), bank transfers, and crypto (BTC, ETH, USDT TRC20/ERC20, LTC, SOL). All payments are secured with SSL encryption.",
    },
    {
      q: "Do you offer refunds?",
      a: "If we fail to deliver within the stated timeframe, you are eligible for a full refund to your wallet. No questions asked.",
    },
    {
      q: "How do I contact support?",
      a: "Reach us on WhatsApp at {SUPPORT.whatsapp} or email {SUPPORT.email}. We respond to all inquiries within 2 hours during business hours.",
    },
  ];

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title={<>Questions? <GradientText>Answered.</GradientText></>}
          subtitle="Everything you need to know before you start scaling."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 space-y-4"
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp}>
              <GlassCard className="overflow-hidden" hover={false}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="border-t border-white/5 px-5 pb-5 pt-3 text-sm text-slate-400">
                        {faq.a.replace("{SUPPORT.whatsapp}", SUPPORT.whatsapp).replace("{SUPPORT.email}", SUPPORT.email)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 p-10 text-center sm:p-16"
        style={{ background: `linear-gradient(135deg, ${BRAND.colors.electricViolet}15, ${BRAND.colors.neonCyan}10)` }}
      >
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-[100px]"
          style={{ background: BRAND.colors.electricViolet }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full blur-[100px]"
          style={{ background: BRAND.colors.neonCyan }}
        />

        <h2 className="relative z-10 text-3xl font-bold text-white sm:text-4xl">
          Ready to stop watching and start <GradientText>growing?</GradientText>
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-lg text-slate-300">
          Join 50,000+ resellers who have already discovered the fastest way to build social authority.
        </p>
        <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white transition hover:shadow-lg hover:shadow-violet-500/25"
            style={{ background: `linear-gradient(135deg, ${BRAND.colors.electricViolet}, ${BRAND.colors.neonCyan})` }}
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={SUPPORT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">{BRAND.name}</p>
            <p className="mt-2 text-sm text-slate-400">{BRAND.tagline}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="transition hover:text-white">Features</a></li>
              <li><a href="#pricing" className="transition hover:text-white">Pricing</a></li>
              <li><a href="#faq" className="transition hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>
                <a href={SUPPORT.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-white">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT.email}`} className="flex items-center gap-2 transition hover:text-white">
                  <Mail className="h-3.5 w-3.5" /> Email
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><span className="cursor-pointer transition hover:text-white">Privacy Policy</span></li>
              <li><span className="cursor-pointer transition hover:text-white">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-slate-500">
          {FOOTER_CREDIT}
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────────────────────────────
   Main page export
   ─────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="min-h-screen text-white" style={{ backgroundColor: BRAND.colors.deepSlate }}>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
