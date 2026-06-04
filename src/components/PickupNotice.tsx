import { useSettings } from '../context/SettingsContext'

type Props = {
  compact?: boolean
}

/** Clarifies orders are pickup-only at the branch */
export function PickupNotice({ compact }: Props) {
  const { settings } = useSettings()
  const address = settings.address_ar?.trim()
  const mapsUrl = settings.maps_url?.trim()
  const hours = settings.business_hours?.trim()

  return (
    <div className={`pickup-notice${compact ? ' pickup-notice--compact' : ''}`} role="note">
      <span className="pickup-notice__icon" aria-hidden>
        ◉
      </span>
      <div className="pickup-notice__body">
        <strong>استلام من الفرع</strong>
        <p>الطلب يُحضَّر للاستلام من المقهى — لا يوجد توصيل حالياً.</p>
        {address ? (
          <p className="pickup-notice__address">
            {mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                {address}
              </a>
            ) : (
              address
            )}
          </p>
        ) : null}
        {hours && !compact ? (
          <p className="pickup-notice__hours">{hours}</p>
        ) : null}
      </div>
    </div>
  )
}
