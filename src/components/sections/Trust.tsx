"use client";

import { motion } from "framer-motion";

const metrics = [
  { label: "Reviews Managed", value: "10K+", delay: 0.1 },
  { label: "Leads Captured", value: "2M+", delay: 0.2 },
  { label: "Faster Response Time", value: "98%", delay: 0.3 },
];

export function TrustSection() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-8">Trusted by Local Businesses</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos */}
            <div className="text-xl font-bold tracking-tighter">TECHCORP</div>
            <div className="text-xl font-bold tracking-tighter">SOLUTIONS</div>
            <div className="text-xl font-bold tracking-tighter">GLOBALNET</div>
            <div className="text-xl font-bold tracking-tighter">PIXELFLOW</div>
            <div className="text-xl font-bold tracking-tighter">VANTAGE</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: metric.delay }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">{metric.value}</div>
              <div className="text-white/50 font-medium">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
