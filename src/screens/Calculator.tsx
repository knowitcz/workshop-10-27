import { useState } from 'react';
import CoverageSlider from '../components/CoverageSlider';
import { calculatePremium, coverageAmount, formatCZK } from '../domain/calc';
import { daysUntil, isExpiring, QUOTE_LOCK_DAYS } from '../domain/renewal';
import { Policy, Quote } from '../domain/types';

interface Props {
  policy: Policy;
  today: Date;
  onContinue: () => void;
  onBack: () => void;
}

export default function Calculator({ policy, today, onContinue, onBack }: Props) {
  const [policyholderName, setPolicyholderName] = useState(policy.policyholder);
  const [age, setAge] = useState(String(policy.age));
  const [country, setCountry] = useState(policy.country);
  const [region, setRegion] = useState(policy.region);
  const [priorClaims, setPriorClaims] = useState(String(policy.priorClaims));
  const [coverage, setCoverage] = useState(50);
  const [errors, setErrors] = useState([]);
  const [premium, setPremium] = useState(null);

  function validate() {
    const found = [];
    if (!policyholderName.trim()) found.push('Policyholder name is required');
    if (!age.trim()) found.push('Age is required');
    return found;
  }

  function onSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length > 0) {
      setPremium(null);
      return;
    }
    setPremium(
      calculatePremium({
        customerName: policyholderName,
        age: Number(age),
        country,
        region,
        priorClaims: Number(priorClaims),
        coverageLevel: coverage,
        policyStart: policy.policyStart,
      })
    );
  }

  function onReset() {
    setPolicyholderName(policy.policyholder);
    setAge(String(policy.age));
    setCountry(policy.country);
    setRegion(policy.region);
    setPriorClaims(String(policy.priorClaims));
    setCoverage(50);
    setErrors([]);
    setPremium(null);
  }

  const expiring = isExpiring(policy.renewalDate, today);
  const daysLeft = daysUntil(policy.renewalDate, today);

  return (
    <div>
      <div className="banner">
        <h1 data-cy="calculator-title">Renew {policy.policyNo}</h1>
        <p>Review the renewal details and calculate the new premium.</p>
      </div>

      <form className="card" noValidate autoComplete="off" onSubmit={onSubmit} onReset={onReset}>
        <button type="button" className="link-back" data-cy="back" onClick={onBack}>
          ← Back to policies
        </button>

        <h2 className="section-label" data-cy="section-label">Policyholder</h2>

        <div className="field">
          <label htmlFor="policyholderName">Policyholder name</label>
          <input
            type="text"
            id="policyholderName"
            name="policyholderName"
            data-cy="policyholder-name"
            value={policyholderName}
            onChange={(e) => setPolicyholderName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            data-cy="age"
            min="0"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              data-cy="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="CZ">Czech Republic</option>
              <option value="SK">Slovakia</option>
              <option value="DE">Germany</option>
              <option value="AT">Austria</option>
              <option value="PL">Poland</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="region">Region</label>
            <select
              id="region"
              name="region"
              data-cy="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="Prague">Prague</option>
              <option value="Brno">Brno</option>
              <option value="Ostrava">Ostrava</option>
              <option value="Plzen">Plzeň</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <h2 className="section-label" data-cy="section-label">Renewal details</h2>


        <div className="field">
          <label htmlFor="priorClaims">Number of previous claims</label>
          <input
            type="number"
            id="priorClaims"
            name="priorClaims"
            data-cy="prior-claims"
            min="0"
            step="1"
            value={priorClaims}
            onChange={(e) => setPriorClaims(e.target.value)}
          />
        </div>

        <CoverageSlider value={coverage} onChange={setCoverage} />

        {errors.length > 0 && (
          <div className="errors">
            {errors.map((msg) => (
              <p className="error" data-cy="error" key={msg}>
                {msg}
              </p>
            ))}
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn btn-primary" data-cy="calculate">
            Calculate premium
          </button>
          <button type="reset" className="btn btn-secondary" data-cy="reset">
            Reset
          </button>
        </div>
      </form>

      {premium !== null && (
        <div className="card result">
          <h2 className="section-label" data-cy="section-label">Calculation result</h2>
          <dl className="summary">
            <div className="row" data-cy="summary-policy">
              <dt>Policy</dt>
              <dd>{policy.policyNo}</dd>
            </div>
            <div className="row" data-cy="summary-coverage">
              <dt>Coverage level</dt>
              <dd>
                {coverage} % — {formatCZK(coverageAmount(coverage))}
              </dd>
            </div>
            <div className="row" data-cy="summary-claims">
              <dt>Previous claims</dt>
              <dd>{priorClaims}</dd>
            </div>
            <div className="row total">
              <dt>Renewal premium</dt>
              <dd>
                <h4 data-cy="premium">{formatCZK(premium)}</h4>
              </dd>
            </div>
          </dl>

          {expiring && (
            <div className="notice" data-cy="notice">
              This policy expires in {daysLeft} days. The quote is locked for{' '}
              {QUOTE_LOCK_DAYS} days.
            </div>
          )}

          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              data-cy="continue"
              onClick={() => {
                const quote: Quote = {
                  policy,
                  policyholderName,
                  age: Number(age),
                  country,
                  region,
                  priorClaims: Number(priorClaims),
                  coverage,
                  premium,
                  issuedAt: today,
                };
                sessionStorage.setItem('renewalQuote', JSON.stringify(quote));
                onContinue();
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
