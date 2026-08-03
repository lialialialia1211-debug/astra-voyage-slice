import { useCallback, useEffect, useState } from 'react';
import { content } from '../../content';
import type { EventDefinition } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { resolveAsset, type AssetManifest } from '../../lib/assets';
import { EventViewer } from './EventViewer';
import { eventConditionLabel, isEventUnlocked } from './relation';

export function GalleryScreen() {
  const { state, dispatch } = useGame();
  const [activeEvent, setActiveEvent] = useState<EventDefinition | null>(null);
  const [assetManifest, setAssetManifest] = useState<AssetManifest>({});
  const closeViewer = useCallback(() => setActiveEvent(null), []);
  const markViewed = useCallback(() => {
    if (activeEvent) dispatch({ type: 'MARK_EVENT_VIEWED', eventId: activeEvent.id });
  }, [activeEvent, dispatch]);

  useEffect(() => {
    let cancelled = false;
    fetch('/assets/user/manifest.json')
      .then((response) => response.ok ? response.json() as Promise<Record<string, string>> : {})
      .then((manifest) => { if (!cancelled) setAssetManifest(manifest); })
      .catch(() => { if (!cancelled) setAssetManifest({}); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="gallery-screen" aria-labelledby="gallery-title">
      <header className="gallery-header">
        <div><p className="eyebrow">PRIVATE ARCHIVE // OPTIONAL</p><h1 id="gallery-title">事件收藏</h1></div>
        <div className="gallery-nav">
          <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'cabin' })}>返回艙室</button>
          <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'settings' })}>顯示設定</button>
        </div>
      </header>
      <p className="gallery-disclaimer">本區為可選成人收藏，不提供戰鬥數值或主線門檻。</p>
      <div className="event-grid">
        {content.events.map((event) => {
          const unlocked = isEventUnlocked(event, state);
          const viewed = state.viewedEvents.includes(event.id);
          return (
            <article className={`event-card ${unlocked ? 'is-unlocked' : 'is-locked'}`} key={event.id}>
              <div className="event-thumbnail" aria-hidden="true">
                {state.adultMode === 'hidden-thumbnails' || !unlocked ? 'PRIVATE' : '18+'}
              </div>
              <p>{viewed ? '已讀' : unlocked ? '可閱覽' : '未解鎖'}</p>
              <h2>{event.title}</h2>
              <small>{eventConditionLabel(event, state)}</small>
              <button disabled={!unlocked} type="button" onClick={() => setActiveEvent(event)}>
                {unlocked ? '開啟事件' : '條件未達成'}
              </button>
            </article>
          );
        })}
      </div>
      {activeEvent && (
        <EventViewer
          event={activeEvent}
          mode={state.adultMode}
          assetUrl={resolveAsset(activeEvent.assetId, assetManifest).url}
          onClose={closeViewer}
          onViewed={markViewed}
        />
      )}
    </section>
  );
}
