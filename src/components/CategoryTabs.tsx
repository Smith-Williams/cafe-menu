import type { CategoryTab } from '../lib/categoryIcons'

type Props = {
  tabs: CategoryTab[]
  activeId: string | 'all'
  onChange: (id: string | 'all') => void
}

export function CategoryTabs({ tabs, activeId, onChange }: Props) {
  return (
    <div className="category-strip" role="tablist" aria-label="فئات القائمة">
      {tabs.map((tab) => {
        const active = activeId === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`category-tab ${active ? 'category-tab--active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="category-tab__icon" aria-hidden>
              {tab.icon}
            </span>
            <span className="category-tab__text">
              <span className="category-tab__ar">{tab.labelAr}</span>
              <span className="category-tab__en">{tab.labelEn}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
