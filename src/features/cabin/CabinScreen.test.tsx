import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { content } from '../../content';
import { EventViewer } from './EventViewer';

it('uses the fade summary without rendering the adult CG', () => {
  const event = content.events.find((entry) => entry.id === 'evt_chr02_bond03')!;

  render(
    <EventViewer
      event={event}
      mode="fade"
      assetUrl="/assets/user/evt_chr02_bond03_cg01.webp"
      onClose={vi.fn()}
      onViewed={vi.fn()}
    />,
  );

  expect(screen.getByText('畫面淡出，事件已完成。')).toBeVisible();
  expect(screen.queryByRole('img', { name: '深潛後的約定 CG' })).not.toBeInTheDocument();
});
