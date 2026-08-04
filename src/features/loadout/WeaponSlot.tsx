import type { WeaponDefinition } from '../../domain/types';
import { userAssetUrl } from '../../lib/user-assets';

interface WeaponSlotProps {
  label: string;
  weapon: WeaponDefinition | undefined;
  main?: boolean;
  onClick(): void;
}

export function WeaponSlot({ label, weapon, main = false, onClick }: WeaponSlotProps) {
  const artUrl = weapon ? userAssetUrl(weapon.id) : null;
  return (
    <button
      aria-label={`${label}：${weapon?.name ?? '空欄位'}`}
      className={`weapon-slot${main ? ' weapon-slot--main' : ''}`}
      type="button"
      onClick={onClick}
    >
      {weapon && artUrl ? (
        <img alt={`${weapon.name}武器圖`} className="weapon-art" src={artUrl} />
      ) : (
        <span className="weapon-art-placeholder" aria-hidden="true" />
      )}
      <span className="weapon-slot-label">{label}</span>
      <strong>{weapon?.name ?? '空欄位'}</strong>
      {weapon ? <small>ATK {weapon.attack}・HP {weapon.hp}</small> : <small>點擊選擇武器</small>}
    </button>
  );
}
