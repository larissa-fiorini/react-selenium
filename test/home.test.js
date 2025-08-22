const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const REMOTE = process.env.SELENIUM_REMOTE_URL || 'http://localhost:4444/wd/hub';
const HEADLESS = (process.env.HEADLESS || 'true').toLowerCase() === 'true';

describe('Home page', function () {
  /** @type {import('selenium-webdriver').WebDriver} */
  let driver;

  before(async function () {
    const options = new chrome.Options();
    if (HEADLESS) {
      // Works on CI
      options.addArguments('--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage');
    }
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .usingServer(REMOTE)
      .build();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      const outDir = path.join(process.cwd(), 'selenium-artifacts');
      fs.mkdirSync(outDir, { recursive: true });
      const png = await driver.takeScreenshot();
      fs.writeFileSync(path.join(outDir, `${Date.now()}-failed.png`), png, 'base64');
    }
  });

  it('shows the headline', async function () {
    await driver.get(BASE_URL);
    const h1 = await driver.wait(until.elementLocated(By.css('h1')), 15000);
    const text = await h1.getText();
    expect(text).to.equal('Hello, Selenium!');
  });
});
