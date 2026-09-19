import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../portfolio_backend/package.json', import.meta.url));
const { PDFDocument } = require('pdf-lib');
async function admin(page) {
  await page.goto('/admin');
  await page.getByLabel(/^Email/).fill('qa@example.test');
  await page.getByLabel(/^Password/).fill('qa-fixture-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your portfolio, in one place.' })).toBeVisible();
}
test('all five themes persist, including auth and CMS controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  for (const theme of ['dark', 'light', 'midnight', 'graphite', 'terminal']) {
    await page.getByLabel('Theme', { exact: true }).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.screenshot({ path: 'artifacts/qa/theme-' + theme + '.png' });
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'terminal');
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'terminal');
  await expect(page.getByText(/Google sign-in is not configured/)).toBeVisible();
  await admin(page);
  await expect(page.getByLabel('Theme', { exact: true })).toHaveValue('terminal');
});
test('wheel boundaries require a fresh gesture and preserve browser history', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  const main = page.locator('.page-scroll');
  await main.hover();
  await page.waitForTimeout(1000);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(200);
  await expect(page).toHaveURL(/\/$/);
  await main.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(350);
  const homeTop = await main.evaluate((el) => el.scrollTop);
  expect(homeTop).toBeGreaterThan(0);
  await page.mouse.wheel(0, 150);
  await expect(page).toHaveURL(/\/profile$/);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 80);
    await page.waitForTimeout(60);
  }
  await expect(page).toHaveURL(/\/profile$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => main.evaluate((el) => el.scrollTop)).toBeGreaterThan(homeTop - 5);
  await page.goForward();
  await expect(page).toHaveURL(/\/profile$/);
  await main.evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(1100);
  await page.mouse.wheel(0, -150);
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: 'Scroll navigation', exact: true }).click();
  await main.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(1100);
  await page.mouse.wheel(0, 200);
  await expect(page).toHaveURL(/\/$/);
});
test('reduced motion disables automatic routing and showroom interaction stays isolated', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Scroll navigation', exact: true })).toBeDisabled();
  await page.locator('.page-scroll').evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.locator('.page-scroll').hover();
  await page.waitForTimeout(1000);
  await page.mouse.wheel(0, 500);
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/showroom');
  await page.getByRole('tab', { name: /TypeWriter/ }).click();
  const frame = page.frameLocator('iframe');
  await frame.getByLabel('Test text').fill('Isolated interaction');
  await frame.getByLabel('Test text').hover();
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(1100);
  await expect(page).toHaveURL(/\/showroom$/);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.site-footer')).toBeInViewport();
  expect(await page.locator('.showroom-window').evaluate((el) => el.clientHeight)).toBeGreaterThan(
    (await page.locator('.page-scroll').evaluate((el) => el.clientHeight)) / 2,
  );
});
test('signup, persistent session, admin denial, password change, logout and login', async ({
  page,
}) => {
  const email = 'visitor-' + Date.now() + '@example.test';
  await page.goto('/signup');
  await page.getByLabel(/^Name/).fill('Browser visitor');
  await page.getByLabel(/^Email/).fill(email);
  await page.getByLabel(/^Password/).fill('browser-visitor-password-123');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: 'Browser visitor' })).toBeVisible();
  await page.reload();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
  await page.goto('/admin');
  await expect(page.getByText('Administrator access required')).toBeVisible();
  expect((await page.request.get('/api/admin/users')).status()).toBe(403);
  await page.goto('/account');
  await page.getByLabel(/^Current password/).fill('browser-visitor-password-123');
  await page.getByLabel(/^New password/).fill('updated-visitor-password-123');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByRole('status')).toContainText('Password updated');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel(/^Email/).fill(email);
  await page.getByLabel(/^Password/).fill('updated-visitor-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
});
test('granular CMS and resume upload round-trip to separate public pages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await admin(page);
  await page.goto('/admin/hero');
  await page.getByLabel('Greeting', { exact: true }).fill('A verified introduction');
  await page.getByRole('button', { name: 'Save hero', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Hero saved');
  await page.goto('/admin/profile');
  await page.getByRole('button', { name: 'Add education entry' }).click();
  await page.getByLabel(/^Title/).fill('Browser-test education');
  await page.getByLabel('Organization', { exact: true }).fill('Isolated QA institution');
  await page.getByRole('button', { name: 'Save profile details' }).click();
  await expect(page.getByRole('status')).toContainText('Profile details saved');
  await page.goto('/admin/about');
  await page
    .getByLabel('Biography', { exact: true })
    .fill('A narrative saved through the granular About editor.');
  await page.getByRole('button', { name: 'Save about' }).click();
  await expect(page.getByRole('status')).toContainText('About saved');
  await page.goto('/admin/contact');
  await page.getByLabel('Contact heading', { exact: true }).fill('Contact from the CMS');
  await page.getByRole('button', { name: 'Save contact' }).click();
  await expect(page.getByRole('status')).toContainText('Contact saved');
  await page.goto('/admin/footer');
  await page.getByLabel('Copyright override', { exact: true }).fill('Verified footer content');
  await page.getByRole('button', { name: 'Save footer' }).click();
  await expect(page.getByRole('status')).toContainText('Footer saved');
  await page.goto('/admin/resume');
  const pdf = await PDFDocument.create();
  pdf.addPage().drawText('Isolated QA resume. Not a real professional document.');
  await page.locator('input[type=file]').setInputFiles({
    name: 'resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await pdf.save()),
  });
  await page.getByRole('button', { name: 'Upload PDF' }).click();
  await expect(page.getByRole('status')).toContainText('Resume PDF uploaded');
  await page.goto('/');
  await expect(page.getByText('A verified introduction')).toBeVisible();
  await expect(page.locator('.site-footer')).toContainText('Verified footer content');
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Browser-test education' })).toBeVisible();
  await page.goto('/about');
  await expect(
    page.getByText('A narrative saved through the granular About editor.'),
  ).toBeVisible();
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: 'Contact from the CMS' })).toBeVisible();
  await page.goto('/resume');
  await expect(page.getByRole('link', { name: 'View resume', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browser-test education' })).toBeVisible();
  await page.getByRole('button', { name: 'Preview document here' }).click();
  await expect(page.getByTitle('Resume PDF preview')).toBeVisible();
  const link = page.getByRole('link', { name: 'Download resume', exact: true });
  const response = await page.request.get(await link.getAttribute('href'));
  expect(response.status()).toBe(200);
  expect(response.headers()['content-disposition']).toContain('attachment');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await page.goto('/admin/resume');
  await page.getByLabel('Show download action').uncheck();
  await page.getByRole('button', { name: 'Save resume settings' }).click();
  await expect(page.getByRole('status')).toContainText('Resume settings saved');
  await page.goto('/resume');
  await expect(page.getByRole('link', { name: 'Download resume', exact: true })).toHaveCount(0);
});
