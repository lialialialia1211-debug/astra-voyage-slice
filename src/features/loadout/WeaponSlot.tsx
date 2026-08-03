import type { WeaponDefinition } from '../../domain/types';

interface WeaponSlotProps {
  label: string;
  weapon: WeaponDefinition | undefined;
  main?: boolean;
  onClick(): void;
}

export function WeaponSlot({ label, weapon, main = false, onClick }: WeaponSlotProps) {
  return (
    <button
      aria-label={`${label}：${weapon?.name ?? '空欄位'}`}
      className={`weapon-slot${main ? ' weapon-slot--main' : ''}`}
      type="button"
      onClick={onClick}
    >
      <span className="weapon-art-placeholder" aria-hidden="true" />
      <span className="weapon-slot-label">{label}</span>
      <strong>{weapon?.name ?? '空欄位'}</strong>
      {weapon ? <small>ATK {weapon.attack}・HP {weapon.hp}</small> : <small>點擊選擇武器</small>}
    </button>
  );
}
