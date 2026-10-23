export default function Loading() {
  return (
    <div style={{ padding: 40, color: 'var(--muted)', fontSize: 12 }}>
      <span className="badge gold">LOADING</span>
      <p style={{ marginTop: 12 }}>正在取最新价格…</p>
    </div>
  );
}
