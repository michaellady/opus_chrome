import { Page, Locator, expect } from '@playwright/test';
import { SELECTORS } from '../utils/selectors';

export class OpusClipPage {
  constructor(private page: Page) {}

  async login() {
    console.log('Attempting to login to Opus Clip...');
    await this.page.goto('https://clip.opus.pro/');
    
    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
    
    // Check if already logged in by looking for user menu or dashboard elements
    const isLoggedIn = await this.page.locator('button[data-testid="user-menu"], .user-menu, [data-testid="dashboard"]').isVisible();
    
    if (!isLoggedIn) {
      console.log('Not logged in, attempting login...');
      
      // Look for login form elements
      const emailInput = await this.page.locator('input[type="email"], input[name="email"], #email').first();
      const passwordInput = await this.page.locator('input[type="password"], input[name="password"], #password').first();
      const loginButton = await this.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      
      if (await emailInput.isVisible()) {
        await emailInput.fill(process.env.OPUS_CLIP_EMAIL || '');
        await passwordInput.fill(process.env.OPUS_CLIP_PASSWORD || '');
        await loginButton.click();
        
        // Wait for successful login
        await this.page.waitForURL('**/dashboard**', { timeout: 30000 });
        console.log('Login successful');
      } else {
        console.log('Login form not found, assuming already logged in');
      }
    } else {
      console.log('Already logged in');
    }
  }

  async navigateToCalendar() {
    console.log('Navigating to calendar page...');
    await this.page.goto('https://clip.opus.pro/auto-post/calendar');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for calendar to load
    await this.page.waitForSelector('.calendar, [data-testid="calendar"], .fc-calendar', { timeout: 30000 });
    console.log('Calendar page loaded');
  }

  async findLatestEmptyDay(): Promise<Locator> {
    console.log('Finding latest empty day...');
    
    // Wait for calendar days to load
    await this.page.waitForSelector('.fc-day, [data-testid="calendar-day"], .calendar-day', { timeout: 30000 });
    
    // Get all calendar days
    const days = await this.page.locator('.fc-day, [data-testid="calendar-day"], .calendar-day').all();
    console.log(`Found ${days.length} calendar days`);
    
    // Find the latest day without content (no events/posts)
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i];
      
      // Check if day has any events or posts
      const hasEvents = await day.locator('.fc-event, .event, .post, .scheduled').isVisible();
      const hasContent = await day.locator('.has-content, .content').isVisible();
      
