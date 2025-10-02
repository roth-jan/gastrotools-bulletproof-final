const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Test LOCAL version
  const localPage = await browser.newPage();
  console.log('\n🔍 VERGLEICHE LOCALHOST vs VERCEL...\n');
  console.log('=' .repeat(60));

  console.log('\n📍 LOCALHOST (http://localhost:3000):');
  console.log('-' .repeat(40));

  await localPage.goto('http://localhost:3000');
  await localPage.waitForTimeout(2000);

  // Get title and main heading from local
  const localTitle = await localPage.title();
  const localHeading = await localPage.textContent('h1');
  const localButtons = await localPage.$$eval('button', buttons => buttons.map(b => b.textContent?.trim()).filter(Boolean));
  const localCards = await localPage.$$eval('.card, [class*="card"]', cards => cards.length);

  console.log('Title:', localTitle);
  console.log('Main Heading:', localHeading);
  console.log('Anzahl Buttons:', localButtons.length);
  console.log('Button-Texte:', localButtons.slice(0, 5).join(', '));
  console.log('Anzahl Cards/Tools:', localCards);

  // Check for specific tools
  const localTools = [];
  if (await localPage.$('text=Nährwert')) localTools.push('Nährwert-Rechner');
  if (await localPage.$('text=Kostenkontrolle')) localTools.push('Kostenkontrolle');
  if (await localPage.$('text=Lagerbestand')) localTools.push('Lagerbestand');
  if (await localPage.$('text=Menüplaner')) localTools.push('Menüplaner');
  if (await localPage.$('text=Designer')) localTools.push('Menükarten-Designer');

  console.log('Gefundene Tools:', localTools.join(', '));

  await localPage.screenshot({ path: 'localhost-screenshot.png' });

  // Test VERCEL version
  const vercelPage = await browser.newPage();

  console.log('\n📍 VERCEL (https://gastrotools-bulletproof-final.vercel.app):');
  console.log('-' .repeat(40));

  await vercelPage.goto('https://gastrotools-bulletproof-final.vercel.app/');
  await vercelPage.waitForTimeout(3000);

  // Get title and main heading from Vercel
  const vercelTitle = await vercelPage.title();
  const vercelHeading = await vercelPage.textContent('h1');
  const vercelButtons = await vercelPage.$$eval('button', buttons => buttons.map(b => b.textContent?.trim()).filter(Boolean));
  const vercelCards = await vercelPage.$$eval('.card, [class*="card"]', cards => cards.length);

  console.log('Title:', vercelTitle);
  console.log('Main Heading:', vercelHeading);
  console.log('Anzahl Buttons:', vercelButtons.length);
  console.log('Button-Texte:', vercelButtons.slice(0, 5).join(', '));
  console.log('Anzahl Cards/Tools:', vercelCards);

  // Check for specific tools on Vercel
  const vercelTools = [];
  if (await vercelPage.$('text=Nährwert')) vercelTools.push('Nährwert-Rechner');
  if (await vercelPage.$('text=Kostenkontrolle')) vercelTools.push('Kostenkontrolle');
  if (await vercelPage.$('text=Lagerbestand')) vercelTools.push('Lagerbestand');
  if (await vercelPage.$('text=Menüplaner')) vercelTools.push('Menüplaner');
  if (await vercelPage.$('text=Designer')) vercelTools.push('Menükarten-Designer');

  console.log('Gefundene Tools:', vercelTools.join(', '));

  await vercelPage.screenshot({ path: 'vercel-screenshot.png' });

  // COMPARE
  console.log('\n' + '=' .repeat(60));
  console.log('🔍 VERGLEICHSERGEBNIS:');
  console.log('=' .repeat(60));

  console.log('\n📊 UNTERSCHIEDE:');

  if (localTitle !== vercelTitle) {
    console.log(`❌ Title unterschiedlich:`);
    console.log(`   Local:  "${localTitle}"`);
    console.log(`   Vercel: "${vercelTitle}"`);
  } else {
    console.log(`✅ Title identisch: "${localTitle}"`);
  }

  if (localHeading !== vercelHeading) {
    console.log(`❌ Heading unterschiedlich:`);
    console.log(`   Local:  "${localHeading}"`);
    console.log(`   Vercel: "${vercelHeading}"`);
  } else {
    console.log(`✅ Heading identisch: "${localHeading}"`);
  }

  if (localCards !== vercelCards) {
    console.log(`❌ Anzahl Cards unterschiedlich:`);
    console.log(`   Local:  ${localCards}`);
    console.log(`   Vercel: ${vercelCards}`);
  } else {
    console.log(`✅ Anzahl Cards identisch: ${localCards}`);
  }

  if (localTools.length !== vercelTools.length) {
    console.log(`❌ Tools unterschiedlich:`);
    console.log(`   Local (${localTools.length}):  ${localTools.join(', ')}`);
    console.log(`   Vercel (${vercelTools.length}): ${vercelTools.join(', ')}`);
  } else {
    console.log(`✅ Tools identisch: ${localTools.join(', ')}`);
  }

  // Check actual content
  console.log('\n📄 CONTENT CHECK:');

  // Check for specific elements that should be on both
  const elementsToCheck = [
    'GastroTools',
    'Demo',
    'Monitoring',
    'Restaurant'
  ];

  for (const element of elementsToCheck) {
    const localHas = await localPage.$(`text=${element}`) !== null;
    const vercelHas = await vercelPage.$(`text=${element}`) !== null;

    if (localHas === vercelHas) {
      console.log(`✅ "${element}": Beide ${localHas ? 'haben' : 'haben nicht'}`);
    } else {
      console.log(`❌ "${element}": Local ${localHas ? 'hat' : 'hat nicht'}, Vercel ${vercelHas ? 'hat' : 'hat nicht'}`);
    }
  }

  console.log('\n📸 Screenshots gespeichert:');
  console.log('   - localhost-screenshot.png');
  console.log('   - vercel-screenshot.png');

  await browser.close();
})();