import { coverageAmount, formatCZK } from '../domain/calc';
import { isQuoteValid, quoteDaysLeft } from '../domain/quote';
import { daysUntil, isExpiring, QUOTE_LOCK_DAYS } from '../domain/renewal';
import { Quote } from '../domain/types';
import { markRenewed } from '../state/renewals';

interface Props {
  today: Date;
  onConfirmed: () => void;
}

const COUNTRIES = {
  CZ: 'Czech Republic',
  SK: 'Slovakia',
  DE: 'Germany',
  AT: 'Austria',
  PL: 'Poland',
};

export default function QuoteSummary({ today, onConfirmed }: Props) {
  const raw = sessionStorage.getItem('renewalQuote');

  if (!raw) {
    return <p data-cy="no-quote">There is no quote to confirm. Go back and calculate one.</p>;
  }

  const stored = JSON.parse(raw);
  const quote: Quote = {
    ...stored,
    issuedAt: new Date(stored.issuedAt),
    policy: {
      ...stored.policy,
      policyStart: new Date(stored.policy.policyStart),
      renewalDate: new Date(stored.policy.renewalDate),
    },
  };

  const { policy } = quote;
  const expiring = isExpiring(policy.renewalDate, today);
  const daysLeft = daysUntil(policy.renewalDate, today);
  const valid = isQuoteValid(quote.issuedAt, today);
  const quoteDays = quoteDaysLeft(quote.issuedAt, today);

  function confirm() {
    markRenewed(policy.policyNo);
    sessionStorage.removeItem('renewalQuote');
    onConfirmed();
  }

  return (
    <>
      <h2 className="section-label" data-cy="section-label">Policyholder</h2>
      <dl className="summary">
        <div className="row" data-cy="confirm-name">
          <dt>Policyholder name</dt>
          <dd>{quote.policyholderName}</dd>
        </div>
        <div className="row" data-cy="confirm-age">
          <dt>Age</dt>
          <dd>{quote.age}</dd>
        </div>
        <div className="row" data-cy="confirm-region">
          <dt>Region</dt>
          <dd>
            {COUNTRIES[quote.country] || quote.country} — {quote.region}
          </dd>
        </div>
      </dl>

      <h2 className="section-label" data-cy="section-label">Renewal</h2>
      <dl className="summary">
        <div className="row" data-cy="confirm-policy">
          <dt>Policy</dt>
          <dd>{policy.policyNo}</dd>
        </div>
        <div className="row" data-cy="confirm-coverage">
          <dt>Coverage level</dt>
          <dd>
            {quote.coverage} % — {formatCZK(coverageAmount(quote.coverage))}
          </dd>
        </div>
        <div className="row" data-cy="confirm-claims">
          <dt>Previous claims</dt>
          <dd>{quote.priorClaims}</dd>
        </div>
        <div className="row total">
          <dt>Renewal premium</dt>
          <dd>
            <h4 data-cy="confirm-premium">{formatCZK(quote.premium)}</h4>
          </dd>
        </div>
      </dl>

      {expiring && (
        <div className="notice" data-cy="confirm-notice">
          This policy expires in {daysLeft} days. The quote is locked for{' '}
          {QUOTE_LOCK_DAYS} days.
        </div>
      )}

      {valid ? (
        <p data-cy="quote-validity">
          {quoteDays === 0
            ? 'This quote can be confirmed until the end of today.'
            : `This quote can be confirmed for ${quoteDays} more ${quoteDays === 1 ? 'day' : 'days'}.`}
        </p>
      ) : (
        <div className="notice" data-cy="quote-expired">
          This quote has expired. Go back and calculate it again.
        </div>
      )}

      <div className="actions">
        <button
          type="button"
          className="btn btn-primary"
          data-cy="confirm"
          disabled={!valid}
          onClick={confirm}
        >
          Confirm renewal
        </button>
      </div>
    </>
  );
}
