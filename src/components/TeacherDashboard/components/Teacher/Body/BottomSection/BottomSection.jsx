import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './BottomSection.css';

const API_BASE_URL = 'http://localhost:5000';

const BottomSection = () => {
  const { id } = useParams(); // Teacher ID from the URL
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recent-activities/${id}`);
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des activités récentes.");
      }
    };

    fetchActivities();
  }, [id]);

  const getDotColor = (type) => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="bottom-section">
      <div className="bottom-section-card">
        <h3>Activités récentes</h3>

        {error && <div className="error-msg">{error}</div>}

        <div className="activity-list">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div
                key={index}
                className="activity-item"
                style={{ '--bar-color': getDotColor(activity.type) }}
              >
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activity">Aucune activité récente pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomSection;
