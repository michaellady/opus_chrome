import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async transformCaption(originalCaption: string) {
    const examples = `
- Lose by Leglock this weekend at ADCC? This game can help!
- Struggle with Deep Half? This game can help!
- Getting dominated by underhooks?
- Hard time hand fighting? This game can help!
- Suck at Rubber Guard? Play this game to maintain the position better!
- Can't get out of side control? Learn how to increase your mobility!
- Keep Getting Caught With The Same Dumb Stuff?
- Hard time in Deep Half? Just spend time there!
- Struggle submitting your friends?
- Hard time with Headquarters? This game can help!
`;

    const prompt = `Transform the following BJJ video caption into a single, provocative, challenging question aimed at unskilled BJJ white and blue belts. The question MUST be a maximum of 100 characters. Ensure all instances of 'jiu-jitsu', 'jujitsu', and their case variations are replaced with 'BJJ'. The question should be concise, engaging, and in a similar style and tone to the examples provided below.

Examples of desired style and tone:
${examples}

Now, transform this caption: "${originalCaption}"`;

    try {
      console.log(`Transforming caption: ${originalCaption.substring(0, 50)}...`);
      
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.7,
      });

      let transformedText = response.choices[0]?.message?.content?.trim() || '';
      transformedText = transformedText.replace(/jiu-jitsu/gi, 'BJJ').replace(/jujitsu/gi, 'BJJ');

      console.log(`Transformed text: ${transformedText}`);

      return {
        transformed: transformedText,
        boilerplate: this.getBoilerplate(),
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to transform caption: ${error}`);
    }
  }

  private getBoilerplate(): string {
    return `FOLLOW @mikelady to learn how I help busy professionals become semi-pro at BJJ.

Comment "sandbox" below to see how this game fits into the bigger picture in my @sandboxbjj course + community
📸 @vthavillain
#bjj #grappling #submissiongrappling #jiujitsu #adcc`;
  }
} 