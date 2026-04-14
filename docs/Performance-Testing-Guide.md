# Performance Testing Guide

This guide will help you measure and improve the loading speed of your multi-author blog.

## 📊 Key Performance Metrics

### What to Measure

| Metric | Name | Target | Impact |
|--------|------|--------|--------|
| FCP | First Contentful Paint | < 1.0s | User sees first content quickly |
| LCP | Largest Contentful Paint | < 2.5s | Time until main content loads |
| TTI | Time to Interactive | < 3.8s | When page becomes fully interactive |
| TBT | Total Blocking Time | < 200ms | Total blocked time before TTI |
| CLS | Cumulative Layout Shift | < 0.1 | Visual stability (no jumpy layouts) |

## 🧪 Performance Testing Tools

### 1. **Google PageSpeed Insights** (Recommended)
**URL:** https://pagespeed.web.dev

**Best for:** 
- Comprehensive audit
- Mobile and desktop scores
- Actionable recommendations
- Core Web Vitals analysis

**How to use:**
1. Enter your site URL
2. Select "Mobile" or "Desktop"
3. Wait for analysis (30-60 seconds)
4. Review the "Opportunities" section

**Example output:**
```
Performance: 85/100

Opportunities:
• Serve images in next-gen formats
• Eliminate render-blocking resources
• Reduce unused JavaScript
• Properly size images
```

### 2. **Chrome DevTools Lighthouse**

**Best for:**
- Local testing
- Detailed breakdown of metrics
- Before/after comparison

**How to use:**
1. Open your site in Chrome
2. Press `F12` to open DevTools
3. Click "Lighthouse" tab
4. Select metrics to audit
5. Click "Analyze page load"

**Common Lighthouse audits:**
- `performance` - Overall performance score
- `best-practices` - Modern web standards
- `accessibility` - Screen reader support
- `seo` - Search engine optimization

### 3. **WebPageTest.org**

**Best for:**
- Detailed waterfall analysis
- Real-world testing from different locations
- Video capture of page load
- Comparison testing

**How to use:**
1. Go to https://www.webpagetest.org
2. Enter your URL
3. Select test configuration:
   - Connection: 3G or 4G for mobile
   - Location: Choose closest to your users
   - Browser: Chrome Mobile
4. Run test
5. Review the "Waterfall" tab

### 4. **Chrome Performance Panel**

**Best for:**
- Finding JavaScript bottlenecks
- Identifying main thread blockers
- Profiling specific interactions

**How to use:**
1. Open DevTools (`F12`)
2. Go to "Performance" tab
3. Click the record button (⏺️)
4. Refresh the page or perform action
5. Stop recording
6. Analyze the flame chart

## 📋 Step-by-Step Testing Process

### Before Optimizing (Baseline)

1. **Test your current site:**
```bash
# Test 1: Lighthouse
- Open Chrome DevTools
- Lighthouse tab
- Run audit

# Test 2: PageSpeed Insights
- Visit pagespeed.web.dev
- Enter your URL
- Note the scores

# Test 3: WebPageTest
- Visit webpagetest.org
- Run test
- Watch for any red highlights
```

2. **Record baseline metrics:**
```markdown
Date: [Current date]
LCP: [Value]
FCP: [Value]
TTI: [Value]
TBT: [Value]
CLS: [Value]
Performance Score: [Value]
```

### Testing After Optimizations

Run the same tests after implementing each optimization:

1. **After image optimization:**
   ```bash
   npm run test -- optimize-images
   ```

2. **After CSS optimization:**
   ```bash
   npm run test -- inline-critical-css
   ```

3. **After JS optimization:**
   ```bash
   npm run test -- defer-scripts
   ```

## 🔧 Running Automated Tests

### Local Development Testing

**Build and test locally:**
```bash
cd ~/Documents/Github/multi_author_blog_template

# Run the build
npm run build

# Run with image optimization
npm run build -- --optimize-images

# Start local server
npm run dev

# Open http://localhost:4173
```

