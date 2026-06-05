import { IQuickWin } from '../../models/AuditHistory';

export function generateActionPlan(quickWins: IQuickWin[]) {
  const week1 = [];
  const week2 = [];
  const week3 = [];
  const week4 = [];

  // Distribute quick wins across the weeks based on priority
  for (const qw of quickWins) {
    if (qw.priority === 'High') {
      week1.push(qw.title);
    } else if (qw.priority === 'Medium') {
      week2.push(qw.title);
    } else {
      week3.push(qw.title);
    }
  }

  // Add standard maintenance to week 4
  week4.push('Review metrics and ranking changes');
  week4.push('Respond to any new reviews');

  return {
    week1,
    week2,
    week3,
    week4
  };
}

export function generateExecutiveSummary(quickWins: IQuickWin[], score: number) {
  const strengths = [];
  const weaknesses = [];

  if (score > 80) strengths.push('Strong overall profile completion.');
  else weaknesses.push('Profile is missing key operational data.');

  for (const qw of quickWins) {
    if (qw.priority === 'High') weaknesses.push(qw.expectedImpact);
  }

  return {
    strengths,
    weaknesses,
    missedOpportunities: quickWins.map(qw => qw.title),
    competitivePosition: score > 80 ? 'Leading' : 'Lagging',
    growthPotential: 'High (Actionable gaps identified)',
    priorityActions: quickWins.filter(qw => qw.priority === 'High').map(qw => qw.title)
  };
}
