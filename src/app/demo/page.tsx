 'use client';
import { useState } from 'react';
import {
  Loader2, Calendar, Clock, Building,
  User, Phone, Mail, MessageSquare, CheckCircle, Star
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM',  '3:00 PM',  '4:00 PM', '5:00 PM'
];

const BUSINESS_TYPES = [
  'Salon & Spa', 'Restaurant', 'Hotel',
  'Clinic', 'Gym', 'Retail Store', 'Other'
];

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    businessType: '', date: '', timeSlot: '', message: ''
  });

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessType) return alert('Please select a business type');
    if (!form.timeSlot) return alert('Please select a time slot');
    setLoading(true);
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else alert(data.error || 'Something went wrong');
    } catch {
      alert('Failed to book demo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Demo Booked!</h2>
          <p className="text-slate-500 mb-2">
            Thank you <b>{form.name}</b>!
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 mb-1">
              <b>Date:</b> {form.date}
            </p>
            <p className="text-sm text-slate-600">
              <b>Time:</b> {form.timeSlot}
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Confirmation sent to <b>{form.email}</b>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Star size={16} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-slate-800">GMBBoost</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Book a Free Demo</h1>
        <p className="text-slate-500">See how GMBBoost can grow your business online</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-5"
        >

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
                <User size={11} /> Full Name *
              </label>
              <input
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="John Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
                <Mail size={11} /> Email *
              </label>
              <input
                required type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="john@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Phone + Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
                <Phone size={11} /> Phone *
              </label>
              <input
                required
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="+91 98200 00000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
                <Building size={11} /> Company Name *
              </label>
              <input
                required
                value={form.company}
                onChange={e => setForm({...form, company: e.target.value})}
                placeholder="Glamour Salon"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">
              Business Type *
            </label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map(type => (
                <button
                  key={type} type="button"
                  onClick={() => setForm({...form, businessType: type})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
                    ${form.businessType === type
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
              <Calendar size={11} /> Preferred Date *
            </label>
            <input
              required type="date"
              value={form.date} min={today}
              onChange={e => setForm({...form, date: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-2">
              <Clock size={11} /> Preferred Time *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot} type="button"
                  onClick={() => setForm({...form, timeSlot: slot})}
                  className={`py-2 rounded-lg text-xs font-medium border transition
                    ${form.timeSlot === slot
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
              <MessageSquare size={11} /> Message (optional)
            </label>
            <textarea
              value={form.message} rows={3}
              onChange={e => setForm({...form, message: e.target.value})}
              placeholder="Tell us about your business..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : <Calendar size={16} />}
            Book Free Demo
          </button>

          <p className="text-center text-xs text-slate-400">
            No credit card required. 100% free demo.
          </p>

        </form>
      </div>
    </div>
  );
}