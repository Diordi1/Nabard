import React from 'react';
import { useFarmerContext } from '../context/FarmerContext';
import { Link } from 'react-router-dom';

const VisitRequestScreen: React.FC = () => {
  const { visitRequests, requestVisitVerification, farmerId, farmerName } = useFarmerContext();

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Visit Requests</h2>
        <Link to="/dashboard" style={{ textDecoration: 'none', fontSize: 14 }}>&larr; Back</Link>
      </header>
      <section style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h4 style={{ marginTop: 0 }}>Create New Request</h4>
        <VisitRequestForm onSubmit={requestVisitVerification} farmerId={farmerId} farmerName={farmerName} />
      </section>
      <section style={{ marginTop: '1.5rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Previous Requests</h4>
        {visitRequests.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No requests yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
          {visitRequests.map(r => (
            <li key={r.id} style={{ border: '1px solid #e2e2e2', borderRadius: 8, padding: '0.75rem', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 14 }}>{r.village || 'Village'}</strong>
                <StatusPill status={r.status} />
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Preferred Date: {r.preferredDate}</div>
              <div style={{ fontSize: 12, marginTop: 2, color: '#444' }}>{r.locationDetails}</div>
              {r.responseMessage && <div style={{ fontSize: 11, marginTop: 4, color: '#9a4d00' }}>{r.responseMessage}</div>}
              <div style={{ fontSize: 11, marginTop: 6, color: '#777' }}>Created: {r.createdAt.toLocaleString?.() || new Date(r.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    pending: '#b78100',
    completed: '#1b7e31',
    failed: '#b80000'
  };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: 11,
      borderRadius: 12,
      background: colors[status] || '#555',
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }}>{status}</span>
  );
};

const VisitRequestForm: React.FC<{ onSubmit: (d: { village: string; locationDetails: string; preferredDate: string }) => Promise<any>; farmerId: string; farmerName: string; }> = ({ onSubmit, farmerId, farmerName }) => {
  const [village, setVillage] = React.useState('');
  const [locationDetails, setLocationDetails] = React.useState('');
  const [preferredDate, setPreferredDate] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    if (!village || !locationDetails || !preferredDate) {
      setError('All fields required');
      return;
    }
    setLoading(true);
    const res = await onSubmit({ village, locationDetails, preferredDate });
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Failed to submit');
    } else {
      setSuccess(true);
      setVillage('');
      setLocationDetails('');
      setPreferredDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
      <div style={{ fontSize: 12, color: '#555' }}>Farmer: {farmerName} ({farmerId})</div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Village</label>
        <input value={village} onChange={e => setVillage(e.target.value)} style={inputStyle} placeholder="Village name" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Location Details</label>
        <textarea value={locationDetails} onChange={e => setLocationDetails(e.target.value)} style={{ ...inputStyle, minHeight: 60 }} placeholder="Nearby landmarks, approach, etc." />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>Preferred Date</label>
        <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} style={inputStyle} />
      </div>
      {error && <div style={{ color: '#b80000', fontSize: 12 }}>{error}</div>}
      {success && <div style={{ color: '#1b7e31', fontSize: 12 }}>Submitted!</div>}
      <button type="submit" disabled={loading} style={{
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        padding: '0.6rem 1rem',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 14,
        opacity: loading ? 0.7 : 1
      }}>{loading ? 'Sending...' : 'Submit Request'}</button>
    </form>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.6rem',
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14
};

export default VisitRequestScreen;
