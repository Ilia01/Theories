/**
 * AI-Powered Flashcard Generator
 * Uses free AI APIs (Groq, Gemini, HuggingFace) to generate diverse, intelligent flashcards
 */

(function () {
  'use strict';

  const API_ENDPOINTS = {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    huggingface: 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct',
  };

  const MODELS = {
    groq: {
      fast: 'llama-3.1-8b-instant', // Faster, good for simple questions
      smart: 'llama-3.3-70b-versatile', // Smarter, better variety
    },
    gemini: {
      default: 'gemini-1.5-flash',
    },
  };

  class AIFlashcardGenerator {
    constructor(settings) {
      this.settings = settings || {};
      this.provider = this.settings.aiProvider || 'groq';
      this.apiKey = this.settings.aiApiKey || '';
    }

    /**
     * Generate flashcards from markdown content using AI
     * @param {string} markdown - The markdown content
     * @param {string} topicTitle - The topic title
     * @param {object} section - Section details {heading, content, level}
     * @returns {Promise<Array>} Array of flashcard objects
     */
    async generateFlashcards(markdown, topicTitle, section) {
      if (!this.apiKey) {
        throw new Error('AI API key not configured');
      }

      const prompt = this.buildPrompt(topicTitle, section);
      const response = await this.callAI(prompt);
      return this.parseResponse(response, section);
    }

    /**
     * Build the prompt for AI based on content and settings
     */
    buildPrompt(topicTitle, section) {
      const questionsPerSection = this.settings.questionsPerSection || 3;
      const diversity = this.settings.questionDiversity || 'high';

      const diversityInstructions = {
        low: 'Focus on definition and basic understanding questions.',
        medium: 'Mix definition questions with some application and explanation questions.',
        high: 'Use maximum variety: definitions, how-to, when-to-use, comparisons, debugging, scenarios, and fill-in-blanks.',
      };

      return `You are an expert technical flashcard generator for software engineering education.

TOPIC: ${topicTitle}
SECTION: ${section.heading}
CONTENT:
${section.content}

TASK: Generate exactly ${questionsPerSection} diverse flashcard questions from this content.

QUESTION TYPES TO USE (${diversity} diversity):
${diversityInstructions[diversity]}

Available question formats:
1. **definition**: "What is X?" - for concepts and terminology
2. **explanation**: "How does X work?" - for mechanisms and processes
3. **application**: "When should you use X?" - for practical use cases
4. **comparison**: "What's the difference between X and Y?" - for contrasts
5. **debugging**: "What's wrong with this code?" - for common mistakes
6. **scenario**: "How would you solve X problem?" - for real-world application
7. **fill-blank**: "A closure is a _____ bundled with _____" - for key facts
8. **best-practice**: "What's the best way to X?" - for recommendations

REQUIREMENTS:
- Return ONLY valid JSON, no markdown or extra text
- Each question must be clear and specific
- Answers should be concise but complete (50-300 words)
- Include code blocks in answers when relevant (use markdown format)
- Vary question types for better learning
- Focus on the most important concepts

EXAMPLE OUTPUT FORMAT:
[
  {
    "question": "What is a closure in JavaScript?",
    "answer": "A closure is a function that has access to variables from its outer (enclosing) function's scope, even after the outer function has returned. This happens because functions in JavaScript form closures.",
    "type": "definition",
    "difficulty": "medium"
  },
  {
    "question": "When should you use closures?",
    "answer": "Use closures for: 1) Data privacy/encapsulation 2) Function factories 3) Event handlers 4) Callbacks that need to maintain state",
    "type": "application",
    "difficulty": "easy"
  }
]

Return ONLY the JSON array, nothing else:`;
    }

    /**
     * Call the appropriate AI provider
     */
    async callAI(prompt) {
      switch (this.provider) {
        case 'groq':
          return await this.callGroq(prompt);
        case 'gemini':
          return await this.callGemini(prompt);
        case 'huggingface':
          return await this.callHuggingFace(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    }

    /**
     * Call Groq API (Recommended - Fast & Free)
     */
    async callGroq(prompt) {
      const model =
        this.settings.questionDiversity === 'low' ? MODELS.groq.fast : MODELS.groq.smart;

      const response = await fetch(API_ENDPOINTS.groq, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content:
                'You are a flashcard generator. Always respond with valid JSON arrays only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7, // Balance between creativity and consistency
          max_tokens: 2000,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    /**
     * Call Google Gemini API
     */
    async callGemini(prompt) {
      const url = `${API_ENDPOINTS.gemini}?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }

    /**
     * Call Hugging Face API
     */
    async callHuggingFace(prompt) {
      const response = await fetch(API_ENDPOINTS.huggingface, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data[0].generated_text;
    }

    /**
     * Parse AI response and convert to flashcard format
     */
    parseResponse(responseText, section) {
      try {
        // Try to extract JSON from response (in case AI adds extra text)
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No JSON array found in AI response');
        }

        const cards = JSON.parse(jsonMatch[0]);

        return cards
          .filter(card => card.question && card.answer)
          .map(card => ({
            question: card.question.trim(),
            answer: card.answer.trim(),
            source: 'ai',
            type: card.type || 'general',
            difficulty: card.difficulty || 'medium',
            aiProvider: this.provider,
            level: section.level || 2,
            confidence: 0,
            reviewCount: 0,
            correctCount: 0,
          }));
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        console.error('Response was:', responseText);
        throw new Error(
          `Failed to parse AI response: ${e.message}. The AI may have returned invalid JSON.`
        );
      }
    }

    /**
     * Test API connection
     */
    async testConnection() {
      const testPrompt = 'Generate 1 flashcard about JavaScript closures. Return only JSON array: [{"question":"...","answer":"...","type":"definition"}]';

      try {
        const response = await this.callAI(testPrompt);
        const cards = this.parseResponse(response, { level: 2 });
        return {
          success: true,
          message: `Successfully connected to ${this.provider}`,
          sampleCard: cards[0],
        };
      } catch (error) {
        return {
          success: false,
          message: `Connection failed: ${error.message}`,
        };
      }
    }
  }

  globalThis.AIFlashcardGenerator = AIFlashcardGenerator;
})();
