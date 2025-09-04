import React from "react";
import { useNavigate } from "react-router-dom";
import { useFarmerContext } from "../context/FarmerContext";

const AchievementsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { achievements, totalCarbonCredits, plots } = useFarmerContext();

  const totalPoints = achievements.reduce(
    (sum, achievement) => sum + achievement.points,
    0
  );
  const totalArea = plots.reduce((sum, plot) => sum + plot.area, 0);

  return (
    <main className="screen">
      <header className="app-header">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>
        <h1>Achievements</h1>
        <div style={{ width: 40 }} />
      </header>
      <section className="content">
        <div className="stats-overview">
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <div className="stat-content">
              <span className="stat-number">{achievements.length}</span>
              <span className="stat-label">Achievements</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <div className="stat-content">
              <span className="stat-number">{totalPoints}</span>
              <span className="stat-label">Total Points</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🌍</span>
            <div className="stat-content">
              <span className="stat-number">{totalArea.toFixed(1)}</span>
              <span className="stat-label">Acres Mapped</span>
            </div>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎯</span>
            <h3>No achievements yet</h3>
            <p className="muted">
              Start mapping your farm plots to unlock achievements!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/map")}
            >
              Map Your First Plot
            </button>
          </div>
        ) : (
          <div className="achievements-list">
            <h3>Your Achievements</h3>
            {achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <div className="achievement-icon">
                  <span className="icon">{achievement.icon}</span>
                </div>
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p className="muted">{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className="points">+{achievement.points} points</span>
                    <span className="date">
                      {achievement.unlockedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="upcoming-achievements">
          <h3>Upcoming Challenges</h3>
          <div className="challenge-list">
            <div className="challenge-item">
              <span className="icon">🌾</span>
              <div>
                <h4>Harvest Hero</h4>
                <p className="muted">Map 5 different crop plots</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((plots.length / 5) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">{plots.length}/5 plots</span>
              </div>
            </div>

            <div className="challenge-item">
              <span className="icon">🌱</span>
              <div>
                <h4>Carbon Champion</h4>
                <p className="muted">Earn 100 carbon credits</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (totalCarbonCredits / 100) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {totalCarbonCredits}/100 credits
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AchievementsScreen;
