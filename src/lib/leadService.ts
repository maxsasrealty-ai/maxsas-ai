
export const getScheduledFollowUps = async () => {
  console.log('Bypassed getScheduledFollowUps');
  return [];
};

export const updateLeadStatus = async (
  leadId: string,
  status: string,
  notes: string,
  disposition?: string,
  callStatus?: string
) => {
  console.log('Bypassed updateLeadStatus', { leadId, status, notes, disposition, callStatus });
  return;
};
