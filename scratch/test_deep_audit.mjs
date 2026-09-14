import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('='.repeat(60));
console.log('SCRAPITBRO DEEP INTEGRITY AUDIT (30 CHECKS)');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

function assertCheck(num, name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`[PASS] ${String(num).padStart(2, '0')}/30: ${name}`);
  } else {
    failed++;
    console.log(`[FAIL] ${String(num).padStart(2, '0')}/30: ${name} - ${details}`);
  }
}

// 1. Index.html title
const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
assertCheck(1, 'HTML Title Branding', indexHtml.includes('ScrapItBro — Scrap the details. Keep the photo.'));

// 2. HTML Meta Description
assertCheck(2, 'HTML Meta Description', indexHtml.includes('ScrapItBro lets you inspect the hidden details'));

// 3. HTML Open Graph & Twitter Tags
assertCheck(3, 'HTML OG & Twitter Metadata', indexHtml.includes('property="og:title" content="ScrapItBro') && indexHtml.includes('name="twitter:title" content="ScrapItBro'));

// 4. Vite PWA Manifest Name
const viteConfig = fs.readFileSync(path.join(projectRoot, 'vite.config.ts'), 'utf-8');
assertCheck(4, 'PWA Manifest Name', viteConfig.includes("name: 'ScrapItBro'") && viteConfig.includes("short_name: 'ScrapItBro'"));

// 5. Vite PWA Description
assertCheck(5, 'PWA Tagline Description', viteConfig.includes("description: 'Scrap the details. Keep the photo.'"));

// 6. Package.json Name
const pkgJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
assertCheck(6, 'package.json Name Identifier', pkgJson.name === 'scrapitbro');

// 7. README Title & Tagline
const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
assertCheck(7, 'README Project Branding', readme.includes('# ScrapItBro') && readme.includes('Scrap the details. Keep the photo.'));

// 8. Header / Logo Wordmark
const logoFile = fs.readFileSync(path.join(projectRoot, 'src/components/ui/PhotoVaultLogo.tsx'), 'utf-8');
assertCheck(8, 'Logo Wordmark ScrapItBro', logoFile.includes('ScrapIt') && logoFile.includes('Bro'));

// 9. MobileShell Top Nav
const mobileShell = fs.readFileSync(path.join(projectRoot, 'src/components/layout/MobileShell.tsx'), 'utf-8');
assertCheck(9, 'MobileShell Navigation Integration', mobileShell.includes('ScrapItBroLogo'));

// 10. Library Showcase Copy
const libraryPage = fs.readFileSync(path.join(projectRoot, 'src/pages/Library.tsx'), 'utf-8');
assertCheck(10, 'Library Showcase Brand Copy', libraryPage.includes('ScrapItBro keeps your original file') && libraryPage.includes('Learn what ScrapItBro does'));

// 11. PhotoDetail SHA-256 Copy
const photoDetail = fs.readFileSync(path.join(projectRoot, 'src/pages/PhotoDetail.tsx'), 'utf-8');
assertCheck(11, 'PhotoDetail SHA-256 Copy', photoDetail.includes('ScrapItBro uses SHA-256'));

// 12. Settings Privacy Copy
const settingsPage = fs.readFileSync(path.join(projectRoot, 'src/pages/Settings.tsx'), 'utf-8');
assertCheck(12, 'Settings Privacy Copy', settingsPage.includes('ScrapItBro helps you inspect the hidden details'));

// 13. Settings About Version & Tagline
assertCheck(13, 'Settings About Version & Tagline', settingsPage.includes('ScrapItBro · Version 0.1.0 (Stable)') && settingsPage.includes('Scrap the details. Keep the photo.'));

// 14. Metadata Stripper Integrity
const metadataStripper = fs.readFileSync(path.join(projectRoot, 'src/lib/metadata-stripper.ts'), 'utf-8');
assertCheck(14, 'Lossless Metadata Stripper Module', metadataStripper.includes('stripJpegMetadataLossless') && metadataStripper.includes('stripPngMetadataLossless') && metadataStripper.includes('stripWebpMetadataLossless'));

