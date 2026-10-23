import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="auth">
      <div className="auth-card">
        <p className="eyebrow">404 · NOT FOUND</p>
        <h1>这条金路不通。</h1>
        <p>页面可能已经下架，或者链接写错了。回到首页重新算一笔。</p>
        <Link href="/" className="btn primary">返回首页</Link>
      </div>
    </div>
  );
}
