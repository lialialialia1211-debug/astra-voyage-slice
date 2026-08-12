import { useEffect, useState } from 'react';
import { chapterOneContent } from '../../chapter-one/content';
import type { ChapterStoryLine, ChapterStoryScene } from '../../chapter-one/types';
import { content } from '../../content';
import type { StoryLineDefinition } from '../../domain/types';
import { useGame } from '../../game/GameProvider';
import { userAssetUrl } from '../../lib/user-assets';
import { createAudioController } from '../audio/audio-controller';
import { AssetArtwork } from './AssetArtwork';

const storyAudio = createAudioController();

function legacySpeakerName(line: StoryLineDefinition): string {
  if (line.speakerId === 'captain') return '艦長';
  if (line.speakerId === 'narration') return '旁白';
  return content.characters.find((character) => character.id === line.speakerId)?.name ?? line.speakerId;
}

function legacyPortraitAssetId(
  line: StoryLineDefinition,
  captainId: 'cap_m' | 'cap_f' | null,
): string | null {
  if (!line.expression || line.speakerId === 'narration') return null;
  if (line.speakerId === 'captain') {
    const expression = line.expression === 'angry' ? 'tense' : line.expression;
    return `${captainId ?? 'cap_f'}_portrait_${expression}`;
  }
  const expression = line.expression === 'tense' ? 'angry' : line.expression;
  return `${line.speakerId}_portrait_${expression}`;
}

function chapterSpeakerName(line: ChapterStoryLine): string {
  if (line.speakerName) return line.speakerName;
  if (line.speakerId === 'narration') return '旁白';
  return chapterOneContent.actors.find((actor) => actor.id === line.speakerId)?.name ?? line.speakerId;
}

