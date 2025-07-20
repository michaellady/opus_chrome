import { test, expect } from '@playwright/test';

test.describe('Page Analysis', () => {
  test('should analyze the current page structure', async ({ page }) => {
    console.log('=== Starting Page Analysis ===');
    
    // Navigate to calendar page
    await page.goto('https://clip.opus.pro/auto-post/calendar');
    await page.waitForLoadState('networkidle');
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'page-analysis.png', fullPage: true });
    
    // Check if we're on the right page
    if (page.url().includes('calendar')) {
      console.log('✓ Successfully navigated to calendar page');
    } else {
      console.log('⚠ Not on calendar page, current URL:', page.url());
    }
    
    // Look for common elements
    const elements = {
      signupButtons: await page.locator('button:has-text("Continue with")').count(),
      loginButtons: await page.locator('button:has-text("Login"), button:has-text("Sign In")').count(),
      calendarElements: await page.locator('[class*="calendar"], [class*="cal"]').count(),
      navigationElements: await page.locator('nav, [role="navigation"]').count(),
    };
    
    console.log('Page elements found:', elements);
    
    // Check if we need to complete signup
    if (elements.signupButtons > 0) {
      console.log('⚠ Found signup buttons - may need to complete account setup');
      
      // Try to find what the signup process looks like
      const signupText = await page.locator('body').textContent();
      console.log('Page contains signup text:', signupText?.includes('sign up') || signupText?.includes('Sign up'));
    }
    
    // Look for any calendar-related content
    const bodyText = await page.locator('body').textContent();
    const hasCalendarText = bodyText?.toLowerCase().includes('calendar') || false;
    const hasScheduleText = bodyText?.toLowerCase().includes('schedule') || false;
    const hasAutoPostText = bodyText?.toLowerCase().includes('auto') || false;
    
    console.log('Page content analysis:');
    console.log('  - Contains "calendar":', hasCalendarText);
    console.log('  - Contains "schedule":', hasScheduleText);
    console.log('  - Contains "auto":', hasAutoPostText);
    
    // Try to find any interactive elements
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`  Button ${i + 1}: "${text}" (visible: ${isVisible})`);
    }
    
    console.log('=== Page Analysis Completed ===');
  });
}); 