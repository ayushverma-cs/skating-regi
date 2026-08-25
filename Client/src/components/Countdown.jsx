export default function Countdown() {
  return (
    <section style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc' }}>
      <h2>Event Starts In</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {['Days', 'Hours', 'Minutes', 'Seconds'].map((label) => (
          <div key={label} style={{ padding: '1rem', borderRadius: '12px', background: '#fff', minWidth: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>00</div>
            <div style={{ color: '#64748b' }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
