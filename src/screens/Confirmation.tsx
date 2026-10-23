import QuoteSummary from '../components/QuoteSummary';

interface Props {
  today: Date;
  onDone: () => void;
  onBack: () => void;
}

export default function Confirmation({ today, onDone, onBack }: Props) {
  return (
    <div>
      <div className="banner">
        <h1 data-cy="confirmation-title">Confirm renewal</h1>
        <p>Check the details before the policy is renewed.</p>
      </div>

      <div className="card confirmation" data-cy="confirmation">
        <QuoteSummary today={today} onConfirmed={onDone} />

        <div className="actions">
          <button type="button" className="btn btn-secondary" data-cy="confirm-back" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
