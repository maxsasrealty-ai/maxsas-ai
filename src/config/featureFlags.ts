export const isScheduleEnabled = false;

export type ScheduleAccessContext = {
  remoteEnabled?: boolean;
  hasAdvancedPlan?: boolean;
  hasScheduleRole?: boolean;
};

export function canAccessScheduledCalling(context?: ScheduleAccessContext): boolean {
  if (!isScheduleEnabled) {
    return false;
  }

  const remoteGate = context?.remoteEnabled ?? true;
  const planGate = context?.hasAdvancedPlan ?? true;
  const roleGate = context?.hasScheduleRole ?? true;

  return remoteGate && planGate && roleGate;
}
