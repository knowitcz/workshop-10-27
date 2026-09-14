import { Policy } from '../domain/types';
import { formatCZK } from '../domain/calc';
import { isRenewed } from '../state/renewals';

interface Props {
  policies: Policy[];
  onRenew: (policyNo: string) => void;
}

export default function PolicyList({ policies, onRenew }: Props) {
  return (
    <div>
      <div className="banner">
        <h1>Policy Renewal</h1>
        <p>Select a policy to renew.</p>
      </div>

      <div className="card">
        <h2 className="section-label">Policies</h2>
        <table>
          <thead>
            <tr>
              <th>Policy</th>
              <th>Policyholder</th>
              <th>Status</th>
              <th>Premium</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => {
              const renewed = p.status === 'Renewed' || isRenewed(p.policyNo);
              const status = renewed ? 'Renewed' : p.status;
              return (
                <tr className="policy-row" key={p.policyNo}>
                  <td className="polno">{p.policyNo}</td>
                  <td>{p.policyholder}</td>
                  <td>
                    <span className={'badge status ' + status.toLowerCase()}>
                      {status}
                    </span>
                  </td>
                  <td className="amount">{formatCZK(p.premium)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={renewed}
                      onClick={() => onRenew(p.policyNo)}
                    >
                      Renew
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
