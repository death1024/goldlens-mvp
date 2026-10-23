'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="auth">
      <div className="auth-card">
        <p className="eyebrow">SOMETHING BROKE</p>
        <h1>这一笔没算成。</h1>
        <p>页面遇到临时错误。价格与持仓不会因此丢失；可以重试或回到首页。</p>
        <div className="row">
          <button className="btn primary" onClick={reset}>重试</button>
          <Link href="/" className="btn ghost">返回首页</Link>
        </div>
      </div>
    </div>
  );
}
