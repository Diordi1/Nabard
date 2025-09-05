import React from "react";
import { useFarmerContext } from "../context/FarmerContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Define types for the status configuration
type StatusType = "pending" | "approved" | "completed" | "rejected" | "failed";
interface StatusConfig {
  color: string;
  text: string;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  pending: { color: "#f59e0b", text: "Pending" },
  approved: { color: "#10b981", text: "Approved" },
  completed: { color: "#10b981", text: "Completed" },
  rejected: { color: "#ef4444", text: "Rejected" },
  failed: { color: "#ef4444", text: "Failed" },
};

const VisitRequestScreen: React.FC = () => {
  const { visitRequests, requestVisitVerification } = useFarmerContext();
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "1rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2>Request Verification Visit</h2>
        <Link
          to="/dashboard"
          style={{ textDecoration: "none", fontSize: 14, color: "#2563eb" }}
        >
          &larr; Back to Dashboard
        </Link>
      </header>

      <div
        style={{
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>Farmer Information</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div
              style={{
                padding: "0.75rem",
                background: "#f0f9ff",
                borderRadius: "6px",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                Name
              </div>
              <div style={{ fontWeight: "600" }}>
                {user?.name || "Not available"}
              </div>
            </div>
            <div
              style={{
                padding: "0.75rem",
                background: "#f0f9ff",
                borderRadius: "6px",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "0.25rem",
                }}
              >
                Farmer ID
              </div>
              <div style={{ fontWeight: "600" }}>
                {user?.farmerId || "Not available"}
              </div>
            </div>
          </div>
        </div>

        <VisitRequestForm
          onSubmit={requestVisitVerification}
          farmerId={user?.farmerId}
          farmerName={user?.name}
        />
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Previous Verification Requests</h3>
        {visitRequests.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px dashed #e2e8f0",
            }}
          >
            <p style={{ color: "#64748b", margin: 0 }}>
              No verification requests yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {visitRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  padding: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0" }}>
                      {request.village}
                    </h4>
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#64748b" }}
                    >
                      Preferred date:{" "}
                      {new Date(request.preferredDate).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusPill status={request.status as StatusType} />
                </div>

                <p style={{ margin: "0.5rem 0", fontSize: "14px" }}>
                  {request.locationDetails}
                </p>

                {request.responseMessage && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem",
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fcd34d",
                      borderRadius: "4px",
                    }}
                  >
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#92400e" }}
                    >
                      <strong>Response:</strong> {request.responseMessage}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Submitted on{" "}
                  {new Date(request.createdAt).toLocaleDateString()} at{" "}
                  {new Date(request.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const StatusPill: React.FC<{ status: StatusType }> = ({ status }) => {
  const config = statusConfig[status] || { color: "#6b7280", text: status };

  return (
    <span
      style={{
        padding: "0.25rem 0.75rem",
        fontSize: "12px",
        fontWeight: "600",
        borderRadius: "9999px",
        backgroundColor: `${config.color}20`, // Add opacity
        color: config.color,
        textTransform: "capitalize",
      }}
    >
      {config.text}
    </span>
  );
};

interface VisitRequestFormProps {
  onSubmit: (data: {
    farmerId: string;
    farmerName: string;
    village: string;
    locationDetails: string;
    preferredDate: string;
  }) => Promise<any>;
  farmerId?: string;
  farmerName?: string;
}

const VisitRequestForm: React.FC<VisitRequestFormProps> = ({
  onSubmit,
  farmerId,
  farmerName,
}) => {
  const [village, setVillage] = React.useState("");
  const [locationDetails, setLocationDetails] = React.useState("");
  const [preferredDate, setPreferredDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!farmerId || !farmerName) {
      setError("Farmer information is missing");
      return;
    }

    if (!village || !locationDetails || !preferredDate) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await onSubmit({
        farmerId,
        farmerName,
        village,
        locationDetails,
        preferredDate,
      });

      if (!res.ok) {
        setError(res.error || "Failed to submit request");
      } else {
        setSuccess(true);
        setVillage("");
        setLocationDetails("");
        setPreferredDate("");
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <div>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          Village <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          value={village}
          onChange={(e) => setVillage(e.target.value)}
          style={inputStyle}
          placeholder="Enter your village name"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          Location Details <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <textarea
          value={locationDetails}
          onChange={(e) => setLocationDetails(e.target.value)}
          style={{ ...inputStyle, minHeight: "100px" }}
          placeholder="Provide detailed location information, landmarks, directions, etc."
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          Preferred Date <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="date"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          style={inputStyle}
          min={new Date().toISOString().split("T")[0]}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#dc2626",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "6px",
            color: "#166534",
          }}
        >
          <strong>Success!</strong> Your verification request has been
          submitted.
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !farmerId || !farmerName}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Submitting..." : "Submit Verification Request"}
      </button>
    </form>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

export default VisitRequestScreen;
