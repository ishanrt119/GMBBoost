import AuditPrintView from '@/components/audit/AuditPrintView';

export const metadata = {
  title: 'Audit Report',
};

export default async function AuditPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuditPrintView auditId={id} />;
}