### Automated Lighthouse CI

Install Lighthouse for automated testing:

```bash
npm install -g lighthouse
```

**Basic test command:**
```bash
lighthouse --preset=performance http://localhost:4173/ --output=html --output-path=lighthouse-report.html
```

**Run on mobile simulation:**
```bash
lighthouse --preset=performance \
  --emulated-form-factor=mobile \
  --throttling=CPU:4x,RTT:400ms \
  http://localhost:4173/ \
  --output=html \
  --output-path=lighthouse-mobile.html
```

## 📈 Performance Improvement Checklist

### High Impact (Implement First)

- [ ] **Optimize images to WebP format**
  - Run: `npm run build -- --optimize-images`
  - Expected improvement: 30-50% size reduction

- [ ] **Inline critical CSS**
  - Move top 300 lines of style.css to `<head>`
  - Load remaining CSS with `media="print" onload="this.media='all'"`
  - Expected improvement: 2-3s faster FCP

- [ ] **Preload critical fonts**
  - Add `<link rel="preload" href="/fonts/...">` to head
  - Add `font-display: swap` to all `@font-face` declarations
  - Expected improvement: 20-30% faster font loading

- [ ] **Defer non-critical JavaScript**
  - Move large script blocks to end of `<body>`
  - Add `defer` attribute
  - Expected improvement: 30-40% faster TTI

### Medium Impact

- [ ] **Lazy load third-party scripts**
  - Don't load Giscus/Katex/Mermaid on homepage
  - Only load when viewing posts that need them
  - Expected improvement: 15-25% faster LCP

- [ ] **Use HTTP/2 or HTTP/3**
  - Cloudflare Pages supports HTTP/2 automatically
  - Enable HTTP/3 in Cloudflare dashboard

- [ ] **Add proper caching headers**
  - Update `_headers` file
  - Expected improvement: 90% faster repeat visits

### Low Impact

- [ ] **Remove unused CSS**
  - Analyze with Lighthouse
  - Remove styles not used on any page

- [ ] **Reduce font families**
  - Current: 4 font families
  - Consider reducing to 2-3

## 🎯 Before/After Comparison Template

Create a file called `performance-before-after.md`:

```markdown
# Performance Before/After Comparison

## Baseline (Before Optimizations)

| Metric | Value | Status |
|--------|-------|--------|
| FCP | 1.8s | ⚠️ Below target |
| LCP | 2.9s | ⚠️ Below target |
| TTI | 4.2s | ⚠️ Below target |
| TBT | 150ms | ✅ Good |
| CLS | 0.03 | ✅ Good |
| Score | 72 | ⚠️ Needs improvement |

## After Optimizations

### 1. Image Optimization
- Converted all PNGs to WebP
- Savings: 45KB (62% reduction)
- Impact: +5 points on performance

### 2. Critical CSS Inlining
- Inlined 300 lines of CSS
- FCP improved from 1.8s → 0.9s
- LCP improved from 2.9s → 2.1s

### 3. Font Preloading
- Preloaded Newsreader and Ancizar Serif
- Font loading time: 600ms → 400ms
- Improved font display time

## Final Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| FCP | 1.8s | 0.9s | +50% |
| LCP | 2.9s | 2.1s | +28% |
| TTI | 4.2s | 3.1s | +26% |
| TBT | 150ms | 120ms | +20% |
| CLS | 0.03 | 0.03 | Same |
| Score | 72 | 87 | +15 points |
```

## 📊 Automated Performance Testing Script

Create this file: `scripts/test-performance.mjs`

