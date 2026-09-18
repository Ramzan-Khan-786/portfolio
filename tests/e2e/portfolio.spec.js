import { test, expect } from '@playwright/test';
const widths = [320, 375, 390, 430, 768, 1024, 1280, 1536];
async function fits(page) {
  const sizes = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
  }));
  expect(sizes.width).toBeLessThanOrEqual(sizes.viewport + 1);
}
async function capture(page, path) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
}
async function login(page) {
  await page.goto('/admin');
  await page.getByLabel('Email', { exact: false }).fill('qa@example.test');
  await page.getByLabel('Password', { exact: false }).fill('qa-fixture-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your portfolio, in one place.' })).toBeVisible();
}
test('public pages and showroom work at eight representative widths', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/',
      '/skills',
      '/work',
      '/work/typewriter',
      '/showroom',
      '/about',
      '/contact',
    ]) {
      await page.goto(path);
      await expect(page.locator('main h1')).toBeVisible();
      if (path === '/showroom')
        await expect(page.frameLocator('iframe').getByLabel('Test text')).toBeVisible();
      await fits(page);
      if ([320, 390, 768, 1536].includes(width) && ['/', '/showroom'].includes(path))
        await capture(
          page,
          'artifacts/qa/' + (path === '/' ? 'profile' : 'showroom') + '-' + width + '.png',
        );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'Showroom' })
    .click();
  await expect(page).toHaveURL(/showroom/);
  const frame = page.frameLocator('iframe');
  await frame.getByLabel('Test text').fill('Working independently');
  await expect(frame.getByText('21 characters')).toBeVisible();
  await page.getByRole('tab', { name: /Next experiment/ }).click();
  await expect(page.getByRole('tabpanel').getByText('Coming soon', { exact: true })).toBeVisible();
  await expect(page.locator('.showroom-window')).toHaveClass(/from-right/);
  await page.screenshot({ path: 'artifacts/qa/coming-soon-390.png', fullPage: true });
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.showroom-window')).toHaveClass(/from-left/);
  await expect(page.getByRole('tab', { name: /TypeWriter/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.goto('/missing/page');
  await expect(page.getByRole('heading', { name: 'This page isn’t here.' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('CMS edits persist through API and MongoDB into the public portfolio', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.getByRole('link', { name: 'Profile & About' }).click();
  await page
    .getByLabel('Availability', { exact: true })
    .fill('Available for verified collaborations');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByRole('status')).toContainText('Profile saved.');
  await page.getByRole('link', { name: 'Skills', exact: true }).click();
  await page.getByRole('button', { name: 'Add skill' }).click();
  await page.getByLabel('Skill name').fill('API testing');
  await page.getByLabel('Category', { exact: false }).fill('Engineering');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('cell', { name: 'API testing', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await page.getByRole('button', { name: 'Add project' }).click();
  await page.getByLabel('Title', { exact: false }).fill('Verified project');
  await page
    .getByLabel('Short description')
    .fill('A real CMS project created through the browser.');
  await page.getByLabel('Full description').fill('This description round-trips through MongoDB.');
  await page.getByLabel('Published', { exact: true }).check();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('cell', { name: 'Verified project', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Showroom', exact: true }).click();
  await page.getByRole('button', { name: 'Add showroom item' }).click();
  await page.getByLabel('Label', { exact: false }).fill('Verified upcoming experience');
  await page.getByLabel('Associated project').selectOption({ label: 'Verified project' });
  await page.getByLabel('Open by default').check();
  await page.getByLabel('Display order').fill('2');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('cell', { name: 'Verified upcoming experience', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Edit Verified upcoming experience' }).click();
  await expect(page.getByLabel('Associated project')).not.toHaveValue('');
  await page.getByRole('button', { name: 'Close editor' }).click();
  await page.getByRole('link', { name: 'Pages', exact: true }).click();
  await page.getByRole('button', { name: 'Add page' }).click();
  await page.getByLabel('Title', { exact: false }).fill('Experience');
  await page.getByLabel('Route slug').fill('experience');
  await page.getByLabel('Page content').fill('Experience created in the CMS.');
  await page.getByLabel('Published', { exact: true }).check();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('cell', { name: 'Experience', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Navigation', exact: true }).click();
  await page.getByRole('button', { name: 'Add navigation item' }).click();
  await page.getByLabel('Label', { exact: false }).fill('Experience');
  await page.locator('#field-destination').fill('/experience');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('cell', { name: '/experience', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Social links', exact: true }).click();
  await page.getByRole('button', { name: 'Add social link' }).click();
  await page.getByLabel('Label', { exact: false }).fill('Email');
  await page.getByLabel('Platform', { exact: false }).fill('email');
  await page.locator('#field-url').fill('mailto:qa@example.test');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('cell', { name: 'Email', exact: true })).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Available for verified collaborations')).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Experience' })
    .click();
  await expect(page.getByText('Experience created in the CMS.')).toBeVisible();
  await page.goto('/work/verified-project');
  await expect(page.getByText('This description round-trips through MongoDB.')).toBeVisible();
  await page.goto('/showroom');
  await expect(page.getByRole('tab', { name: /Verified upcoming/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  expect((await page.request.get('/api/admin/projects')).status()).toBe(401);
});
test('admin login, navigation, forms and lists fit all target widths', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
    await fits(page);
    if (width === 390)
      await page.screenshot({ path: 'artifacts/qa/login-390.png', fullPage: true });
  }
  await login(page);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/admin',
      '/admin/profile',
      '/admin/projects',
      '/admin/navigation',
      '/admin/showroom',
      '/admin/skills',
      '/admin/socials',
      '/admin/settings',
      '/admin/pages',
      '/admin/account',
    ]) {
      await page.goto(path);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.getByRole('heading', { name: /^Loading / })).toHaveCount(0);
      await expect(page.getByRole('alert')).toHaveCount(0);
      if (path === '/admin')
        await expect(
          page.getByRole('heading', { name: 'Recently updated projects' }),
        ).toBeVisible();
      if (path === '/admin/profile')
        await expect(page.getByRole('button', { name: 'Save profile' })).toBeVisible();
      const add = page.getByRole('button', { name: /^Add / });
      if (await add.count()) await add.click();
      await fits(page);
      if ([320, 390, 768, 1536].includes(width) && ['/admin', '/admin/showroom'].includes(path))
        await capture(
          page,
          'artifacts/qa/' +
            (path === '/admin' ? 'dashboard' : 'admin-showroom') +
            '-' +
            width +
            '.png',
        );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open CMS menu' }).click();
  await expect(page.getByRole('navigation', { name: 'CMS navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open CMS menu' })).toBeFocused();
  expect(errors).toEqual([]);
});
test('offline content and missing integration remain usable', async ({ page }) => {
  await page.route('**/api/public/bootstrap', (route) => route.abort());
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Portfolio temporarily unavailable' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.unroute('**/api/public/bootstrap');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('main h1')).toContainText('Building useful software.');
  await page.route('**/api/public/bootstrap', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.data.showroom = [
      {
        _id: 'unconnected',
        label: 'TypeWriter',
        presentationType: 'iframe',
        status: 'live',
        isDefault: true,
      },
    ];
    await route.fulfill({ response, json: body });
  });
  await page.goto('/showroom');
  await expect(page.getByText('TypeWriter isn’t connected yet.')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});
