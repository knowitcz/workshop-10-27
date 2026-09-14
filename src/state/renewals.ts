/**
 * Which policies have been renewed in this session. There is no server, so the
 * answer lives in sessionStorage.
 */
const KEY = 'renewedPolicies';

export function renewedPolicies(): string[] {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function markRenewed(policyNo: string): void {
  const all = renewedPolicies();
  if (all.indexOf(policyNo) === -1) {
    all.push(policyNo);
    sessionStorage.setItem(KEY, JSON.stringify(all));
  }
}

export function isRenewed(policyNo: string): boolean {
  return renewedPolicies().indexOf(policyNo) !== -1;
}