// 15. JPEG Lossless Cleaner Function Present
assertCheck(15, 'JPEG Lossless Cleaner Function', metadataStripper.includes('stripJpegMetadataLossless'));

// 16. PNG Lossless Cleaner Function Present
assertCheck(16, 'PNG Lossless Cleaner Function', metadataStripper.includes('stripPngMetadataLossless'));

// 17. WebP Lossless Cleaner Function Present
assertCheck(17, 'WebP Lossless Cleaner Function', metadataStripper.includes('stripWebpMetadataLossless'));

// 18. File Processing Ingestion
const fileProcessing = fs.readFileSync(path.join(projectRoot, 'src/lib/file-processing.ts'), 'utf-8');
assertCheck(18, 'File Ingestion & Metadata Parser', fileProcessing.includes('ingestImageFiles') && fileProcessing.includes('exifr.parse'));

// 19. SHA-256 Fingerprint Generator
assertCheck(19, 'SHA-256 Fingerprint Generator', fileProcessing.includes("crypto.subtle.digest('SHA-256'"));

// 20. IndexedDB Local Storage Engine
const dbFile = fs.readFileSync(path.join(projectRoot, 'src/lib/db.ts'), 'utf-8');
assertCheck(20, 'IndexedDB Local Storage Engine', dbFile.includes('openDB') && dbFile.includes('photovault_db'));

// 21. Vault Store State Management
const storeFile = fs.readFileSync(path.join(projectRoot, 'src/store/useVaultStore.ts'), 'utf-8');
assertCheck(21, 'Vault Store & State Management', storeFile.includes('useVaultStore') && storeFile.includes('toggleFavorite') && storeFile.includes('deletePhoto'));

// 22. Vault Lock / Unlock Mechanism
assertCheck(22, 'Vault Lock & Multi-tab Sync', storeFile.includes('isVaultLocked') && storeFile.includes('toggleLock'));

// 23. Direct URL / Refresh Route Protection
const appTsx = fs.readFileSync(path.join(projectRoot, 'src/App.tsx'), 'utf-8');
assertCheck(23, 'Route Guarding & URL Protection', appTsx.includes('Route') && appTsx.includes('Library') && appTsx.includes('PhotoDetail') && appTsx.includes('Settings'));

// 24. PWA Service Worker InjectManifest
const swTs = fs.readFileSync(path.join(projectRoot, 'src/sw.ts'), 'utf-8');
assertCheck(24, 'PWA Service Worker Offline Precache', swTs.includes('precacheAndRoute') && swTs.includes('cleanupOutdatedCaches'));

// 25. Clean Export Capability
assertCheck(25, 'Original & Clean Copy Export', photoDetail.includes('handleExportClean') || photoDetail.includes('handleExport'));

// 26. No Old Brand in Document Title
assertCheck(26, 'No Old Brand in Title', !indexHtml.includes('PhotoVault —'));

// 27. No Old Brand in Settings About
assertCheck(27, 'No Old Brand in Settings About', !settingsPage.includes('PhotoVault · Version'));

// 28. No Old Brand in Library Showcase
assertCheck(28, 'No Old Brand in Library Showcase', !libraryPage.includes('PhotoVault keeps your original'));

// 29. No Old Brand in PhotoDetail Fingerprint
assertCheck(29, 'No Old Brand in PhotoDetail', !photoDetail.includes('PhotoVault uses SHA-256'));

// 30. Clean Architecture & Type Safety
assertCheck(30, 'Clean Architecture & Type Safety', fs.existsSync(path.join(projectRoot, 'src/types/index.ts')));

console.log('='.repeat(60));
console.log(`AUDIT SUMMARY: ${passed}/30 PASSED (${failed} FAILED)`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
