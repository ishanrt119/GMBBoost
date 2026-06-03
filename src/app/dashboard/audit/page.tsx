import AuditForm from '@/components/audit/AuditForm';

export const metadata = {
  title: 'Generate AI Audit | GMB Optimizer',
  description: 'Generate an AI-powered audit for your Google Business Profile.',
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        <AuditForm />
      </div>
    </div>
  );
}
