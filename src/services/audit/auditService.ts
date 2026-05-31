import dbConnect from '../../lib/mongodb';
import Audit from '../../models/Audit';
import { getGMBProvider } from '../gmb/provider';
import { generateAIAudit } from '../ai/auditEngine';

export async function processAuditJob(auditId: string) {
  await dbConnect();

  const audit = await Audit.findById(auditId);
  if (!audit) {
    throw new Error(`Audit not found: ${auditId}`);
  }

  if (audit.status !== 'PENDING') {
    console.log(`Audit ${auditId} is already ${audit.status}`);
    return;
  }

  try {
    const gmbProvider = getGMBProvider();
    
    // 1. Fetch GMB Data
    const businessData = await gmbProvider.fetchBusinessDetails(
      audit.businessName,
      audit.location,
      audit.gbpUrl
    );

    // 2. Generate AI Audit
    const aiResult = await generateAIAudit(businessData);

    // 3. Update Audit Document
    audit.overallScore = aiResult.overallScore;
    audit.competitors = aiResult.competitors;
    audit.recommendations = aiResult.recommendations;
    
    // Extract non-root level data to auditData
    const { overallScore, competitors, recommendations, ...auditDataRest } = aiResult;
    audit.auditData = auditDataRest;
    
    audit.status = 'COMPLETED';
    
    await audit.save();
    console.log(`Successfully processed audit: ${auditId}`);

  } catch (error) {
    console.error(`Failed to process audit ${auditId}:`, error);
    audit.status = 'FAILED';
    if (error instanceof Error) {
      audit.metadata = { error: error.message };
    }
    await audit.save();
    throw error;
  }
}
