import { useState, type FormEvent } from 'react';
import type { Spot } from '../types';

interface AddSpotFormProps {
  onSpotAdded: (spot: Spot) => void;
  onCancel: () => void;
}

export function AddSpotForm({ onSpotAdded, onCancel }: AddSpotFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedAddress) {
      setError('Please enter both a name and address.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/add-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, address: trimmedAddress }),
      });

      const data = (await response.json()) as { spot?: Spot; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not save this spot.');
      }

      if (!data.spot) {
        throw new Error('Spot was saved but the response was incomplete.');
      }

      onSpotAdded(data.spot);
      setSuccess(`${data.spot.name} added. It may take a minute to appear after the site rebuilds.`);
      setName('');
      setAddress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="section-title">Add a new spot</h2>
      <form className="spot-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Dadash"
            autoComplete="organization"
            required
          />
        </label>

        <label className="field">
          <span>Full address</span>
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Hackney Road, London E2 7SJ"
            autoComplete="street-address"
            required
          />
        </label>

        {error && <p className="form-message error">{error}</p>}
        {success && <p className="form-message success">{success}</p>}

        <div className="action-row">
          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save spot'}
          </button>
          <button type="button" className="button button-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
