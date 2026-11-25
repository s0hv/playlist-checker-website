import { type Locator, type Page, type Request, test as base } from '@playwright/test';

import type { GetVideoQuery } from '@/api/videos';
import { cookieNames } from '@/src/auth/cookie';

export const totalVideos = 42;

export const playlists = [
  { id: 3, name: 'Music' },
  { id: 7, name: 'Lectures' },
];

const makeRows = (offset: number, limit: number) => Array.from(
  { length: Math.max(0, Math.min(limit, totalVideos - offset)) },
  (_, index) => {
    const id = totalVideos - offset - index;

    return {
      id,
      videoId: `vid${id}`,
      title: `Video ${id}`,
      description: `Description of video ${id}`,
      publishedAt: Date.UTC(2024, 0, id),
      deleted: id % 2 === 0,
      download: true,
      downloadedFilename: `video${id}.mkv`,
      downloadedFormat: 'mkv',
      filesize: id * 1024 * 1024,
      tagTag: ['rock', `tag${id}`],
      playlistName: ['Music'],
    };
  }
);

export type VideosRequest = GetVideoQuery & { limit: number, offset: number };

const parseVideosRequest = (request: Request): VideosRequest => {
  const url = new URL(request.url());

  return {
    ...(request.postDataJSON() as GetVideoQuery),
    limit: Number(url.searchParams.get('limit')),
    offset: Number(url.searchParams.get('offset')),
  };
};

const isVideosRequest = (request: Request) => new URL(request.url()).pathname === '/api/videos';

export class VideosPage {
  constructor(readonly page: Page) {}

  /**
   * Runs `action` and returns the videos API request it triggers.
   */
  async nextRequest(action: () => Promise<unknown>): Promise<VideosRequest> {
    const [request] = await Promise.all([
      this.page.waitForRequest(isVideosRequest),
      action(),
    ]);

    return parseVideosRequest(request);
  }

  async open(): Promise<VideosRequest> {
    return this.nextRequest(() => this.page.goto('/'));
  }

  async reload(): Promise<VideosRequest> {
    return this.nextRequest(() => this.page.reload());
  }

  headerRow(): Locator {
    return this.page.locator('thead tr').nth(0);
  }

  async headerNames(): Promise<string[]> {
    // The first header cell belongs to the expand buttons
    const names = await this.headerRow().locator('th').allInnerTexts();
    return names.slice(1).map(name => name.trim());
  }

  header(name: string): Locator {
    return this.headerRow().locator('th').filter({ hasText: new RegExp(`^${name}$`) });
  }

  async filterCell(name: string): Promise<Locator> {
    const index = (await this.headerNames()).indexOf(name);
    if (index === -1) throw new Error(`Column ${name} is not visible`);

    return this.page.locator('thead tr').nth(1).locator('th').nth(index + 1);
  }

  async selectFilterMode(column: string, mode: string): Promise<void> {
    const cell = await this.filterCell(column);
    await cell.getByRole('button', { name: 'Change filter mode' }).click();
    await this.page.getByRole('menuitem', { name: mode, exact: true }).click();
  }

  async toggleColumn(name: string): Promise<VideosRequest> {
    await this.page.getByRole('button', { name: 'Show/hide columns' }).click();
    const request = await this.nextRequest(() => this.page.getByRole('presentation').getByRole('button', { name, exact: true }).click());
    await this.page.keyboard.press('Escape');

    return request;
  }
}

export const test = base.extend<{ videosPage: VideosPage }>({
  videosPage: async ({ page, context, baseURL }, use) => {
    // The page middleware only checks that a session cookie exists
    await context.addCookies([{ name: cookieNames.session, value: 'e2e', url: baseURL! }]);

    await page.route(url => url.pathname === '/api/videos', async route => {
      const { limit, offset } = parseVideosRequest(route.request());
      await route.fulfill({ json: { rows: makeRows(offset, limit), count: totalVideos } });
    });
    await page.route(url => url.pathname === '/api/playlists', route => route.fulfill({ json: { rows: playlists } }));

    await use(new VideosPage(page));
  },
});

export { expect } from '@playwright/test';
