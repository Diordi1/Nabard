import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarmerContext } from '../context/FarmerContext';

const VisitRequestScreen: React.FC = () => {
  const navigate = useNavigate();
  const { farmerId, farmerName, requestVisitVerification, visitRequests, markVisitRequestCompleted } = useFarmerContext();
  const [village, setVillage] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village || !locationDetails || !preferredDate) {
      setResultMsg('Please fill all fields');
      return;
    }
    setSubmitting(true);
    setResultMsg(null);
    const res = await requestVisitVerification({ village, locationDetails, preferredDate });
    if (res.ok) {
      setResultMsg('Visit request submitted');
      setVillage('');
      setLocationDetails('');
      setPreferredDate('');
    } else {
      setResultMsg(res.error || 'Failed to submit');
    }
    setSubmitting(false);
  };

  return (
    <main className="screen">
      <header className="app-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <h1>Visit Request</h1>
        <div style={{ width: 40 }} />
      </header>
      <section className="content">
        <div className="card">
          <h2>Request Agent Visit</h2>
          <p className="muted">Farmer ID: <strong>{farmerId}</strong></p>
          <p className="muted">Farmer Name: {farmerName}</p>
          <form onSubmit={handleSubmit} className="form-grid">
            <label className="form-group">
              <span>Village</span>
              <input className="form-input" value={village} onChange={e => setVillage(e.target.value)} placeholder="Village name" />
            </label>
            <label className="form-group">
              <span>Location Details</span>
              <textarea className="form-input" value={locationDetails} onChange={e => setLocationDetails(e.target.value)} placeholder="Nearby landmarks, route"></textarea>
            </label>
            <label className="form-group">
              <span>Preferred Date</span>
              <input type="date" className="form-input" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} />
            </label>
            <button disabled={submitting} className="btn btn-primary btn-lg" type="submit">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
          {resultMsg && <p className={`muted ${resultMsg.includes('submitted') ? 'success' : 'error'}`}>{resultMsg}</p>}
        </div>

        <div className="card">
          <h3>Previous Requests</h3>
          {visitRequests.length === 0 && <p className="muted">No visit requests yet</p>}
          <ul className="list">
            {visitRequests.map(v => (
              <li key={v.id} className="list-item">
                <div className="visit-row">
                  <div>
                    <strong>{v.village}</strong> • {v.preferredDate}
                    <div className="muted small">{v.locationDetails}</div>
                  </div>
                  <div className={`badge status-${v.status}`}>{v.status}</div>
                </div>
                {v.status === 'pending' && (
                  <button className="btn btn-secondary tiny" onClick={() => markVisitRequestCompleted(v.id)}>Mark Completed</button>
                )}
                {v.responseMessage && <div className="muted small">{v.responseMessage}</div>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
};

export default VisitRequestScreen;
