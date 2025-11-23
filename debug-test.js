const { chromium } = require('playwright');

async function test() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to https://www.evaadm.com...');
  await page.goto('https://www.evaadm.com/', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  console.log('Waiting for stability...');
  await page.waitForTimeout(1000);

  console.log('Getting title...');
  const title = await page.title();
  console.log('Title:', title);

  console.log('Getting URL...');
  const url = page.url();
  console.log('URL:', url);

  await browser.close();
  console.log('Done!');
}

test().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
