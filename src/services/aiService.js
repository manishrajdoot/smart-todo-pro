const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-7b-instruct:free';

export async function categorizeWithAI(taskText) {
  if (!API_KEY || API_KEY === 'your_openrouter_api_key_here') {
    return fallbackCategorization(taskText);
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a task categorization assistant. Categorize the given task into one of: Work, Personal, Shopping, Health, Education. Also assign priority: high, medium, low. Return ONLY valid JSON in this exact format: {"name": "Category", "color": "blue", "emoji": "💼", "priority": "medium"}.`,
          },
          {
            role: 'user',
            content: `Task: "${taskText}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    const jsonMatch = content.match(/\{.*\}/s);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || 'Personal',
        color: parsed.color || 'yellow',
        emoji: parsed.emoji || '😊',
        priority: parsed.priority || 'medium',
      };
    }
    return fallbackCategorization(taskText);
  } catch (error) {
    console.error('AI categorization error:', error);
    return fallbackCategorization(taskText);
  }
}

function fallbackCategorization(text) {
  if (/(meeting|call|email|presentation|deadline|work|office|client|project|report)/i.test(text)) {
    return { name: 'Work', color: 'blue', emoji: '💼', priority: 'high' };
  }
  if (/(buy|purchase|shop|order|grocery|store|market|shopping)/i.test(text)) {
    return { name: 'Shopping', color: 'green', emoji: '🛍️', priority: 'medium' };
  }
  if (/(gym|workout|run|yoga|walk|health|doctor|medicine|fitness|exercise)/i.test(text)) {
    return { name: 'Health', color: 'red', emoji: '💪', priority: 'medium' };
  }
  if (/(study|learn|read|course|homework|exam|education|school|college|university)/i.test(text)) {
    return { name: 'Education', color: 'purple', emoji: '📚', priority: 'medium' };
  }
  return { name: 'Personal', color: 'yellow', emoji: '😊', priority: 'low' };
}