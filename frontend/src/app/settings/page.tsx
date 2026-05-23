'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, Bell, Palette, AlertTriangle, Save } from 'lucide-react';
import { profileService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

export default function SettingsPage() {
  const { logout } = useAuth();
  const [pwForm, setPwForm] = useState({ new_password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({ email_updates: true, weekly_digest: false });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    const failed = PASSWORD_RULES.find(r => !r.test(pwForm.new_password));
    if (failed) { toast.error(`Password requirement: ${failed.label}`); return; }

    setIsSaving(true);
    try {
      await profileService.changePassword(pwForm.new_password);
      toast.success('Password updated! Please log in again.');
      setPwForm({ new_password: '', confirm: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500">You'll be signed out after changing your password.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={pwForm.new_password}
                  onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                  className={`${inputCls} pl-9 pr-10`} placeholder="New password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwForm.new_password && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map(r => (
                    <div key={r.label} className={`flex items-center gap-1.5 text-xs transition-colors ${r.test(pwForm.new_password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${r.test(pwForm.new_password) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  className={`${inputCls} pl-9`} placeholder="Confirm new password" />
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </span>
              ) : (
                <><Save className="w-4 h-4" /> Update Password</>
              )}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500">Choose what emails you receive.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'email_updates', label: 'Product Updates', desc: 'New features and improvements' },
              { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Summary of your content performance' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <div
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                  className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${notifications[key as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[key as keyof typeof notifications] ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-slate-900">Danger Zone</h2>
              <p className="text-xs text-slate-500">Irreversible actions</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) logout();
            }}
            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all"
          >
            Sign out of all devices
          </button>
        </div>
      </div>
    </div>
  );
}
