export const SELECTORS = {
  // Modal and container selectors
  modalContainer: 'div[role="dialog"][data-state="open"][aria-labelledby^="radix-"]',
  platformSectionContainer: 'div.flex.w-\\[683px\\].flex-col.gap-6.overflow-y-auto.p-4',
  platformSection: 'div.flex.gap-4',
  platformIconSvgContainer: 'div > div > span[style*="width: 32px"] div.border-border svg',
  
  // Editor and input selectors
  draftEditor: 'div.public-DraftEditor-content[contenteditable="true"]',
  facebookTitleInput: 'input[name^="FACEBOOK_PAGE"][name$=".title"]',
  youtubeTitleInput: 'input[name^="YOUTUBE"][name$=".title"]',
  
  // Calendar and clip selectors
  calendarDay: '[data-testid="calendar-day"]',
  calendarDayWithContent: '[data-testid="calendar-day"].has-content',
  clipItem: '[data-testid="clip-item"]',
  clipItemScheduled: '[data-testid="clip-item"].scheduled',
  
  // Button selectors
  scheduleButton: '[data-testid="schedule-button"]',
  saveScheduleButton: '[data-testid="save-schedule-button"]',
  
  // Authentication selectors
  userMenu: '[data-testid="user-menu"]',
  emailInput: '[data-testid="email-input"]',
  passwordInput: '[data-testid="password-input"]',
  loginButton: '[data-testid="login-button"]',
  
  // Success/error message selectors
  successMessage: '[data-testid="success-message"]',
  errorMessage: '[data-testid="error-message"]',
  
  // Platform-specific SVG selectors for identification
  instagramSvg: 'svg rect[fill^="url(#pattern"]',
  facebookSvg: 'svg path[fill="#0866FF"]',
  youtubeSvg: 'svg rect[fill="#FF0000"]',
  tiktokSvg: 'svg rect[fill="black"] + path[fill="#FF004F"]',
  twitterSvg: 'svg[viewBox="0 0 18 18"]',
}; 