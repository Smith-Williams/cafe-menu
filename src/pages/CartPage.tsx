import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/format'

export function CartPage() {
  const { lines, setQuantity, removeLine, subtotal, totalQuantity } = useCart()
  const { settings } = useSettings()
  const currency = settings.currency_code

  if (lines.length === 0) {
    return (
      <>
        <section className="page-hero page-hero--compact">
          <h1>سلة الطلبات</h1>
        </section>
        <div className="cart-empty">
          <div className="cart-empty__icon" aria-hidden>🛒</div>
          <p className="cart-empty__msg">سلتك فارغة</p>
          <p className="cart-empty__sub">أضف شيئاً من القائمة لتبدأ</p>
          <Link to="/" className="btn btn-primary">تصفّح القائمة</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <section className="page-hero page-hero--compact">
        <h1>سلة الطلبات</h1>
        <p>{totalQuantity} صنف</p>
      </section>

      <div className="cart-page">
        <div className="cart-items">
          {lines.map((line) => (
            <div key={line.menuItem.id} className="cart-item">
              {line.menuItem.image_url ? (
                <img
                  className="cart-item__img"
                  src={line.menuItem.image_url}
                  alt={line.menuItem.name_ar}
                  loading="lazy"
                />
              ) : (
                <div className="cart-item__img cart-item__img--placeholder">
                  {(line.menuItem.name_ar?.[0]) ?? '☕'}
                </div>
              )}

              <div className="cart-item__info">
                <p className="cart-item__name">{line.menuItem.name_ar}</p>
                <p className="cart-item__unit">{formatMoney(Number(line.menuItem.price), currency)} × {line.quantity}</p>
              </div>

              <div className="cart-item__controls">
                <div className="qty-controls" aria-label="تعديل الكمية">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.menuItem.id, line.quantity - 1)}
                    aria-label="تقليل"
                  >−</button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.menuItem.id, line.quantity + 1)}
                    aria-label="زيادة"
                  >+</button>
                </div>
                <p className="cart-item__total">
                  {formatMoney(Number(line.menuItem.price) * line.quantity, currency)}
                </p>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => removeLine(line.menuItem.id)}
                  aria-label={`حذف ${line.menuItem.name_ar}`}
                >✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="cart-footer__row">
            <span>الإجمالي</span>
            <span className="price">{formatMoney(subtotal, currency)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary cart-footer__checkout">
            متابعة الطلب ←
          </Link>
          <Link to="/" className="btn btn-ghost cart-footer__more">
            إضافة المزيد
          </Link>
        </div>
      </div>
    </>
  )
}
