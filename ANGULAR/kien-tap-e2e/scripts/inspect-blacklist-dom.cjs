const { chromium } = require('@playwright/test');

const ADMIN_URL = 'https://kien-tap-code.vercel.app/admin-login';
const CUSTOMER_URL = 'https://kien-tap-code.vercel.app/home';

async function summarizePage(page, title) {
  const info = await page.evaluate(() => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };

    const labelFor = (el) => {
      const id = el.getAttribute('id');
      if (!id) return '';
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      return label?.textContent?.replace(/\s+/g, ' ').trim() || '';
    };

    const collect = (selector) => [...document.querySelectorAll(selector)]
      .filter(visible)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        role: el.getAttribute('role') || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        label: labelFor(el),
        text: el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 120) || '',
        placeholder: el.getAttribute('placeholder') || '',
        id: el.getAttribute('id') || '',
        name: el.getAttribute('name') || '',
        className: typeof el.className === 'string' ? el.className.slice(0, 120) : '',
      }));

    return {
      url: location.href,
      title: document.title,
      headings: collect('h1,h2,h3,[role="heading"]'),
      controls: collect('button,a,input,textarea,select,[role="button"],[role="tab"],[role="switch"],[role="combobox"]'),
      options: [...document.querySelectorAll('select')].map((select) => ({
        text: select.textContent?.replace(/\s+/g, ' ').trim() || '',
        options: [...select.querySelectorAll('option')].map((option) => ({
          text: option.textContent?.replace(/\s+/g, ' ').trim() || '',
          value: option.getAttribute('value') || '',
        })),
      })),
      tableRows: [...document.querySelectorAll('tbody tr')].slice(0, 3).map((row) => row.textContent?.replace(/\s+/g, ' ').trim() || ''),
      dialogs: collect('[role="dialog"],.modal-overlay,.custom-alert-overlay,.fixed,.toast'),
      bodySnippet: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 900),
    };
  });

  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(info, null, 2));
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: /Tài khoản|Email|Username|Tài khoản hoặc Email/i }).fill('admin1');
  await page.getByRole('textbox', { name: /Mật khẩu|Password/i }).fill('Admin@123');
  await page.getByRole('button', { name: /Đăng nhập|Login/i }).click();
  await page.waitForURL(/\/admin\/trang-chu/, { timeout: 30000 });

  await page.goto('https://kien-tap-code.vercel.app/admin/quan-ly-tu-khoa-cam', { waitUntil: 'networkidle' });
  await summarizePage(page, 'admin-blacklist');

  await page.getByRole('button', { name: /Thêm từ khóa mới/i }).click();
  await page.locator('.modal-overlay').waitFor({ state: 'visible', timeout: 10000 });
  await summarizePage(page, 'admin-blacklist-add-modal');

  await page.goto(CUSTOMER_URL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Đăng nhập / Đăng ký' }).click();
  await summarizePage(page, 'customer-login-modal');

  await page.goto('https://kien-tap-code.vercel.app/tra-cuu-ve', { waitUntil: 'networkidle' });
  await summarizePage(page, 'customer-ticket-lookup');

  await page.getByPlaceholder('Nhập số điện thoại đặt vé').fill('0901234567');
  await page.getByPlaceholder('Nhập mã đơn hàng').fill('DH10000007');
  await page.getByRole('button', { name: 'Tra cứu' }).click();
  await page.getByText('Thông tin đơn hàng', { exact: false }).waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
  await summarizePage(page, 'customer-ticket-result');

  const reviewButton = page.getByRole('button', { name: /Đánh giá dịch vụ/i });
  if (await reviewButton.isVisible().catch(() => false)) {
    await reviewButton.click();
    await page.locator('textarea, #reviewComment').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    await summarizePage(page, 'customer-review-modal');
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
