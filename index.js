const puppeteer = require("puppeteer");

const url = "https://console.aws.amazon.com/iamv2/home#/security_credentials";

const emailid_credential = "replace_with_emailid";
const password_credentails = "replace_with_password";

/**
 * Helper functions
 */

async function startBrowser() {
  let browser;
  try {
    browser = await puppeteer.launch();
  } catch (err) {
    console.log("error while launching the browser", err);
  }
}

async function getAccessandSecretKeys() {
  const browserInstance = await startBrowser({
    headless: true,
    args: ["--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true,
  });
  const page = await browserInstance.newPage();

  try {
    await page.goto(url);

    /**
     * If user is not logged in, then will be navigated to login page
     */
    await page.waitForSelector("#iamUsername");
    await page.type("#iamUsername", emailid_credential);
    await page.type("#iamPassword", password_credentails);
    await page.click("#signinButton");

    /**
     * After login > navigate to the security credential page
     * and then generate the keys
     */
    await page.goto(url);
    await page.waitForSelector("#createAccessKey");
    await page.click("#createAccessKey");
    await page.waitForSelector("#accessKeysModal");
    await page.click("#accessKeysModal .checkbox");
    await page.click('#accessKeysModal button[type="submit"]');
    await page.waitForSelector("#copyAccessKey");

    const accessKey = await page.$eval("#copyAccessKey", (el) => el.value);
    const secretAccessKey = await page.$eval(
      "#copySecretAccessKey",
      (el) => el.value
    );

    return {
      accessKey,
      secretAccessKey,
    };
  } catch (err) {
    console.log("error generating access key", err);
  } finally {
    await browser.close();
  }
}

const keys = getAccessandSecretKeys();
console.log("Access key", keys.accessKey);
console.log("Secret access key", keys.secretAccessKey);