```javascript
#!/usr/bin/env node
/**
 * Automated performance testing script
 * Usage: node scripts/test-performance.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_URL = 'http://localhost:4173';

async function runTests() {
  console.log('🚀 Starting performance tests...\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('📡 Testing connectivity...');
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${TEST_URL}`, { stdio: 'inherit' });
    console.log('✅ Site is accessible\n');
    
    // Test 2: Lighthouse audit
    console.log('🔍 Running Lighthouse audit...');
    const lighthouseReport = execSync(
      `lighthouse ${TEST_URL} --preset=performance --quiet --output=json --port=9222`,
      { encoding: 'utf8' }
    );
    
    const report = JSON.parse(lighthouseReport);
    const audit = report.lhr.audit;
    
    console.log('📊 Performance Metrics:');
    console.log(`   LCP: ${audit['largest-contentful-paint'].displayValue}`);
    console.log(`   FCP: ${audit['first-contentful-paint'].displayValue}`);
    console.log(`   TBT: ${audit['total-blocking-time'].displayValue}`);
    console.log(`   CLS: ${audit['cumulative-layout-shift'].displayValue}`);
    console.log(`   Score: ${report.lhr.categories.performance.score * 100}\n`);
    
    console.log('✅ Tests completed successfully');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
  }
}

runTests();
```

## 🎨 Real-Time Monitoring

### Add Performance Observer to Your Site

Add this script to your `layout.html`:

```javascript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

// Observe navigation events
observer.observe({ entryTypes: ['navigation'] });
```

### View Performance Data in DevTools

1. Open DevTools (`F12`)
2. Go to "Network" tab
3. Check "Disable cache"
4. Select "All" or "Doc" filter
5. Refresh the page
6. Look at the Timeline and Waterfall

## 📱 Mobile vs Desktop Testing

**Important:** Always test on both mobile and desktop!

**Mobile testing tips:**
- Use Chrome DevTools Emulation
- Simulate 3G network conditions
- Test touch interactions
- Consider smaller screen sizes (320px, 375px, 414px)

**Desktop testing tips:**
- Test on different screen sizes
- Check for hover interactions
- Test with mouse and keyboard

## 🔄 Continuous Performance Testing

### Integrate with GitHub Actions

Create `.github/workflows/performance.yml`:

```yaml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build site
        run: npm run build
      
      - name: Run performance test
        run: npx lighthouse http://localhost:port --preset=performance --output=html
```

## 🐛 Common Performance Issues & Fixes

### Issue 1: Large Images
**Symptom:** LCP > 3s, images taking long to load
**Fix:** 
```bash
npm run build -- --optimize-images
```

### Issue 2: Render-Blocking CSS
**Symptom:** FCP > 2s, style.css blocking paint
**Fix:** Inline critical CSS as described earlier

### Issue 3: Font Loading Delays
**Symptom:** Text invisible before loading, layout shifts
**Fix:** Add `font-display: swap` and preload fonts

### Issue 4: Long Main Thread
**Symptom:** TBT > 300ms, TTI > 5s
**Fix:** 
- Split large scripts
- Remove unused JavaScript
- Defer non-critical code

## 🎯 Success Criteria

Your blog is considered "performance healthy" when:

- ✅ Lighthouse Performance Score ≥ 90
- ✅ FCP < 1.0s
- ✅ LCP < 2.5s  
- ✅ TTI < 3.8s
- ✅ TBT < 200ms
- ✅ CLS < 0.1

## 📦 Quick Reference Commands

```bash
# Build with image optimization
npm run build -- --optimize-images

# Run Lighthouse audit
npx lighthouse http://localhost:4173 --output=html --output-path=report.html

# Check package size
du -sh dist/

# Find largest files
find dist/ -type f -exec du -h {} + | sort -hr | head -10
```

## 📞 Getting Help

If you're still experiencing performance issues:

1. **Check Lighthouse recommendations** - They provide specific fixes
2. **Review WebPageTest waterfall** - Identify resource bottlenecks
3. **Use Chrome Performance panel** - Find JavaScript issues
4. **Read Web.dev articles** - https://web.dev/performance/

---

**Next Steps:**
1. Run Lighthouse on your current site
2. Record baseline metrics
3. Implement image optimization
4. Test again and compare results
5. Continue with CSS/JS optimizations

Remember: Performance is a marathon, not a sprint! Small improvements add up over time.