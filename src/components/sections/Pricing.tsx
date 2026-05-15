"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for single location businesses.",
    features: [
      "1 Google Business Profile",
      "AI Review Replies",
      "Monthly GMB Audit",
      "Basic Analytics",
      "Email Support"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Growth",
    price: "$99",
    description: "Most popular for growing local businesses.",
    features: [
      "3 Google Business Profiles",
      "AI Content Generator",
      "7-Day Auto Scheduler",
      "WhatsApp AI Lead Agent",
      "CRM Integration",
      "Priority Support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For agencies and multi-location brands.",
    features: [
      "Unlimited Locations",
      "White-label Reports",
      "API Access",
      "Dedicated Account Manager",
      "Custom AI Training",
      "SLA Support"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent <span className="text-gradient">Pricing</span></h2>
        <p className="text-white/60 max-w-2xl mx-auto text-lg">
          Choose the plan that fits your business stage. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className={`relative p-8 rounded-3xl border ${
              plan.popular 
                ? "bg-primary/5 border-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]" 
                : "bg-white/[0.03] border-white/10"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-white/40 text-sm">/month</span>}
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 ${
              plan.popular 
                ? "bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            }`}>
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
