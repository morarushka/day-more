export type Tab = 'today' | 'collections' | 'moments';

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
}

const ITEMS: { value: Tab; label: string; icon: string }[] = [
  { value: 'today', label: 'Сегодня', icon: '🌤' },
  { value: 'collections', label: 'Коллекции', icon: '📚' },
  { value: 'moments', label: 'Моменты', icon: '🖼' },
];

export function BottomNav({ tab, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <button
          key={item.value}
          className={`nav-item ${tab === item.value ? 'active' : ''}`}
          onClick={() => onChange(item.value)}
        >
          <span className="nav-item__icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
