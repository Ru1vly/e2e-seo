import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

interface SeoCheckResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface CheckResult {
  passed: boolean;
  message: string;
  category: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoCheckResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState('basic');
  const [activeTab, setActiveTab] = useState<'all' | 'passed' | 'failed'>('all');

  const handleCheck = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await invoke<SeoCheckResult>('run_seo_check', {
        url,
        config: selectedPreset,
      });
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!result) return null;

    if (!result.success) {
      return (
        <div className="error-container">
          <h2>Error</h2>
          <p>{result.error}</p>
        </div>
      );
    }

    if (!result.data) return null;

    const checks = result.data.checks || [];
    const filteredChecks = checks.filter((check: CheckResult) => {
      if (activeTab === 'passed') return check.passed;
      if (activeTab === 'failed') return !check.passed;
      return true;
    });

    const passedCount = checks.filter((c: CheckResult) => c.passed).length;
    const failedCount = checks.length - passedCount;
    const passRate = checks.length > 0 ? ((passedCount / checks.length) * 100).toFixed(1) : 0;

    return (
      <div className="results-container">
        <div className="summary">
          <h2>SEO Check Results</h2>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Total Checks:</span>
              <span className="stat-value">{checks.length}</span>
            </div>
            <div className="stat-item passed">
              <span className="stat-label">Passed:</span>
              <span className="stat-value">{passedCount}</span>
            </div>
            <div className="stat-item failed">
              <span className="stat-label">Failed:</span>
              <span className="stat-value">{failedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pass Rate:</span>
              <span className="stat-value">{passRate}%</span>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${passRate}%` }}
            ></div>
          </div>
        </div>

        <div className="tabs">
          <button
            className={activeTab === 'all' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('all')}
          >
            All ({checks.length})
          </button>
          <button
            className={activeTab === 'passed' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('passed')}
          >
            Passed ({passedCount})
          </button>
          <button
            className={activeTab === 'failed' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('failed')}
          >
            Failed ({failedCount})
          </button>
        </div>

        <div className="checks-list">
          {filteredChecks.map((check: CheckResult, index: number) => (
            <div
              key={index}
              className={`check-item ${check.passed ? 'passed' : 'failed'}`}
            >
              <div className="check-status">
                {check.passed ? '✓' : '✗'}
              </div>
              <div className="check-content">
                <div className="check-category">{check.category}</div>
                <div className="check-message">{check.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 E2E SEO Checker</h1>
        <p>Comprehensive SEO analysis for your websites</p>
      </header>

      <div className="input-section">
        <div className="url-input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="url-input"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
          />
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="preset-select"
            disabled={loading}
          >
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="strict">Strict</option>
          </select>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="check-button"
        >
          {loading ? 'Analyzing...' : 'Check SEO'}
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analyzing website...</p>
        </div>
      )}

      {renderResults()}
    </div>
  );
}

export default App;
