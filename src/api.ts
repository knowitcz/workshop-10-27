import { PolicyRecord } from './domain/types';

export async function fetchPolicies(): Promise<PolicyRecord[]> {
  const res = await fetch('/data/policies.json');
  if (!res.ok) {
    throw new Error('Could not load policies');
  }
  return res.json();
}
