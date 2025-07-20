import { test, expect } from '@playwright/test';
import { OpusClipPage } from '../src/pages/OpusClipPage';
import { OpenAIService } from '../src/services/OpenAIService';

test.describe('Opus Clip Content Automation', () => {
  let opusPage: OpusClipPage;
  let openAIService: OpenAIService;

  test.beforeEach(async ({ page }) => {
    opusPage = new OpusClipPage(page);
    openAIService = new OpenAIService();
  });

  test('should automate complete content scheduling workflow', async ({ page }) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`\n=== Starting automation attempt ${attempt + 1}/${maxRetries} ===`);
        
        // Step 1: Login to Opus Clip
        await opusPage.login();
        
        // Step 2: Navigate to calendar
        await opusPage.navigateToCalendar();
        
        // Step 3: Check if there are unscheduled clips
        const hasUnscheduledClips = await opusPage.hasUnscheduledClips();
        if (!hasUnscheduledClips) {
          console.log('No unscheduled clips found. Skipping automation.');
          return;
        }
        
        // Step 4: Find latest empty day
        const emptyDay = await opusPage.findLatestEmptyDay();
        await emptyDay.click();
        
        // Step 5: Find unscheduled clip
        const unscheduledClip = await opusPage.findUnscheduledClip();
        await unscheduledClip.click();
        
        // Step 6: Open schedule modal
        await opusPage.openScheduleModal();
        
        // Step 7: Extract original caption
        const originalCaption = await opusPage.extractOriginalCaption();
        
        if (!originalCaption || originalCaption.trim().length === 0) {
          throw new Error('No caption found to transform');
        }
        
        // Step 8: Transform caption with OpenAI
        const transformedContent = await openAIService.transformCaption(originalCaption);
        
        // Step 9: Populate all platform fields
        await opusPage.populateAllPlatforms(transformedContent);
        
        // Step 10: Verify content is populated correctly
        await opusPage.verifyContentPopulation(transformedContent);
        
        // Step 11: Save/schedule the post
        await opusPage.saveSchedule();
        
        console.log('=== Automation completed successfully! ===');
        break; // Success, exit retry loop
        
      } catch (error) {
        attempt++;
        console.error(`\n=== Attempt ${attempt} failed ===`);
        console.error('Error:', error);
        
        if (attempt === maxRetries) {
          console.error('All retry attempts failed. Test failed.');
          throw error;
        }
        
        console.log(`Waiting 5 seconds before retry ${attempt + 1}...`);
        await page.waitForTimeout(5000);
      }
    }
  });

  test('should handle no unscheduled clips gracefully', async ({ page }) => {
    console.log('Testing graceful handling of no unscheduled clips...');
    
    await opusPage.login();
    await opusPage.navigateToCalendar();
    
    const hasUnscheduledClips = await opusPage.hasUnscheduledClips();
    if (!hasUnscheduledClips) {
      console.log('No unscheduled clips found - test passes');
      return;
    }
    
    // If there are unscheduled clips, this test should not run
    throw new Error('This test should only run when there are no unscheduled clips');
  });
}); 