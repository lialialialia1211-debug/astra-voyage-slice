import { useState } from 'react';
import { content } from '../../content';
import type { CharacterId } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import type { GameState } from '../../game/initial-state';
import { userAssetUrl } from '../../lib/user-assets';

const roleNames = {
  vanguard: '先鋒',
  caster: '術師',
  support: '支援',
  healer: '治療',
};

export function FormationScreen() {
  const { state, dispatch } = useGame();
  const [party, setParty] = useState<GameState['party']>(state.party);

  function toggleMember(characterId: CharacterId) {
    if (party.includes(characterId)) {
      setParty(party.map((member) => (member === characterId ? null : member)) as GameState['party']);
      return;
    }
    const emptyIndex = party.indexOf(null);
    if (emptyIndex < 0) return;
    const next = [...party] as GameState['party'];
    next[emptyIndex] = characterId;
    setParty(next);
  }

  function useRecommendedParty() {
    setParty(['chr_01', 'chr_02', 'chr_03', 'chr_04']);
  }

  const complete = party.every((member) => member !== null);

  return (
    <section className="screen-card screen-card--wide" aria-labelledby="formation-title">
      <p className="eyebrow">CREW FORMATION</p>
      <h1 id="formation-title">四人遠征編隊</h1>
      <div className="party-slots" aria-label="目前隊伍">
        {party.map((member, index) => {
          const character = content.characters.find((entry) => entry.id === member);
          return (
            <div className="party-slot" key={index}>
              <span>位置 {index + 1}</span>
              <strong>{character?.name ?? '尚未編入'}</strong>
              <small>{character ? roleNames[character.role] : '選擇隊員'}</small>
            </div>
          );
        })}
      </div>
      <div className="roster-grid" aria-label="可用隊員">
        {content.characters.filter((character) => state.roster.includes(character.id)).map((character) => (
          <button
            aria-pressed={party.includes(character.id)}
            className="roster-card"
            key={character.id}
            type="button"
            onClick={() => toggleMember(character.id)}
          >
            {userAssetUrl(`${character.id}_card`) && (
              <img
                alt={`${character.name}角色卡`}
                className="roster-art"
                src={userAssetUrl(`${character.id}_card`) ?? undefined}
              />
            )}
            <span className={`element-dot element-${character.element}`} aria-hidden="true" />
            <strong>{character.name}</strong>
            <small>{roleNames[character.role]}・{character.age} 歲</small>
          </button>
        ))}
      </div>
      <div className="action-row">
        <button className="secondary-action" type="button" onClick={useRecommendedParty}>推薦編隊</button>
        <button
          className="primary-action"
          disabled={!complete}
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_PARTY', party });
            dispatch({ type: 'NAVIGATE', screen: 'expedition-map' });
          }}
        >
          確認編隊
        </button>
      </div>
    </section>
  );
}