export function StoryScreen() {
  const { state, dispatch } = useGame();
  const [legacyLineIndex, setLegacyLineIndex] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const chapterScene: ChapterStoryScene | undefined = chapterOneContent.scenes.find(
    (entry) => entry.id === state.chapterOne.activeSceneId,
  );
  const chapterLine: ChapterStoryLine | undefined = chapterScene?.lines[state.chapterOne.activeLineIndex];
  const legacyStory = content.stories.find((entry) => entry.id === state.activeStoryId);

  useEffect(() => {
    if (!chapterLine?.audio) return;
    storyAudio.setVolumes(state.audioSettings);
    const bgmUrl = chapterLine.audio.bgmId ? userAssetUrl(chapterLine.audio.bgmId) : null;
    const ambienceUrl = chapterLine.audio.ambienceId
      ? userAssetUrl(chapterLine.audio.ambienceId)
      : null;
    const sfxUrl = chapterLine.audio.sfxId ? userAssetUrl(chapterLine.audio.sfxId) : null;
    if (bgmUrl) void storyAudio.playBgm(bgmUrl);
    if (ambienceUrl) void storyAudio.playAmbience(ambienceUrl);
    if (sfxUrl) void storyAudio.playSfx(sfxUrl);
  }, [
    chapterLine,
    state.audioSettings.master,
    state.audioSettings.bgm,
    state.audioSettings.ambience,
    state.audioSettings.sfx,
  ]);

  if (!state.activeStoryId && chapterScene && chapterLine) {
    const viewpoint = chapterOneContent.actors.find((actor) => actor.id === chapterScene.viewpoint);
    const isLast = state.chapterOne.activeLineIndex === chapterScene.lines.length - 1;
    const backgroundAssetId = chapterLine.backgroundAssetId ?? chapterScene.backgroundAssetId;
    const canSkip = state.chapterOne.completedScenes.includes(chapterScene.id)
      || state.storySettings.allowUnreadFastForward;

    return (
      <section
        aria-labelledby="story-title"
        className={`story-screen chapter-story chapter-story--${chapterLine.tone ?? 'neutral'}`}
      >
        <header className="story-header">
          <div>
            <p className="eyebrow">MAIN STORY // CHAPTER 01</p>
            <h1 id="story-title">{chapterScene.title}</h1>
            <span className="chapter-scene-progress">第 {chapterScene.number} 幕 / 30</span>
          </div>
          <div className="chapter-story-meta">
            <span>{chapterScene.location}</span>
            <span>視點 <strong>{viewpoint?.name ?? chapterScene.viewpoint}</strong></span>
            <span>正史來源：完整章節小說 v0.2</span>
          </div>
        </header>
        <div className="story-stage chapter-story-stage">
          <AssetArtwork
            alt={`${chapterScene.title} 背景`}
            assetId={backgroundAssetId}
            className="chapter-story-background"
            fallbackLabel={chapterScene.location}
          />
          {chapterLine.actors.map((stageActor) => {
            const actor = chapterOneContent.actors.find((entry) => entry.id === stageActor.actorId)!;
            const isCurrent = chapterLine.speakerId === stageActor.actorId
              || (chapterLine.speakerId === 'narrator' && stageActor.actorId === chapterScene.viewpoint);
            return (
              <article
                className={`chapter-story-actor chapter-story-actor--${stageActor.position} ${isCurrent ? 'is-current' : 'is-listening'}`}
                data-testid="story-actor"
                key={`${stageActor.actorId}-${stageActor.position}`}
              >
                <div data-testid={isCurrent ? 'story-actor-current' : undefined}>
                  <AssetArtwork
                    alt={`${actor.name} ${stageActor.expression} 表情`}
                    assetId={`${actor.portraitAssetPrefix}_${stageActor.expression}`}
                    className="chapter-story-actor-art"
                    fallbackLabel={actor.name}
                  />
                  <strong>{actor.name}</strong>
                </div>
              </article>
            );
          })}
          {chapterLine.cgAssetId && chapterLine.adult && state.adultMode === 'hidden-thumbnails' && (
            <div
              aria-label="成人 CG 已依設定隱藏"
              className="chapter-story-cg chapter-story-cg--hidden"
              role="img"
            >
              <strong>成人內容縮圖已隱藏</strong>
              <span>可在顯示設定切換；正史文字不受影響。</span>
            </div>
          )}
          {chapterLine.cgAssetId && (!chapterLine.adult || state.adultMode !== 'hidden-thumbnails') && (
            <AssetArtwork
              alt={`${chapterScene.title} 劇情 CG`}
              assetId={chapterLine.cgAssetId}
              className={`chapter-story-cg ${chapterLine.adult ? `chapter-story-cg--adult-${state.adultMode}` : ''}`}
              fallbackLabel="劇情 CG"
            />
          )}
          <div className="story-progress">
            {state.chapterOne.activeLineIndex + 1} / {chapterScene.lines.length} 節
          </div>
        </div>
        <div className="story-dialogue">
          <strong>{chapterSpeakerName(chapterLine)}</strong>
          <p>{chapterLine.text}</p>
          <div className="story-controls">
            <button
              disabled={state.chapterOne.activeLineIndex === 0}
              onClick={() => dispatch({ type: 'RETREAT_CHAPTER_LINE' })}
              type="button"
            >上一句</button>
            <button onClick={() => setShowLog(true)} type="button">對話紀錄</button>
            <button disabled={!canSkip} onClick={() => dispatch({ type: 'COMPLETE_CHAPTER_SCENE' })} type="button">
              略過本幕
            </button>
            <button
              className="primary-action"
              onClick={() => isLast
                ? dispatch({ type: 'COMPLETE_CHAPTER_SCENE' })
                : dispatch({ type: 'ADVANCE_CHAPTER_LINE' })}
              type="button"
            >{isLast ? '完成本幕' : '下一句'}</button>
          </div>
        </div>
        {showLog && (
          <section aria-label="對話紀錄" aria-modal="true" className="story-log" role="dialog">
            <div><h2>對話紀錄</h2><button onClick={() => setShowLog(false)} type="button">關閉</button></div>
            <ol>
              {chapterScene.lines.slice(0, state.chapterOne.activeLineIndex + 1).map((entry, index) => (
                <li key={index}><strong>{chapterSpeakerName(entry)}</strong><p>{entry.text}</p></li>
              ))}
            </ol>
          </section>
        )}
      </section>
    );
  }

  if (!legacyStory) {
    return (
      <section className="screen-card">
        <h1>沒有可播放的劇情</h1>
        <button onClick={() => dispatch({ type: 'NAVIGATE', screen: 'expedition-map' })} type="button">
          返回地圖
        </button>
      </section>
    );
  }

  const legacyLine = legacyStory.lines[legacyLineIndex]!;
  const assetId = legacyPortraitAssetId(legacyLine, state.captainId);
  const artUrl = assetId ? userAssetUrl(assetId) : null;
  const isLegacyLast = legacyLineIndex === legacyStory.lines.length - 1;

  function completeLegacyStory() {
    dispatch({ type: 'COMPLETE_STORY' });
  }

  return (
    <section className={`story-screen story-screen--${legacyStory.background}`} aria-labelledby="story-title">
      <header className="story-header">
        <div><p className="eyebrow">MAIN STORY // LAND</p><h1 id="story-title">{legacyStory.title}</h1></div>
        <span>{legacyStory.location}</span>
      </header>
      <div className="story-stage">
        {artUrl && (
          <img
            alt={`${legacyLine.speakerId === 'captain' ? state.captainId === 'cap_m' ? '男性艦長' : '女性艦長' : legacySpeakerName(legacyLine)} ${legacyLine.expression} 表情`}
            className={`story-portrait story-portrait--${legacyLine.side ?? 'left'}`}
            src={artUrl}
          />
        )}
        <div className="story-progress">{legacyLineIndex + 1} / {legacyStory.lines.length}</div>
      </div>
      <div className="story-dialogue">
        <strong>{legacySpeakerName(legacyLine)}</strong>
        <p>{legacyLine.text}</p>
        <div className="story-controls">
          <button onClick={() => setShowLog(true)} type="button">對話紀錄</button>
          <button onClick={completeLegacyStory} type="button">略過劇情</button>
          <button
            className="primary-action"
            onClick={() => isLegacyLast ? completeLegacyStory() : setLegacyLineIndex((current) => current + 1)}
            type="button"
          >{isLegacyLast ? '完成劇情' : '下一句'}</button>
        </div>
      </div>
      {showLog && (
        <section aria-label="對話紀錄" aria-modal="true" className="story-log" role="dialog">
          <div><h2>對話紀錄</h2><button onClick={() => setShowLog(false)} type="button">關閉</button></div>
          <ol>
            {legacyStory.lines.slice(0, legacyLineIndex + 1).map((entry, index) => (
              <li key={index}><strong>{legacySpeakerName(entry)}</strong><p>{entry.text}</p></li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}
