import { test, expect } from '@playwright/test';

test.describe('Deep Opus Clip Exploration', () => {
  test('should deeply explore the calendar page structure', async ({ page }) => {
    console.log('=== Starting Deep Calendar Page Exploration ===');
    
    // Navigate to calendar page
    await page.goto('https://clip.opus.pro/auto-post/calendar');
    await page.waitForLoadState('networkidle');
    
    console.log('Calendar page loaded, exploring structure...');
    
    // Take a full page screenshot
    await page.screenshot({ path: 'deep-exploration-full.png', fullPage: true });
    
    // Get page HTML structure for analysis
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    
    // Look for all possible calendar-related elements
    const allElements = await page.locator('*').all();
    console.log(`Total elements on page: ${allElements.length}`);
    
    // Look for specific patterns
    const patterns = [
      'calendar', 'cal', 'day', 'date', 'event', 'post', 'schedule',
      'clip', 'video', 'content', 'media', 'item', 'card'
    ];
    
    for (const pattern of patterns) {
      const elements = await page.locator(`[class*="${pattern}"], [id*="${pattern}"], [data-testid*="${pattern}"]`).all();
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with pattern "${pattern}"`);
        
        // Get some details about the first few elements
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const element = elements[i];
          const tagName = await element.evaluate(el => el.tagName);
          const className = await element.evaluate(el => el.className);
          const id = await element.evaluate(el => el.id);
          const textContent = await element.textContent();
          
          console.log(`  ${i + 1}. ${tagName} (class: "${className}", id: "${id}")`);
          console.log(`     Text: "${textContent?.substring(0, 100)}..."`);
        }
      }
    }
    
    // Look for clickable elements
    const clickableElements = await page.locator('button, a, [role="button"], [tabindex]').all();
    console.log(`Found ${clickableElements.length} clickable elements`);
    
    // Look for grid or list containers
    const containers = await page.locator('div[class*="grid"], div[class*="list"], div[class*="container"], div[class*="wrapper"]').all();
    console.log(`Found ${containers.length} potential container elements`);
    
    // Look for any elements with dates or numbers
    const dateElements = await page.locator('*:has-text("1"), *:has-text("2"), *:has-text("3"), *:has-text("4"), *:has-text("5")').all();
    console.log(`Found ${dateElements.length} elements with numbers (potential dates)`);
    
    // Try to find any interactive elements
    const interactiveElements = await page.locator('[onclick], [data-action], [data-click], button, a').all();
    console.log(`Found ${interactiveElements.length} interactive elements`);
    
    // Look for any elements that might be clips or videos
    const mediaElements = await page.locator('video, img, [class*="video"], [class*="clip"], [class*="media"]').all();
    console.log(`Found ${mediaElements.length} media-related elements`);
    
    // Try clicking on some potential elements to see what happens
    console.log('\n=== Testing Element Interactions ===');
    
    // Try clicking on the first few clickable elements
    for (let i = 0; i < Math.min(clickableElements.length, 5); i++) {
      try {
        const element = clickableElements[i];
        const tagName = await element.evaluate(el => el.tagName);
        const text = await element.textContent();
        
        console.log(`Clicking element ${i + 1}: ${tagName} with text "${text?.substring(0, 30)}..."`);
        
        await element.click();
        await page.waitForTimeout(1000);
        
        // Check if anything changed
        const currentUrl = page.url();
        console.log(`  URL after click: ${currentUrl}`);
        
        // Look for modals or new content
        const modals = await page.locator('div[role="dialog"], .modal, [data-testid*="modal"]').count();
        if (modals > 0) {
          console.log(`  ✓ Modal appeared! Found ${modals} modals`);
          await page.screenshot({ path: `deep-exploration-modal-${i}.png` });
        }
        
        // Go back to calendar if we navigated away
        if (!currentUrl.includes('calendar')) {
          await page.goto('https://clip.opus.pro/auto-post/calendar');
          await page.waitForLoadState('networkidle');
        }
        
      } catch (error) {
        console.log(`  Error clicking element ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log('\n=== Deep Exploration Completed ===');
    console.log('Check screenshots for visual analysis');
  });
}); 