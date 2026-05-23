'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, BarChart3, FileText, RefreshCw, Clock,
  MapPin, ArrowRight, Check, Star, ChevronRight
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const FEATURES = [
  { title: 'AI Content Generation', description: 'Generate GMB posts, SEO descriptions, and FAQs tailored to your business in seconds.', icon: Sparkles, color: 'bg-indigo-100 text-indigo-600' },
  { title: 'SEO Optimization', description: 'Every piece of content is optimized for local SEO with smart keyword integration.', icon: BarChart3, color: 'bg-emerald-100 text-emerald-600' },
  { title: 'GMB Post Generator', description: 'Create compelling Google Business Profile posts that drive clicks and foot traffic.', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { title: 'Smart Regeneration', description: 'Not happy with the output? Regenerate new variations instantly with one click.', icon: RefreshCw, color: 'bg-violet-100 text-violet-600' },
  { title: 'Content History', description: 'Access, search, and manage all your previously generated content in one place.', icon: Clock, color: 'bg-amber-100 text-amber-600' },
  { title: 'Local SEO Intelligence', description: 'Location-aware prompts that boost visibility in local search results.', icon: MapPin, color: 'bg-rose-100 text-rose-600' },
];

const BENEFITS = [
  { text: 'Save 10+ hours per week', sub: 'Automate content creation for all your GMB listings.' },
  { text: 'Improve local search rankings', sub: 'Keyword-rich content that Google loves.' },
  { text: 'Increase foot traffic and calls', sub: 'Compelling CTAs that convert searchers to customers.' },
  { text: 'Automate your content workflow', sub: 'Generate, review, and publish — all in one place.' },
];

const STATS = [
  { value: '10x', label: 'Faster than manual writing' },
  { value: '87%', label: 'Average SEO score' },
  { value: '5 min', label: 'Time to first post' },
  { value: '50+', label: 'Content types supported' },
];

const TESTIMONIALS = [
  { name: 'Sarah Mitchell', role: 'Owner, Bloom Florist', quote: 'AI Content Generator completely changed how I manage my Google Business Profile. I went from spending hours on content to minutes.' },
  { name: 'James Rivera', role: 'GM, City Auto Repair', quote: 'The SEO scores are genuinely helpful. I can see which content will perform better before I even post it.' },
  { name: 'Priya Nair', role: 'Director, Wellness Studio', quote: 'As someone with no marketing background, AI Content Generator made local SEO accessible and actually fun.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg tracking-tight">AI Content Generator</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#benefits" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Benefits</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-xs px-4 py-2 rounded-lg">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-indigo-100/60 via-violet-50/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-32 right-1/4 w-64 h-64 bg-gradient-radial from-blue-100/40 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Local SEO Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6"
          >
            Dominate Local Search
            <br />
            <span className="gradient-text">with AI-Generated</span>
            <br />
            GMB Content
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 text-balance"
          >
            Generate SEO-optimized Google Business Profile posts, descriptions, and FAQs
            in seconds. Built for local businesses that want to rank higher and attract more customers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="btn-primary px-8 py-3.5 text-base rounded-xl">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3.5 text-base rounded-xl">
              Sign in to dashboard
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
          >
            {['No credit card required', 'Free 50 credits', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-5xl mx-auto mt-16"
        >
          <div className="rounded-2xl border border-slate-200 shadow-2xl shadow-indigo-100/50 overflow-hidden bg-white">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white rounded-lg px-3 py-1 text-xs text-slate-400 border border-slate-200">
                app.AI Content Generator.com/dashboard
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Posts Generated', value: '142', icon: '📄', color: 'bg-indigo-50 text-indigo-600' },
                  { label: 'Avg SEO Score', value: '87', icon: '📈', color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Credits Left', value: '34', icon: '⚡', color: 'bg-amber-50 text-amber-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-display font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Recent Generations</span>
                  <span className="text-xs text-indigo-600 font-medium">View all →</span>
                </div>
                {[
                  'Pizza Palace – GMB Post – Score 92',
                  'Green Thumb Nursery – SEO Description – Score 88',
                  'City Plumbing Co – FAQ – Score 85',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-xs text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3">
              Features
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Everything for local SEO dominance
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              One platform to create, optimize, and manage all your Google Business Profile content.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-indigo-50 hover:border-indigo-100 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3">Why AI Content Generator</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Save time,<br />rank higher
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                Stop spending hours writing GMB content manually. Let AI do the heavy lifting
                while you focus on running your business.
              </p>
              <div className="space-y-4">
                {BENEFITS.map((b) => (
                  <div key={b.text} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{b.text}</p>
                      <p className="text-slate-500 text-sm">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-primary mt-8 inline-flex">
                Start free today <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {STATS.map((s) => (
                <div key={s.label} className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100/50">
                  <div className="text-3xl font-display font-bold gradient-text mb-1">{s.value}</div>
                  <div className="text-sm text-slate-600">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-3">Testimonials</p>
            <h2 className="font-display text-4xl font-bold text-slate-900">Loved by local businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-white/10 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to dominate<br />local search?
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of local businesses using AI Content Generator to create better GMB content, faster.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-700 font-semibold text-base hover:bg-indigo-50 transition-all duration-200 shadow-lg shadow-indigo-900/20"
              >
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900">AI Content Generator</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} AI Content Generator. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
