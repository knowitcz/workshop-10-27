import QuoteSummary from '../components/QuoteSummary';
import { Quote } from '../domain/types';
import { markRenewed } from '../state/renewals';

interface Props {
  today: Date;
  onDone: () => void;
  onBack: () => void;
}

const QUOTE_KEY = 'renewalQuote';

/** The quote the calculator stored, with its dates turned back into dates. */
function readStoredQuote(): Quote | null {
  const raw = sessionStorage.getItem(QUOTE_KEY);
  if (!raw) return null;

  const stored = JSON.parse(raw);
  return {
    ...stored,
    issuedAt: new Date(stored.issuedAt),
    policy: {
      ...stored.policy,
      policyStart: new Date(stored.policy.policyStart),
      renewalDate: new Date(stored.policy.renewalDate),
    },
  };
}

export default function Confirmation({ today, onDone, onBack }: Props) {
  const quote = readStoredQuote();

  function confirm() {
    markRenewed(quote.policy.policyNo);
    sessionStorage.removeItem(QUOTE_KEY);
    onDone();
  }

  return (
    <div>
      <div className="banner">
        <h1 data-cy="confirmation-title">Confirm renewal</h1>
        <p>Check the details before the policy is renewed.</p>
      </div>

      <div className="card confirmation" data-cy="confirmation">
        <QuoteSummary quote={quote} today={today} onConfirmed={confirm} />

        <div className="actions">
          <button type="button" className="btn btn-secondary" data-cy="confirm-back" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
