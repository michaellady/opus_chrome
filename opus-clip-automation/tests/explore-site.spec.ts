import { test, expect } from '@playwright/test';

test.describe('Opus Clip Site Exploration', () => {
  test('should explore the site structure', async ({ page }) => {
    console.log('Starting site exploration...');
    
    // Navigate to the main site
    await page.goto('https://clip.opus.pro/');
    await page.waitForLoadState('networkidle');
    
    console.log('Page loaded, exploring structure...');
    
    // Take a screenshot for analysis
    await page.screenshot({ path: 'site-exploration.png', fullPage: true });
    
    // Look for common elements
    const elements = {
      loginForm: await page.locator('input[type="email"], input[name="email"], #email').count(),
      passwordField: await page.locator('input[type="password"], input[name="password"], #password').count(),
      loginButton: await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').count(),
      userMenu: await page.locator('button[data-testid="user-menu"], .user-menu, [data-testid="dashboard"]').count(),
      navigation: await page.locator('nav, .navigation, [role="navigation"]').count(),
    };
    
    console.log('Found elements:', elements);
    
    // Check if we're already logged in
    const isLoggedIn = elements.userMenu > 0;
    console.log('Appears to be logged in:', isLoggedIn);
    
    if (isLoggedIn) {
      console.log('Already logged in, exploring dashboard...');
      
      // Try to navigate to calendar
      await page.goto('https://clip.opus.pro/auto-post/calendar');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of calendar page
      await page.screenshot({ path: 'calendar-exploration.png', fullPage: true });
      
      // Look for calendar elements
      const calendarElements = {
        calendar: await page.locator('.calendar, [data-testid="calendar"], .fc-calendar').count(),
        calendarDays: await page.locator('.fc-day, [data-testid="calendar-day"], .calendar-day').count(),
        clips: await page.locator('.clip, [data-testid="clip"], .video-item').count(),
      };
      
      console.log('Calendar elements found:', calendarElements);
      
      // If we found clips, try to click on one
      if (calendarElements.clips > 0) {
        console.log('Found clips, attempting to click on first one...');
        
        const firstClip = page.locator('.clip, [data-testid="clip"], .video-item').first();
        await firstClip.click();
        
        // Wait for modal or new page
        await page.waitForTimeout(3000);
        
        // Take screenshot after clicking clip
        await page.screenshot({ path: 'clip-click-exploration.png', fullPage: true });
        
        // Look for modal elements
        const modalElements = {
          modal: await page.locator('div[role="dialog"], .modal, [data-testid="schedule-modal"]').count(),
          editors: await page.locator('div.public-DraftEditor-content[contenteditable="true"]').count(),
          platformSections: await page.locator('div.flex.gap-4').count(),
        };
        
        console.log('Modal elements found:', modalElements);
      }
    } else {
      console.log('Not logged in, showing login form structure...');
      
      // Look for login form elements
      const loginElements = {
        emailInput: await page.locator('input[type="email"], input[name="email"], #email').count(),
        passwordInput: await page.locator('input[type="password"], input[name="password"], #password').count(),
        submitButton: await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').count(),
      };
      
      console.log('Login form elements:', loginElements);
    }
    
    console.log('Site exploration completed. Check screenshots for visual analysis.');
  });
}); 