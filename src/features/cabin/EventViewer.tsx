import { useEffect } from 'react';
import type { EventDefinition } from '../../domain/types';
import type { AdultDisplayMode } from '../../game/initial-state';

interface EventViewerProps {
  event: EventDefinition;
  mode: AdultDisplayMode;
  assetUrl: string | null;
  onClose: () => void;
  onViewed: () => void;
}

export function EventViewer({ event, mode, assetUrl, onClose, onViewed }: EventViewerProps) {
  useEffect(() => {
    onViewed();
  }, [onViewed]);

  return (
    <section aria-labelledby="event-viewer-title" aria-modal="true" className="event-viewer" role="dialog">
      <div className="event-viewer-heading">
        <div><p className="eyebrow">PRIVATE RECORD // 18+</p><h2 id="event-viewer-title">{event.title}</h2></div>
        <button type="button" onClick={onClose}>關閉</button>
      </div>
      {mode === 'fade' ? (
        <div className="event-fade-summary">
          <strong>畫面淡出，事件已完成。</strong>
          <p>收藏紀錄與已讀狀態仍會保存；不顯示事件 CG。</p>
        </div>
      ) : assetUrl ? (
        <img alt={`${event.title} CG`} className="event-cg" src={assetUrl} />
      ) : (
        <div className="event-art-placeholder" role="img" aria-label={`${event.title} CG 待匯入`}>
          <strong>CG 待匯入</strong>
          <code>{event.assetId}</code>
        </div>
      )}
      <div className="event-dialogue-plate">
        <p>這段私人紀錄已加入收藏，可隨時從事件收藏再次閱覽。</p>
      </div>
    </section>
  );
}
