# Opus Clip Content Automation

This project provides a complete automated UI test solution that replaces the Chrome extension functionality for Opus Clip content scheduling. It automates the entire workflow from login to scheduling posts with AI-generated BJJ-focused content.

## 🎯 Overview

This automation performs the exact same steps as the Chrome extension:
1. **Login** to Opus Clip
2. **Navigate** to the auto-post calendar
3. **Find** the latest day without scheduled content
4. **Select** an unscheduled clip
5. **Extract** the original caption
6. **Transform** it with OpenAI into a BJJ-focused question
7. **Populate** all platform fields (Facebook, Instagram, YouTube, TikTok, Twitter)
8. **Save** the scheduled post

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Opus Clip account
- OpenAI API key

### Installation

1. **Clone and setup the project:**
```bash
cd opus-clip-automation
npm install
npx playwright install
```

2. **Configure environment variables:**
```bash
cp env.example .env
```

Edit `.env` file with your credentials:
```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
OPUS_CLIP_EMAIL=your_email@example.com
OPUS_CLIP_PASSWORD=your_password_here
```

3. **Run the automation:**
```bash
# Run the complete automation
npm run test opus-clip-workflow.spec.ts

# Run with visual debugging
npm run test opus-clip-workflow.spec.ts --headed

# Run the demo (no credentials required)
npm run test complete-automation-demo.spec.ts --headed
```

## 📁 Project Structure

```
opus-clip-automation/
├── src/
│   ├── pages/
│   │   └── OpusClipPage.ts          # Main page object for Opus Clip
│   ├── services/
│   │   └── OpenAIService.ts         # OpenAI API integration
│   └── utils/
│       └── selectors.ts             # CSS selectors for elements
├── tests/
│   ├── opus-clip-workflow.spec.ts   # Main automation test
│   ├── complete-automation-demo.spec.ts  # Demo without credentials
│   ├── explore-site.spec.ts         # Site exploration
│   ├── mock-automation.spec.ts      # Mock workflow demo
│   └── page-analysis.spec.ts        # Page structure analysis
├── playwright.config.ts             # Playwright configuration
├── package.json                     # Dependencies
└── README.md                        # This file
```

## 🔧 Configuration

### Playwright Configuration
The automation is configured in `playwright.config.ts`:
- **Browser**: Chromium (Chrome-based)
- **Headless**: false (for debugging), set to true for CI/CD
- **Timeouts**: 60 seconds for tests, 30 seconds for navigation
- **Retries**: 2 attempts per test
- **Screenshots**: Saved on failure
- **Videos**: Saved on failure

### OpenAI Configuration
The AI service is configured in `src/services/OpenAIService.ts`:
- **Model**: gpt-4o (configurable via environment)
- **Temperature**: 0.7 (for creative but consistent output)
- **Max tokens**: 50 (for concise questions)
- **Prompt**: Optimized for BJJ content transformation

## 🎬 How It Works

### Step-by-Step Process

1. **Authentication**
   - Navigate to Opus Clip homepage
   - Check if already logged in
   - If not, fill credentials and login
   - Handle OAuth redirects if needed

2. **Calendar Navigation**
   - Navigate to `/auto-post/calendar`
   - Wait for calendar to load
   - Verify we're on the correct page

3. **Day Selection**
   - Find all calendar days
   - Identify days without scheduled content
   - Select the latest empty day
   - Click on the selected day

4. **Clip Selection**
   - Look for clip/video elements
   - Check scheduling status of each clip
   - Find the first unscheduled clip
   - Click on the unscheduled clip

5. **Modal Interaction**
   - Wait for schedule modal to appear
   - Verify modal contains platform sections
   - Wait for all content to load

6. **Caption Extraction**
   - Locate Instagram section in modal
   - Find Draft.js editor component
   - Extract text content from editor
   - Store original caption for transformation

7. **AI Transformation**
   - Send caption to OpenAI API
   - Use specialized prompt for BJJ content
   - Receive transformed question
   - Apply "BJJ" replacements

8. **Content Population**
   - Identify each platform section
   - Populate Facebook title and caption
   - Populate Instagram caption
   - Populate YouTube title and caption
   - Populate TikTok caption
   - Populate Twitter caption (no boilerplate)

9. **Verification**
   - Check each platform field contains correct content
   - Verify "BJJ" replacements were applied
   - Confirm boilerplate text is present where needed
   - Validate character limits are respected

