const puppeteer = require('puppeteer');

const appUrlBase = 'http://localhost:8080';

const routes = {
  public: {
    login: `${appUrlBase}/login`,
  },
  private: {
    job: `${appUrlBase}/job`,
  },
  admin: {
    templates: `${appUrlBase}/templates`,
  },
};

const user = {
  username: 'admin',
  password: 'thejenkins',
};

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch(process.env.DEBUG
    ? {
      headless: false,
      slowMo: 100,
    }
    : {});
  page = await browser.newPage();
});

afterAll(() => {
  if (!process.env.DEBUG) {
    browser.close();
  }
});

describe('login', () => {
  test('can login', async () => {
    await page.goto(routes.public.login);
    await page.type('[id="j_username"]', user.username);
    await page.type('[name="j_password"]', user.password);
    await page.click('[id="yui-gen1-button"]');
    await page.waitForSelector('[id="projectstatus"]');
  }, 10000);
});
