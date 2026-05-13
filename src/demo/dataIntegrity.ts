/**
 * Dev-only entity-relation audit for the demo dataset.
 *
 * Validates that every cross-entity reference resolves to a live row,
 * detects orphans, duplicate IDs, and obviously-invalid data shapes.
 *
 * Runs:
 *   • once after `loadDemoDataset()`
 *   • on demand via `auditDemoIntegrity()`
 *
 * Output is collapsed under `[demo-integrity]` and only logged when:
 *   • import.meta.env.DEV is true OR
 *   • localStorage flag `gymos_audit_verbose` is set
 *
 * Returns a structured report so future tooling (e.g. a Settings page)
 * can render it without re-parsing console output.
 */
import { demoStore } from './storage';

export interface IntegrityIssue {
  entity: string;
  id: string | null;
  field: string;
  message: string;
}

export interface IntegrityReport {
  ok: boolean;
  counts: Record<string, number>;
  issues: IntegrityIssue[];
  ranAt: string;
}

const isDev = (() => {
  try { return Boolean((import.meta as any).env?.DEV); } catch { return false; }
})();

const verbose = (() => {
  try { return Boolean(typeof window !== 'undefined' && window.localStorage.getItem('gymos_audit_verbose')); } catch { return false; }
})();

function shouldLog() { return isDev || verbose; }

export function auditDemoIntegrity(): IntegrityReport {
  const vendors = demoStore.getVendors();
  const users = [...demoStore.getUsers(), ...demoStore.getSuperOwners()];
  const plans = demoStore.getPlans();
  const members = demoStore.getMembers();
  const payments = demoStore.getPayments();
  const leads = demoStore.getLeads();
  const expenses = demoStore.getExpenses();
  const trainers = demoStore.getTrainers();
  const assignments = demoStore.getTrainerAssignments();
  const sessions = demoStore.getTrainerSessions();
  const soAccess = demoStore.getSuperOwnerAccess();

  const issues: IntegrityIssue[] = [];
  const push = (entity: string, id: string | null, field: string, message: string) =>
    issues.push({ entity, id, field, message });

  const vendorIds = new Set(vendors.map(v => v.id));
  const planIds = new Set(plans.map(p => p.id));
  const memberIds = new Set(members.map(m => m.id));
  const trainerIds = new Set(trainers.map(t => t.id));
  const assignmentIds = new Set(assignments.map(a => a.id));
  const userIds = new Set(users.map(u => u.id));

  // Duplicate id detection
  const dupCheck = (rows: Array<{ id: string }>, name: string) => {
    const seen = new Set<string>();
    for (const r of rows) {
      if (seen.has(r.id)) push(name, r.id, 'id', 'duplicate id');
      seen.add(r.id);
    }
  };
  dupCheck(vendors, 'vendor');
  dupCheck(users, 'user');
  dupCheck(plans, 'plan');
  dupCheck(members, 'member');
  dupCheck(payments, 'payment');
  dupCheck(leads, 'lead');
  dupCheck(expenses, 'expense');
  dupCheck(trainers, 'trainer');
  dupCheck(assignments, 'trainer_assignment');
  dupCheck(sessions, 'trainer_session');

  // Vendor reference checks
  const checkVendor = (rows: Array<{ id: string; vendor_id: string }>, name: string) => {
    for (const r of rows) {
      if (!r.vendor_id) push(name, r.id, 'vendor_id', 'missing vendor_id');
      else if (!vendorIds.has(r.vendor_id)) push(name, r.id, 'vendor_id', `unknown vendor "${r.vendor_id}"`);
    }
  };
  checkVendor(plans as any, 'plan');
  checkVendor(members as any, 'member');
  checkVendor(payments as any, 'payment');
  checkVendor(leads as any, 'lead');
  checkVendor(expenses as any, 'expense');
  checkVendor(trainers as any, 'trainer');
  checkVendor(assignments as any, 'trainer_assignment');
  checkVendor(sessions as any, 'trainer_session');

  // Member → plan
  for (const m of members) {
    if (!m.plan_id) push('member', m.id, 'plan_id', 'no plan assigned');
    else if (!planIds.has(m.plan_id)) push('member', m.id, 'plan_id', `unknown plan "${m.plan_id}"`);
    if (!m.expiry_date || !m.join_date) push('member', m.id, 'dates', 'missing join/expiry');
  }

  // Payment → member (+ pt → trainer/assignment)
  for (const p of payments) {
    if (!memberIds.has(p.member_id)) push('payment', p.id, 'member_id', `unknown member "${p.member_id}"`);
    if (p.payment_type === 'pt') {
      if (p.assignment_id && !assignmentIds.has(p.assignment_id))
        push('payment', p.id, 'assignment_id', `unknown assignment "${p.assignment_id}"`);
      if (p.trainer_id && !trainerIds.has(p.trainer_id))
        push('payment', p.id, 'trainer_id', `unknown trainer "${p.trainer_id}"`);
    }
    if (typeof p.amount !== 'number' || p.amount < 0) push('payment', p.id, 'amount', 'invalid amount');
  }

  // Trainer assignments / sessions
  for (const a of assignments) {
    if (!trainerIds.has(a.trainer_id)) push('trainer_assignment', a.id, 'trainer_id', `unknown trainer "${a.trainer_id}"`);
    if (!memberIds.has(a.member_id)) push('trainer_assignment', a.id, 'member_id', `unknown member "${a.member_id}"`);
    if (a.sessions_completed > a.total_sessions) push('trainer_assignment', a.id, 'sessions_completed', 'completed > total');
  }
  for (const s of sessions) {
    if (!assignmentIds.has(s.assignment_id)) push('trainer_session', s.id, 'assignment_id', `unknown assignment "${s.assignment_id}"`);
    if (!trainerIds.has(s.trainer_id)) push('trainer_session', s.id, 'trainer_id', `unknown trainer "${s.trainer_id}"`);
    if (!memberIds.has(s.member_id)) push('trainer_session', s.id, 'member_id', `unknown member "${s.member_id}"`);
  }

  // Super-owner access → vendor + user
  for (const a of soAccess) {
    if (!vendorIds.has(a.vendor_id)) push('super_owner_access', a.id, 'vendor_id', `unknown vendor "${a.vendor_id}"`);
    if (!userIds.has(a.super_owner_id)) push('super_owner_access', a.id, 'super_owner_id', `unknown user "${a.super_owner_id}"`);
  }

  const report: IntegrityReport = {
    ok: issues.length === 0,
    counts: {
      vendors: vendors.length,
      users: users.length,
      plans: plans.length,
      members: members.length,
      payments: payments.length,
      leads: leads.length,
      expenses: expenses.length,
      trainers: trainers.length,
      trainer_assignments: assignments.length,
      trainer_sessions: sessions.length,
      super_owner_access: soAccess.length,
    },
    issues,
    ranAt: new Date().toISOString(),
  };

  if (shouldLog()) {
    const tag = '[demo-integrity]';
    if (report.ok) {
      // eslint-disable-next-line no-console
      console.info(`${tag} ✓ all ${Object.values(report.counts).reduce((a, b) => a + b, 0)} entities consistent`, report.counts);
    } else {
      // eslint-disable-next-line no-console
      console.groupCollapsed(`${tag} ⚠ ${report.issues.length} issue(s) found`);
      // eslint-disable-next-line no-console
      console.table(report.issues);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  return report;
}
