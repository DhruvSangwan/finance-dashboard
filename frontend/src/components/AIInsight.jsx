// =============================================================
// AI INSIGHT (components/AIInsight.jsx)
// A button that sends expense data to Claude and shows the result
// This is a single API call — not a conversation/chat
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';

const AIInsight = () => {
  const [insight, setInsight] = useState('');     // Claude's response text
  const [loading, setLoading] = useState(false);  // True while waiting for API
  const [error, setError] = useState('');

  const handleGetInsight = async () => {
    setLoading(true);
    setError('');
    setInsight('');

    try {
      const data = await api.ai.getInsight();
      setInsight(data.insight);
    } catch (err) {
      setError('Failed to get AI insight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-card">
      <div className="ai-header">
        <div>
          <h3>✨ AI Spending Insight</h3>
          <p>Powered by Claude — analyzes your last 30 days</p>
        </div>
        <button
          className="btn-ai"
          onClick={handleGetInsight}
          disabled={loading}
        >
          {loading ? (
            <>
              {/* Loading spinner using CSS animation */}
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            'Get Insight'
          )}
        </button>
      </div>

      {/* Show the insight once it arrives */}
      {insight && (
        <div className="ai-result">
          <p>{insight}</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
};

export default AIInsight;