      if (!hasEvents && !hasContent) {
        console.log(`Found empty day at index ${i}`);
        return day;
      }
    }
    
    throw new Error('No empty days found in calendar');
  }

  async findUnscheduledClip(): Promise<Locator> {
    console.log('Finding unscheduled clip...');
    
    // Wait for clips to load
    await this.page.waitForSelector('.clip, [data-testid="clip"], .video-item', { timeout: 30000 });
    
    // Get all clips
    const clips = await this.page.locator('.clip, [data-testid="clip"], .video-item').all();
    console.log(`Found ${clips.length} clips`);
    
    // Find first unscheduled clip
    for (const clip of clips) {
      const isScheduled = await clip.locator('.scheduled, .posted, .has-schedule').isVisible();
      if (!isScheduled) {
        console.log('Found unscheduled clip');
        return clip;
      }
    }
    
    throw new Error('No unscheduled clips found');
  }

  async openScheduleModal() {
    console.log('Opening schedule modal...');
    
    // Click on the clip to open schedule modal
    await this.page.click('.clip, [data-testid="clip"], .video-item');
    
    // Wait for modal to appear
    await this.page.waitForSelector('div[role="dialog"], .modal, [data-testid="schedule-modal"]', { timeout: 10000 });
    console.log('Schedule modal opened');
  }

  async extractOriginalCaption(): Promise<string> {
    console.log('Extracting original caption...');
    
    // Wait for modal content to load
    await this.page.waitForTimeout(2000);
    
    // Look for Instagram section and extract caption
    // Try multiple possible selectors for the Instagram section
    const instagramSelectors = [
      'div[data-testid="instagram-section"]',
      '.instagram-section',
      '.platform-section:has(svg[viewBox="0 0 24 24"])',
      SELECTORS.platformSectionContainer + ' ' + SELECTORS.platformSection
    ];
    
    let instagramSection: Locator | null = null;
    
    for (const selector of instagramSelectors) {
      if (await this.page.locator(selector).isVisible()) {
        instagramSection = this.page.locator(selector).first();
        break;
      }
    }
    
    if (!instagramSection) {
      // Fallback: look for any draft editor
      const editors = await this.page.locator(SELECTORS.draftEditor).all();
      if (editors.length > 0) {
        instagramSection = editors[0];
      }
    }
    
    if (!instagramSection) {
      throw new Error('Could not find Instagram section or caption editor');
    }
    
    // Extract text from the editor
    const caption = await instagramSection.locator('span[data-text="true"], .public-DraftEditor-content').textContent();
    
    console.log(`Extracted caption: ${caption?.substring(0, 50)}...`);
    return caption || '';
  }

  async populateAllPlatforms(transformedContent: any) {
    console.log('Populating all platform fields...');
    
    // Find all platform sections
    const platformSections = await this.page.locator(SELECTORS.platformSectionContainer + ' ' + SELECTORS.platformSection).all();
    console.log(`Found ${platformSections.length} platform sections`);
    
    for (const section of platformSections) {
      const platform = await this.identifyPlatform(section);
      await this.populatePlatform(section, platform, transformedContent);
    }
  }

  private async identifyPlatform(section: Locator): Promise<string> {
    // Check for platform-specific SVG elements
    const svg = section.locator('svg').first();
    const viewBox = await svg.getAttribute('viewBox');
    
    if (viewBox === '0 0 18 18') return 'twitter';
    
    // Check for platform-specific elements
    if (await section.locator('path[fill="#0866FF"]').isVisible()) return 'facebook';
    if (await section.locator('rect[fill="#FF0000"]').isVisible()) return 'youtube';
    if (await section.locator('rect[fill^="url(#pattern"]').isVisible()) return 'instagram';
    if (await section.locator('path[fill="#FF004F"]').isVisible()) return 'tiktok';
    
    return 'unknown';
  }

  private async populatePlatform(section: Locator, platform: string, content: any) {
    console.log(`Populating ${platform} platform...`);
    
    const editor = section.locator(SELECTORS.draftEditor);
    
    switch (platform) {
      case 'facebook':
        const fbTitleInput = section.locator(SELECTORS.facebookTitleInput);
        if (await fbTitleInput.isVisible()) {
          await fbTitleInput.fill(content.transformed);
        }
        await this.setDraftEditorValue(editor, `${content.transformed}\n\n${content.boilerplate}`);
        break;
      case 'youtube':
        const ytTitleInput = section.locator(SELECTORS.youtubeTitleInput);
        if (await ytTitleInput.isVisible()) {
          await ytTitleInput.fill(content.transformed);
        }
        await this.setDraftEditorValue(editor, `${content.transformed}\n\n${content.boilerplate}`);
        break;
      case 'instagram':
        await this.setDraftEditorValue(editor, `${content.transformed}\n\n${content.boilerplate}`);
        break;
      case 'tiktok':
        await this.setDraftEditorValue(editor, `${content.transformed}\n\n${content.boilerplate}`);
        break;
      case 'twitter':
        await this.setDraftEditorValue(editor, content.transformed);
        break;
      default:
        console.log(`Unknown platform: ${platform}`);
    }
  }

  private async setDraftEditorValue(editor: Locator, text: string) {
    // Click on the editor to focus it
    await editor.click();
    
    // Clear existing content
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Delete');
    
    // Type new content
    await editor.type(text);
    
    // Trigger input event
    await editor.dispatchEvent('input');
  }

  async verifyContentPopulation(content: any) {
    console.log('Verifying content population...');
    
    // Verify Facebook title if present
    const fbTitleInput = this.page.locator(SELECTORS.facebookTitleInput);
    if (await fbTitleInput.isVisible()) {
      const fbTitle = await fbTitleInput.inputValue();
      expect(fbTitle).toContain('BJJ');
      expect(fbTitle.length).toBeLessThan(100);
      console.log('Facebook title verified');
    }
    
    // Verify Instagram caption
    const editors = await this.page.locator(SELECTORS.draftEditor).all();
    if (editors.length > 0) {
      const igCaption = await editors[0].textContent();
      expect(igCaption).toContain('BJJ');
      expect(igCaption).toContain('@mikelady');
      console.log('Instagram caption verified');
    }
  }

  async saveSchedule() {
    console.log('Saving schedule...');
    
    // Look for save/schedule button
    const saveButton = this.page.locator('button:has-text("Save"), button:has-text("Schedule"), button:has-text("Post"), [data-testid="save-button"]');
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Wait for success message or redirect
      await this.page.waitForTimeout(3000);
      console.log('Schedule saved successfully');
    } else {
      console.log('Save button not found, assuming auto-save');
    }
  }

  async hasUnscheduledClips(): Promise<boolean> {
    const clips = await this.page.locator('.clip, [data-testid="clip"], .video-item').all();
    
    for (const clip of clips) {
      const isScheduled = await clip.locator('.scheduled, .posted, .has-schedule').isVisible();
      if (!isScheduled) {
        return true;
      }
    }
    
    return false;
  }
} 