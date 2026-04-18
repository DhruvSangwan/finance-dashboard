// =============================================================
// CONFIRM DIALOG (components/ConfirmDialog.jsx)
// A proper styled confirmation modal — replaces window.confirm()
// Much more professional than the browser's ugly default popup.
//
// Usage:
//   const [confirm, setConfirm] = useState(null);
//   setConfirm({ message: 'Delete?', onConfirm: () => deleteIt() });
//   {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
// =============================================================

const ConfirmDialog = ({ message, onConfirm, onCancel, danger = true }) => (
  <div className="modal-overlay">
    <div className="modal" style={{ maxWidth: '380px' }}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        {/* Warning icon */}
        <div style={{
          width: '52px', height: '52px',
          borderRadius: '50%',
          background: danger ? '#fef2f2' : '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.5rem'
        }}>
          {danger ? '🗑️' : '❓'}
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Are you sure?
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {message}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={onCancel} style={{ minWidth: '100px' }}>
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onCancel(); }}
          style={{
            minWidth: '100px',
            background: danger ? 'var(--danger)' : 'var(--primary)',
            color: 'white', border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 1.25rem',
            fontWeight: '500', cursor: 'pointer'
          }}
        >
          {danger ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
