import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Conversation from '@/models/Conversation';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    
    const aiResponseCount = await Conversation.countDocuments({ aiGenerated: true });
    
    // Group leads by source
    const sourcesAgg = await Lead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);
    const leadSources = sourcesAgg.map(s => ({ name: s._id || 'Unknown', value: s.count }));

    // Leads by status
    const statusesAgg = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const leadsByStatus = statusesAgg.map(s => ({ name: s._id, value: s.count }));

    return NextResponse.json({
      totalLeads,
      conversionRate: conversionRate.toFixed(1),
      leadSources,
      aiResponseCount,
      leadsByStatus
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
