import type { CaptainId } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { userAssetUrl } from '../../lib/user-assets';

const captains: { id: CaptainId; label: string; description: string }[] = [
  { id: 'cap_m', label: '男性艦長', description: '25 歲・遠征航路指揮官' },
  { id: 'cap_f', label: '女性艦長', description: '25 歲・遠征航路指揮官' },
];

export function CaptainSelect() {
  const { dispatch } = useGame();

  return (
    <section className="screen-card screen-card--wide" aria-labelledby="captain-title">
      <p className="eyebrow">EXPEDITION REGISTRY</p>
      <h1 id="captain-title">選擇遠征艦長</h1>
      <p className="intro-copy">建立你的遠征身分，從地表文明航向未知星空。</p>
      <div className="captain-grid">
        {captains.map((captain) => (
          <button
            aria-label={captain.label}
            className="captain-choice"
            key={captain.id}
            type="button"
            onClick={() => dispatch({ type: 'SELECT_CAPTAIN', captainId: captain.id })}
          >
            {userAssetUrl(`${captain.id}_card`) && (
              <img
                alt={`${captain.label}立繪`}
                className="captain-art"
                src={userAssetUrl(`${captain.id}_card`) ?? undefined}
              />
            )}
            <strong>{captain.label}</strong>
            <small>{captain.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
