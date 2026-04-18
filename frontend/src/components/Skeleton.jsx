// =============================================================
// SKELETON (components/Skeleton.jsx)
// Grey placeholder boxes shown while data is loading.
// Looks much more professional than "Loading..." text.
// =============================================================

// A single skeleton line/box
export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '6px', style = {} }) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius, ...style }}
  />
);

// Skeleton for a stat card
export const SkeletonStatCard = () => (
  <div className="stat-card">
    <SkeletonBox width="60%" height="12px" />
    <SkeletonBox width="80%" height="32px" style={{ marginTop: '8px' }} />
  </div>
);

// Skeleton for an expense list item
export const SkeletonExpenseItem = () => (
  <div className="expense-item" style={{ gap: '1rem' }}>
    <SkeletonBox width="10px" height="10px" borderRadius="50%" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonBox width="50%" height="14px" />
      <SkeletonBox width="30%" height="11px" />
    </div>
    <SkeletonBox width="60px" height="16px" />
  </div>
);

// A full page loading state with multiple skeletons
export const SkeletonDashboard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div className="stats-grid">
      {[1,2,3,4].map(i => <SkeletonStatCard key={i} />)}
    </div>
    <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
    <div className="charts-grid">
      <div className="skeleton" style={{ height: '280px', borderRadius: '12px' }} />
      <div className="skeleton" style={{ height: '280px', borderRadius: '12px' }} />
    </div>
  </div>
);
