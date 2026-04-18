// =============================================================
// AI INSIGHT (components/AIInsight.jsx)
// Single button that sends expense data to Groq for analysis
// =============================================================

import { useState } from 'react';
import { api } from '../utils/api';

const AIInsight = () => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
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
          <p>Powered by Groq — analyzes your last 30 days</p>
        </div>
        <button className="btn-ai" onClick={handleGetInsight} disabled={loading}>
          {loading ? <><span className="spinner" />Analyzing...</> : 'Get Insight'}
        </button>
      </div>
      {insight && <div className="ai-result"><p>{insight}</p></div>}
      {error && <div className="error-banner" style={{ marginTop: '1rem' }}>{error}</div>}
    </div>
  );
};

export default AIInsight;
