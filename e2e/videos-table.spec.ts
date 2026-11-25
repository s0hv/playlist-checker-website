import { expect, playlists, test } from './fixtures';

test.describe('videos table', () => {
  test('loads the first page sorted by newest id', async ({ videosPage, page }) => {
    const request = await videosPage.open();

    expect(request).toMatchObject({ limit: 10, offset: 0, where: [], sort: [{ table: 'video', col: 'id', asc: false }] });
    // Tags are hidden by default, so they are not fetched
    expect(request.select.tag).toBeUndefined();
    await expect(page.getByRole('cell', { name: 'Video 42', exact: true })).toBeVisible();
  });

  test('requests the next page', async ({ videosPage, page }) => {
    await videosPage.open();

    const request = await videosPage.nextRequest(() => page.getByRole('button', { name: 'Go to next page' }).click());

    expect(request).toMatchObject({ limit: 10, offset: 10 });
    await expect(page.getByRole('cell', { name: 'Video 32', exact: true })).toBeVisible();
  });

  test('sorts by a clicked header and returns to the first page', async ({ videosPage, page }) => {
    await videosPage.open();
    await videosPage.nextRequest(() => page.getByRole('button', { name: 'Go to next page' }).click());

    const request = await videosPage.nextRequest(() => videosPage.header('Title').getByText('Title').click());

    expect(request).toMatchObject({ offset: 0, sort: [{ table: 'video', col: 'title', asc: true }] });
  });

  test('filters text columns with the selected mode', async ({ videosPage, page }) => {
    await videosPage.open();
    const titleFilter = (await videosPage.filterCell('Title')).getByRole('textbox');

    const contains = await videosPage.nextRequest(() => titleFilter.fill('50%'));
    expect(contains.where).toEqual([{ table: 'video', col: 'title', comp: 'ILIKE', value: String.raw`%50\%%` }]);

    const startsWith = await videosPage.selectFilterMode('Title', 'Starts with');
    expect(startsWith.where).toEqual([{ table: 'video', col: 'title', comp: 'ILIKE', value: String.raw`50\%%` }]);
    await expect(page.getByText('Filter mode: Starts with')).toBeVisible();
  });

  test('filters empty values without typing anything', async ({ videosPage }) => {
    await videosPage.open();

    const request = await videosPage.selectFilterMode('Filename', 'Empty');

    expect(request.where).toEqual([{ table: 'video', col: 'downloaded_filename', comp: 'empty', value: '' }]);
  });

  test('filters dates after the picked day', async ({ videosPage, page }) => {
    await videosPage.open();
    await videosPage.selectFilterMode('Published at', 'After date');

    const cell = await videosPage.filterCell('Published at');
    await cell.getByRole('group').click();
    const request = await videosPage.nextRequest(() => page.keyboard.type('11252026'));

    expect(request.where).toEqual([{ table: 'video', col: 'published_at', comp: 'after', value: '2026-11-25' }]);
  });

  test('filters booleans', async ({ videosPage, page }) => {
    await videosPage.open();
    const cell = await videosPage.filterCell('Deleted');
    await cell.getByRole('button', { name: 'Change boolean filter' }).click();

    const request = await videosPage.nextRequest(() => page.getByRole('menuitem', { name: 'True' }).click());

    expect(request.where).toEqual([{ table: 'video', col: 'deleted', comp: 'true', value: '' }]);
  });

  test('filters file sizes with the range slider', async ({ videosPage, page }) => {
    await videosPage.open();
    await videosPage.toggleColumn('Filesize');
    const cell = await videosPage.filterCell('Filesize');
    await cell.getByRole('slider').first().focus();

    const request = await videosPage.nextRequest(() => page.keyboard.press('ArrowRight'));

    // Slider positions are logarithmic: position 1 is about 11.5 kb and the maximum about 10 Gb
    expect(request.where).toEqual([
      { table: 'video', col: 'filesize', comp: '>=', value: 11763 },
      { table: 'video', col: 'filesize', comp: '<=', value: 10737418240 },
    ]);
  });

  test('filters by selected playlists', async ({ videosPage, page }) => {
    await videosPage.open();
    await videosPage.toggleColumn('Playlists');
    const cell = await videosPage.filterCell('Playlists');
    await cell.getByRole('combobox').click();

    const request = await videosPage.nextRequest(() => page.getByRole('option', { name: playlists[1].name }).click());

    expect(request.where).toEqual([{ table: 'playlist', col: 'id', comp: 'arrayAny', value: [playlists[1].id] }]);
  });

  test('remembers shown columns after a reload', async ({ videosPage }) => {
    await videosPage.open();

    const shown = await videosPage.toggleColumn('Tags');
    expect(shown.select.tag).toEqual(['tag']);

    const reloaded = await videosPage.reload();
    expect(reloaded.select.tag).toEqual(['tag']);
    expect(await videosPage.headerNames()).toContain('Tags');
  });

  test('reorders columns by dragging and resets the layout', async ({ videosPage, page }) => {
    await videosPage.open();
    const defaultOrder = await videosPage.headerNames();
    expect(defaultOrder.slice(0, 3)).toEqual(['ID', 'Video ID', 'Title']);

    const handle = videosPage.header('Title').getByRole('button', { name: 'Reorder column' });
    const target = await videosPage.header('ID').boundingBox();
    await handle.hover();
    await page.mouse.down();
    await page.mouse.move(target!.x + 10, target!.y + target!.height / 2, { steps: 10 });
    await page.mouse.up();

    await expect.poll(() => videosPage.headerNames()).toEqual(['Title', 'ID', 'Video ID', ...defaultOrder.slice(3)]);

    await videosPage.reload();
    await expect.poll(() => videosPage.headerNames()).toEqual(['Title', 'ID', 'Video ID', ...defaultOrder.slice(3)]);

    await page.getByRole('button', { name: 'Reset column layout' }).click();
    await expect.poll(() => videosPage.headerNames()).toEqual(defaultOrder);
  });

  test('shows video details in an expanded row', async ({ videosPage, page }) => {
    await videosPage.open();

    await page.getByRole('button', { name: 'Expand row' }).first().click();

    await expect(page.getByText('Description of video 42')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Video 42' })).toHaveAttribute('href', /search_query=Video%2042/);
  });

  test('toggles density and full screen', async ({ videosPage, page }) => {
    await videosPage.open();
    const table = page.getByRole('table');
    const paddingOf = () => table.locator('tbody td').nth(1).evaluate(cell => getComputedStyle(cell).paddingTop);

    const comfortable = await paddingOf();
    await page.getByRole('button', { name: 'Toggle density' }).click();
    expect(await paddingOf()).not.toBe(comfortable);

    await page.getByRole('button', { name: 'Full screen' }).click();
    const paper = table.locator('xpath=ancestor::div[contains(@class, "MuiPaper-root")][1]');
    await expect(paper).toHaveCSS('position', 'fixed');

    await page.getByRole('button', { name: 'Exit full screen' }).click();
    await expect(paper).not.toHaveCSS('position', 'fixed');
  });
});
