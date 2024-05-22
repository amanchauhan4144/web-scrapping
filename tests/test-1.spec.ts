import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.google.com/search?q=fb&oq=fb&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBBzU5NmowajKoAgCwAgE&sourceid=chrome&ie=UTF-8');
  await page.getByRole('link', { name: 'Facebook - log in or sign up' }).click();
  await page.getByTestId('royal_email').click();
  await page.getByTestId('royal_email').fill('amanchauhancl1@gmail.com');
  await page.getByTestId('royal_email').press('Tab');
  await page.getByTestId('royal_pass').fill('amanabchwhwi');
  await page.getByTestId('royal_login_button').click();
  await page.getByRole('button', { name: 'Log in' }).click()
});