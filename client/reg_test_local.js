const puppeteer = require('puppeteer');

(async () => {
  const logs = [];
  const responses = [];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: 'console', text });
    console.log('BROWSER_CONSOLE:', text);
  });
  page.on('pageerror', err => {
    logs.push({ type: 'pageerror', error: err.toString() });
    console.error('BROWSER_PAGE_ERROR:', err);
  });
  page.on('response', async resp => {
    try {
      const url = resp.url();
      if (url.includes('/auth/register')) {
        const status = resp.status();
        let body = '';
        try { body = await resp.json(); } catch (e) { body = await resp.text(); }
        responses.push({ url, status, body });
        console.log('REGISTER_RESPONSE:', status, JSON.stringify(body));
      }
    } catch (e) {
      console.error('response handler error', e);
    }
  });

  try {
    await page.goto('http://localhost:3001/register', { waitUntil: 'networkidle2', timeout: 30000 });

    // STEP 1 - Basic details
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    await page.select('select[name="type"]', 'user');
    await page.type('input[name="name"]', 'Puppeteer User');
    await page.type('input[name="phone"]', '7777777777');
    const email = `puppeteer_${Date.now()}@example.com`;
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', 'Passw0rd!');
    await page.type('input[name="confirmPassword"]', 'Passw0rd!');

    // Click first Continue button
    await page.waitForXPath("//button[contains(., 'Continue')]");
    const [continueBtn] = await page.$x("//button[contains(., 'Continue')]");
    await continueBtn.click();
    await page.waitForTimeout(500);

    // STEP 2 - Other details
    await page.waitForSelector('input[name="street"]', { timeout: 5000 });
    await page.type('input[name="street"]', '123 Test St');
    await page.type('input[name="city"]', 'TestCity');
    await page.type('input[name="state"]', 'TestState');
    await page.type('input[name="postalCode"]', '400001');
    // For user type, need gender and dob
    await page.select('select[name="gender"]', 'Male');
    await page.type('input[name="dob"]', '1990-01-01');

    // Click Continue on step 2
    await page.waitForXPath("//button[contains(., 'Continue') and not(contains(@class,'Back'))]");
    const conts = await page.$x("//button[contains(., 'Continue')]");
    if (conts.length > 0) {
      await conts[conts.length - 1].click();
    }
    await page.waitForTimeout(500);

    // STEP 3 - Review and Register
    await page.waitForXPath("//button[contains(., 'Register')]");
    const [registerBtn] = await page.$x("//button[contains(., 'Register')]");
    await registerBtn.evaluate(b => b.scrollIntoView());
    await registerBtn.click();

    // Wait for network response to be captured
    await page.waitForTimeout(2000);

    console.log('\n----- COLLECTED BROWSER LOGS -----');
    console.log(logs.map(l => JSON.stringify(l)).join('\n'));
    console.log('\n----- COLLECTED /auth/register RESPONSES -----');
    console.log(JSON.stringify(responses, null, 2));
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
