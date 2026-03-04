import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

const anthropic = new Anthropic();

// Almacenamiento simple de conversaciones en memoria
// En producción se podría usar Redis o una base de datos
const conversations = new Map();
const CONVERSATION_TTL = 30 * 60 * 1000; // 30 minutos

function getConversation(userId) {
  const conv = conversations.get(userId);
  if (!conv) return [];
  // Expirar conversaciones viejas
  if (Date.now() - conv.lastUpdate > CONVERSATION_TTL) {
    conversations.delete(userId);
    return [];
  }
  return conv.messages;
}

function saveConversation(userId, messages) {
  conversations.set(userId, {
    messages: messages.slice(-20), // Mantener últimos 20 mensajes
    lastUpdate: Date.now(),
  });
}

// Limpiar conversaciones expiradas cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [userId, conv] of conversations) {
    if (now - conv.lastUpdate > CONVERSATION_TTL) {
      conversations.delete(userId);
    }
  }
}, 10 * 60 * 1000);

export async function chat(userId, userMessage) {
  const history = getConversation(userId);

  history.push({ role: "user", content: userMessage });

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: history,
  });

  const assistantMessage = response.content[0].text;

  history.push({ role: "assistant", content: assistantMessage });
  saveConversation(userId, history);

  // Extraer calificación de lead del texto (si Claude la incluyó)
  let leadScore = "curioso";
  if (assistantMessage.includes("🟢") || /comprador/i.test(assistantMessage)) {
    leadScore = "comprador_potencial";
  } else if (assistantMessage.includes("🟡") || /interesado/i.test(assistantMessage)) {
    leadScore = "interesado";
  }

  return {
    reply: assistantMessage,
    leadScore,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