10. **Save Schedule**
    - Locate save/schedule button
    - Click save button
    - Wait for success confirmation
    - Verify post is scheduled

## 🤖 AI Content Transformation

The automation uses a specialized prompt to transform BJJ video captions:

### Input Example:
```
"Learn how to escape from deep half guard position with these essential techniques"
```

### Output Example:
```
"Struggle with Deep Half? This game can help!"
```

### Boilerplate Text:
```
FOLLOW @mikelady to learn how I help busy professionals become semi-pro at BJJ.

Comment "sandbox" below to see how this game fits into the bigger picture in my @sandboxbjj course + community
📸 @vthavillain
#bjj #grappling #submissiongrappling #jiujitsu #adcc
```

## 📱 Platform-Specific Content

| Platform | Title | Caption |
|----------|-------|---------|
| **Facebook** | Transformed question | Question + Boilerplate |
| **Instagram** | - | Question + Boilerplate |
| **YouTube** | Transformed question | Question + Boilerplate |
| **TikTok** | - | Question + Boilerplate |
| **Twitter** | - | Question only |

## 🛠️ Error Handling

The automation includes robust error handling:

- **Retry Logic**: 3 attempts per workflow
- **Graceful Degradation**: Handles missing elements gracefully
- **Timeout Management**: Appropriate timeouts for each step
- **Screenshot Capture**: Visual debugging on failures
- **Detailed Logging**: Comprehensive console output

## 🧪 Testing

### Available Tests

1. **`opus-clip-workflow.spec.ts`** - Complete automation (requires credentials)
2. **`complete-automation-demo.spec.ts`** - Demo workflow (no credentials needed)
3. **`explore-site.spec.ts`** - Site structure exploration
4. **`mock-automation.spec.ts`** - Mock workflow demonstration
5. **`page-analysis.spec.ts`** - Page structure analysis

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test
npm run test opus-clip-workflow.spec.ts

# Run with visual debugging
npm run test --headed

# Run with step-by-step debugging
npm run test --debug

# Generate test report
npm run report
```

## 🔄 Scheduling

### Manual Execution
```bash
npm run test opus-clip-workflow.spec.ts
```

### Automated Scheduling

#### Cron Job (Linux/Mac)
```bash
# Add to crontab -e
# Run every day at 9 AM
0 9 * * * cd /path/to/opus-clip-automation && npm run test opus-clip-workflow.spec.ts
```

#### GitHub Actions
```yaml
name: Daily Opus Clip Automation
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  automate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test opus-clip-workflow.spec.ts
```

## 🆚 Comparison with Chrome Extension

| Feature | Chrome Extension | UI Automation |
|---------|------------------|---------------|
| **Installation** | Browser extension | Node.js project |
| **Dependencies** | Chrome browser | Node.js + Playwright |
| **Maintenance** | Extension updates | Code updates |
| **Scheduling** | Manual only | Automated via cron/CI |
| **Error Handling** | Limited | Comprehensive |
| **Debugging** | Browser dev tools | Screenshots + videos |
| **Cross-platform** | Chrome only | Any OS with Node.js |
| **Monitoring** | None | Full logging + reporting |

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify credentials in `.env` file
   - Check if account requires 2FA
   - Ensure account is active

2. **Calendar Not Loading**
   - Check internet connection
   - Verify Opus Clip service status
   - Try increasing timeouts in config

3. **AI Transformation Failed**
   - Verify OpenAI API key
   - Check API quota/limits
   - Ensure model is available

4. **Elements Not Found**
   - Opus Clip may have updated UI
   - Check selectors in `src/utils/selectors.ts`
   - Run exploration tests to find new selectors

### Debug Mode

```bash
# Run with detailed debugging
npm run test --debug

# Check screenshots and videos
ls test-results/
```

## 📈 Monitoring & Logging

The automation provides comprehensive logging:

- **Console Output**: Step-by-step progress
- **Screenshots**: Visual capture on failures
- **Videos**: Full session recording
- **Traces**: Detailed interaction traces

## 🔒 Security

- **Environment Variables**: Credentials stored in `.env` (not committed)
- **API Keys**: OpenAI key stored securely
- **No Hardcoding**: All sensitive data externalized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the test results and screenshots
3. Run the exploration tests to understand site changes
4. Check Opus Clip's status page for service issues

---

**Ready to automate your Opus Clip content scheduling! 🚀** 