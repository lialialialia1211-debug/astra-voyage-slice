import { useState } from 'react';
import { content } from '../../content';
import type { StoryLineDefinition } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { userAssetUrl } from '../../lib/user-assets';

function speakerName(line: StoryLineDefinition): string {
  if (line.speakerId === 'captain') return '艦長';
  if (line.speakerId === 'narration') return '遠征紀錄';
  return content.characters.find((character) => character.id === line.speakerId)?.name ?? line.speakerId;
}

function portraitAssetId(line: StoryLineDefinition, captainId: 'cap_m' | 'cap_f' | null): string | null {
  if (!line.expression || line.speakerId === 'narration') return null;
  if (line.speakerId === 'captain') {
    const expression = line.expression === 'angry' ? 'tense' : line.expression;
    return `${captainId ?? 'cap_f'}_portrait_${expression}`;
  }
  const expression = line.expression === 'tense' ? 'angry' : line.expression;
  return `${line.speakerId}_portrait_${expression}`;
}

export function StoryScreen() {
  const { state, dispatch } = useGame();
  const [lineIndex, setLineIndex] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const story = content.stories.find((entry) => entry.id === state.activeStoryId);

  if (!story) {
    return (
      <section className="screen-card">
        <h1>沒有可播放的劇情</h1>
        <button type="button" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'expedition-map' })}>返回地圖</button>
      </section>
    );
  }

  const line = story.lines[lineIndex]!;
  const assetId = portraitAssetId(line, state.captainId);
  const artUrl = assetId ? userAssetUrl(assetId) : null;
  const isLast = lineIndex === story.lines.length - 1;

  function complete() {
    dispatch({ type: 'COMPLETE_STORY' });
  }

  return (
    <section className={`story-screen story-screen--${story.background}`} aria-labelledby="story-title">
      <header className="story-header">
        <div><p className="eyebrow">MAIN STORY // LAND</p><h1 id="story-title">{story.title}</h1></div>
        <span>{story.location}</span>
      </header>
      <div className="story-stage">
        {artUrl && (
          <img
            alt={`${line.speakerId === 'captain' ? state.captainId === 'cap_m' ? '男性艦長' : '女性艦長' : speakerName(line)} ${line.expression} 表情`}
            className={`story-portrait story-portrait--${line.side ?? 'left'}`}
            src={artUrl}
          />
        )}
        <div className="story-progress">{lineIndex + 1} / {story.lines.length}</div>
      </div>
      <div className="story-dialogue">
        <strong>{speakerName(line)}</strong>
        <p>{line.text}</p>
        <div className="story-controls">
          <button type="button" onClick={() => setShowLog(true)}>對話紀錄</button>
          <button type="button" onClick={complete}>略過劇情</button>
          <button
            className="primary-action"
            type="button"
            onClick={() => isLast ? complete() : setLineIndex((current) => current + 1)}
          >{isLast ? '完成劇情' : '下一句'}</button>
        </div>
      </div>
      {showLog && (
        <section aria-label="對話紀錄" aria-modal="true" className="story-log" role="dialog">
          <div><h2>對話紀錄</h2><button type="button" onClick={() => setShowLog(false)}>關閉</button></div>
          <ol>
            {story.lines.slice(0, lineIndex + 1).map((entry, index) => (
              <li key={index}><strong>{speakerName(entry)}</strong><p>{entry.text}</p></li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}
