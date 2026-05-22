"use client";

import { motion } from "framer-motion";
import { Check, Calendar as CalendarIcon, MessageCircle, BarChart, Settings } from "lucide-react";

export function ProductShowcase() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Powerful Tools, <span className="text-gradient">Simple Interface</span></h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Manage everything from reviews to lead conversion in one sleek command center.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* CRM / Kanban Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl border border-white/10 p-8 overflow-hidden relative"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Lead Pipeline
              </h3>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/10" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-wider text-white/30 font-bold">New Leads</div>
                {[1, 2].map(i => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="h-3 w-2/3 bg-white/10 rounded mb-3" />
                    <div className="h-2 w-1/2 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-wider text-primary font-bold">In Progress</div>
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <div className="h-3 w-3/4 bg-primary/20 rounded mb-3" />
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 text-primary" />
                    <div className="h-2 w-1/3 bg-primary/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature List */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold">Smart CRM & WhatsApp Automation</h3>
            <p className="text-white/60 leading-relaxed">
              Our integrated CRM automatically categorizes leads coming from Google and WhatsApp, triggering personalized follow-ups that increase conversion by up to 300%.
            </p>
            <ul className="space-y-4">
              {[
                "Automated lead tagging",
                "Instant WhatsApp notifications",
                "Multi-location pipeline view",
                "Performance tracking per agent"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Second Row - Calendar/Scheduler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-24">
          <div className="order-2 lg:order-1 space-y-8">
            <h3 className="text-3xl font-bold">AI Content Calendar</h3>
            <p className="text-white/60 leading-relaxed">
              Never worry about what to post again. Our AI generates a full month of local-optimized content based on your business category and goals.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                View Calendar
              </button>
              <button className="px-6 py-3 text-primary font-bold">
                Learn More →
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl border border-white/10 p-8 order-1 lg:order-2"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <CalendarIcon className="text-primary" />
              </div>
              <div>
                <div className="font-bold">Weekly Schedule</div>
                <div className="text-xs text-white/40">12 Posts Scheduled</div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { day: "Mon", status: "Posted", color: "text-green-500" },
                { day: "Wed", status: "Generating...", color: "text-primary animate-pulse" },
                { day: "Fri", status: "Draft", color: "text-white/30" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-sm font-bold text-white/40">{item.day}</div>
                    <div className="h-2 w-32 bg-white/10 rounded" />
                  </div>
                  <div className={`text-xs font-bold ${item.color}`}>{item.status}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
