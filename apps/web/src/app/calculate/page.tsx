import { Calculator } from '@/components/calculator';

export default function CalculatePage() {
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" />TRUE COST CALCULATOR</p>
          <h1>把一张金店小票拆开。</h1>
          <p>选市场、纯度、重量，调工费与税费。结果实时更新，不等待网络。</p>
        </div>
        <span className="badge gold">Deterministic core</span>
      </div>
      <Calculator />
      <p className="note" style={{ marginTop: 14 }}>计算结果用于建立价格锚点，不构成投资建议。泰国以 GTA 公告为参考；其他市场为国际金价 + 可调工费/税的估算，不代表门店报价。</p>
    </>
  );
}
