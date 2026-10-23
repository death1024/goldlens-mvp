const { chromium } = require('playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true});
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5188/?v=pwa-test',{waitUntil:'networkidle'});
 await page.waitForTimeout(1500);
 const result=await page.evaluate(async()=>({
   manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
   swSupported: 'serviceWorker' in navigator,
   regs: (await navigator.serviceWorker.getRegistrations()).length,
   controller: Boolean(navigator.serviceWorker.controller),
   display: getComputedStyle(document.querySelector('#installBtn')).display
 }));
 console.log(result);
 await browser.close();
})();
