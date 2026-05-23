'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Mail, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-violet-100/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900 text-xl">AI Content Generator</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10 text-indigo-500" />
          </motion.div>

          <h1 className="font-display text-2xl font-bold text-slate-900 mb-3">Check your email</h1>
          <p className="text-slate-500 text-sm mb-2">We sent a verification link to</p>
          <p className="font-semibold text-slate-800 text-base mb-6">{email}</p>

          <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {[
              'Open the email from AI Content Generator',
              'Click the "Verify Email" link',
              "You'll be redirected to your dashboard",
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-3 text-sm text-indigo-700">
                <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                {step}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mb-5">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
              try again
            </Link>
          </p>

          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
