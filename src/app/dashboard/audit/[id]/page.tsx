import AuditResultsDashboard from '@/components/audit/AuditResultsDashboard';
import dbConnect from '@/lib/mongodb';
import AuditHistory from '@/models/AuditHistory';

export const metadata = {
  title: 'Audit Results | GMB Optimizer',
  description: 'View your AI-powered Google Business Profile audit results.',
};

export default async function AuditResultsPage(
  { params }: { params: Promise<{ id: string }> } // Next 15 awaits params
) {
  const { id } = await params;

  await dbConnect();
  const auditDoc = await AuditHistory.findById(id).lean();
  const audit = auditDoc ? JSON.parse(JSON.stringify(auditDoc)) : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-10">
      <AuditResultsDashboard audit={audit} />
    </div>
  );
}
