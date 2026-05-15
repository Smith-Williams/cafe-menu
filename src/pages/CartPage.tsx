import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'

export function CartPage() {
  const { lines, setQuantity, removeLine, subtotal, totalQuantity } = useCart()

  return (
    <>
      <section className="hero">
        <h1>سلة الطلبات</h1>
        <p>راجع العناصر ثم أكمل الطلب لتأكيده.</p>
      </section>

      <div className="panel">
        <h2>العناصر ({totalQuantity})</h2>

        {lines.length === 0 ? (
          <div className="empty-state">
            السلة فارغة.
            <div style={{ marginTop: '1rem' }}>
              <Link to="/" className="btn btn-primary">
                العودة إلى القائمة
              </Link>
            </div>
          </div>
        ) : (
          <>
            {lines.map((line) => (
              <div key={line.menuItem.id} className="cart-row">
                <div>
                  <strong>{line.menuItem.name_ar}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {formatMoney(Number(line.menuItem.price))} لكل وحدة
                  </div>
                </div>
                <div style={{ textAlign: 'left' as const }}>
                  <div className="qty-controls" aria-label="تعديل الكمية">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(line.menuItem.id, line.quantity - 1)
                      }
                      aria-label="تقليل"
                    >
                      −
                    </button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center' }}>
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(line.menuItem.id, line.quantity + 1)
                      }
                      aria-label="زيادة"
                    >
                      +
                    </button>
                  </div>
                  <div style={{ marginTop: '0.35rem', fontWeight: 700 }}>
                    {formatMoney(Number(line.menuItem.price) * line.quantity)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.35rem 0.65rem' }}
                    onClick={() => removeLine(line.menuItem.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>الإجمالي</span>
              <span className="price" style={{ fontSize: '1.2rem' }}>
                {formatMoney(subtotal)}
              </span>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/checkout" className="btn btn-primary">
                متابعة الطلب
              </Link>
              <Link to="/" className="btn btn-ghost">
                إضافة المزيد
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
