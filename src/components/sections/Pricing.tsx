"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₹3,999",
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
    price: "₹7,999",
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
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto bg-slate-50/50">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Pricing</span></h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
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
                ? "bg-white border-primary shadow-[0_0_40px_rgba(139,92,246,0.15)] ring-1 ring-primary" 
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4 text-slate-900">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-400 text-sm">/month</span>}
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 ${
              plan.popular 
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20" 
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}>
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
