import { useEffect, useState } from 'react';
import { fetchPolicies } from './api';
import { resolvePolicy } from './domain/renewal';
import { Policy } from './domain/types';
import { markRenewed } from './state/renewals';
import Calculator from './screens/Calculator';
import PolicyList from './screens/PolicyList';

export default function App() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const today = new Date();

  useEffect(() => {
    fetchPolicies()
      .then((records) => {
        setPolicies(records.map((r) => resolvePolicy(r, new Date())));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="wrap">
        <p className="loading">Loading policies…</p>
      </div>
    );
  }

  const policy = policies.find((p) => p.policyNo === selected);

  return (
    <div className="wrap">
      {selected === null ? (
        <PolicyList policies={policies} onRenew={setSelected} />
      ) : (
        <Calculator
          policy={policy}
          today={today}
          onBack={() => setSelected(null)}
          onComplete={(policyNo) => {
            markRenewed(policyNo);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
