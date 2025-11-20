import { useState, useMemo, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

interface SeoCheckResult {
  success: boolean;
  data?: SeoReport;
  error?: string;
}

interface SeoReport {
  url: string;
  timestamp: string;
  score: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  checks: {
    [category: string]: CheckResult[];
  };
}

interface CheckResult {
  passed: boolean;
  message: string;
  category?: string;
  severity?: 'error' | 'warning' | 'info';
}

interface FlatCheck extends CheckResult {
  categoryName: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoCheckResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState('advanced');
  const [activeTab, setActiveTab] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleCheck = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    setResult(null);
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveTab('all');

    try {
      const response = await invoke<SeoCheckResult>('run_seo_check', {
        url,
        config: selectedPreset,
      });
      setResult(response);

      // Add to recent URLs
      if (response.success) {
        setRecentUrls((prev) => {
          const updated = [url, ...prev.filter((u) => u !== url)].slice(0, 5);
          return updated;
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const flattenChecks = useCallback((checks: { [category: string]: CheckResult[] }): FlatCheck[] => {
    const flattened: FlatCheck[] = [];

    const categoryNames: { [key: string]: string } = {
      metaTags: 'Meta Tags',
      headings: 'Headings',
      images: 'Images',
      performance: 'Performance',
      robotsTxt: 'Robots.txt',
      sitemap: 'Sitemap',
      security: 'Security',
      structuredData: 'Structured Data',
      socialMedia: 'Social Media',
      content: 'Content',
      links: 'Links',
      uiElements: 'UI Elements',
      technical: 'Technical SEO',
      accessibility: 'Accessibility',
      urlFactors: 'URL Factors',
      spamDetection: 'Spam Detection',
      pageQuality: 'Page Quality',
      advancedImages: 'Advanced Images',
      multimedia: 'Multimedia',
      coreWebVitals: 'Core Web Vitals',
      analytics: 'Analytics & Tracking',
      mobileUX: 'Mobile UX',
      schemaValidation: 'Schema Validation',
      resourceOptimization: 'Resource Optimization',
      legalCompliance: 'Legal & Compliance',
      ecommerce: 'E-commerce',
      internationalization: 'Internationalization',
    };

    for (const [key, checkArray] of Object.entries(checks)) {
      const categoryName = categoryNames[key] || key;
      checkArray.forEach((check) => {
        flattened.push({
          ...check,
          categoryName,
        });
      });
    }

    return flattened;
  }, []);

  const { filteredChecks, categories } = useMemo(() => {
    if (!result?.success || !result.data) {
      return { filteredChecks: [], categories: [] };
    }

    const allChecks = flattenChecks(result.data.checks);

    const uniqueCategories = Array.from(
      new Set(allChecks.map((c) => c.categoryName))
    ).sort();

    let filtered = allChecks;

    // Filter by tab
    if (activeTab === 'passed') {
      filtered = filtered.filter((c) => c.passed);
    } else if (activeTab === 'failed') {
      filtered = filtered.filter((c) => !c.passed);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.categoryName === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.message.toLowerCase().includes(query) ||
          c.categoryName.toLowerCase().includes(query)
      );
    }

    return { filteredChecks: filtered, categories: uniqueCategories };
  }, [result, activeTab, selectedCategory, searchQuery, flattenChecks]);

  const exportResults = () => {
    if (!result?.data) return;

    const dataStr = JSON.stringify(result.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderScoreGauge = (score: number) => {
    const rotation = (score / 100) * 180;
    const getColor = (s: number) => {
      if (s >= 80) return '#4caf50';
      if (s >= 60) return '#ff9800';
      return '#f44336';
    };

    return (
      <div className="score-gauge">
        <div className="gauge-container">
          <div className="gauge-background"></div>
          <div
            className="gauge-fill"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: getColor(score),
            }}
          ></div>
          <div className="gauge-center">
            <div className="score-value">{score}</div>
            <div className="score-label">Score</div>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!result) return null;

    if (!result.success) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Analysis Failed</h2>
          <p className="error-message">{result.error}</p>
          <button className="retry-button" onClick={handleCheck}>
            Try Again
          </button>
        </div>
      );
    }

    if (!result.data) return null;

    const { summary, score, url: checkedUrl, timestamp } = result.data;
    const passRate = summary.total > 0
      ? ((summary.passed / summary.total) * 100).toFixed(1)
      : '0';

    return (
      <div className="results-container fade-in">
        <div className="summary">
          <div className="summary-header">
            <div className="summary-info">
              <h2>SEO Analysis Results</h2>
              <div className="url-info">
                <span className="url-label">URL:</span>
                <span className="url-value">{checkedUrl}</span>
              </div>
              <div className="timestamp-info">
                {new Date(timestamp).toLocaleString()}
              </div>
            </div>
            {renderScoreGauge(score)}
          </div>

          <div className="stats">
            <div className="stat-item">
              <span className="stat-value">{summary.total}</span>
              <span className="stat-label">Total Checks</span>
            </div>
            <div className="stat-item passed">
              <span className="stat-value">{summary.passed}</span>
              <span className="stat-label">Passed</span>
            </div>
            <div className="stat-item failed">
              <span className="stat-value">{summary.failed}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{passRate}%</span>
              <span className="stat-label">Pass Rate</span>
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${passRate}%` }}
            ></div>
          </div>
        </div>

        <div className="filters-section">
          <div className="tabs">
            <button
              className={activeTab === 'all' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('all')}
            >
              All ({summary.total})
            </button>
            <button
              className={activeTab === 'passed' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('passed')}
            >
              ✓ Passed ({summary.passed})
            </button>
            <button
              className={activeTab === 'failed' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('failed')}
            >
              ✗ Failed ({summary.failed})
            </button>
          </div>

          <div className="filter-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Search checks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button className="export-button" onClick={exportResults} title="Export results">
              📥 Export
            </button>
          </div>
        </div>

        <div className="checks-list">
          {filteredChecks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>No checks match your filters</p>
            </div>
          ) : (
            filteredChecks.map((check, index) => (
              <div
                key={index}
                className={`check-item ${check.passed ? 'passed' : 'failed'} ${
                  check.severity ? `severity-${check.severity}` : ''
                }`}
              >
                <div className="check-status">
                  {check.passed ? '✓' : '✗'}
                </div>
                <div className="check-content">
                  <div className="check-header">
                    <span className="check-category">{check.categoryName}</span>
                    {check.severity && !check.passed && (
                      <span className={`severity-badge ${check.severity}`}>
                        {check.severity}
                      </span>
                    )}
                  </div>
                  <div className="check-message">{check.message}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredChecks.length > 0 && (
          <div className="results-footer">
            Showing {filteredChecks.length} of {summary.total} checks
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 E2E SEO Checker</h1>
        <p>Comprehensive SEO analysis with 260+ automated checks</p>
      </header>

      <div className="input-section">
        <div className="url-input-group">
          <div className="url-input-wrapper">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="url-input"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleCheck()}
              list="recent-urls"
            />
            {recentUrls.length > 0 && (
              <datalist id="recent-urls">
                {recentUrls.map((recentUrl, i) => (
                  <option key={i} value={recentUrl} />
                ))}
              </datalist>
            )}
          </div>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="preset-select"
            disabled={loading}
            title="Choose analysis depth"
          >
            <option value="basic">⚡ Basic (Fast)</option>
            <option value="advanced">🎯 Advanced (Recommended)</option>
            <option value="strict">🔬 Strict (Thorough)</option>
          </select>
        </div>
        <button
          onClick={handleCheck}
          disabled={loading || !url}
          className="check-button"
        >
          {loading ? (
            <>
              <span className="button-spinner"></span>
              Analyzing...
            </>
          ) : (
            <>🚀 Run SEO Analysis</>
          )}
        </button>
      </div>

      {loading && (
        <div className="loading-container fade-in">
          <div className="spinner-wrapper">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Analyzing website...</p>
          <p className="loading-subtext">This may take 10-60 seconds</p>
        </div>
      )}

      {renderResults()}
    </div>
  );
}

export default App;
