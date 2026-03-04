import "dotenv/config";
import express from "express";
import cors from "cors";
import { chat } from "./src/claude.js";

const app = express();
app.use(express.json());
app.use(cors());

// ─── Health check ───────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "enba-router-backend",
    timestamp: new Date().toISOString(),
  });
});

// ─── Webhook ManyChat ───────────────────────────────────────
// ManyChat envía: { user_id, text, intent?, first_name?, last_name? }
// Responde en formato ManyChat Dynamic Content v2
app.post("/webhook/manychat", async (req, res) => {
  try {
    const userId = req.body.user_id || req.body.subscriber_id || "anonymous";
    const text = req.body.text || req.body.last_input_text || "";
    const firstName = req.body.first_name || "";

    if (!text.trim()) {
      return res.json({
        version: "v2",
        content: {
          messages: [
            {
              type: "text",
              text: `¡Hola${firstName ? ` ${firstName}` : ""}! 👋 Soy el asistente de ENBA. ¿En qué puedo ayudarte? Podés preguntarme por nuestros veleros en venta, cursos náuticos, travesías o servicios.`,
            },
          ],
        },
      });
    }

    const result = await chat(`manychat_${userId}`, text);

    const response = {
      version: "v2",
      content: {
        messages: [{ type: "text", text: result.reply }],
      },
    };

    // Si es comprador potencial, agregar botón de WhatsApp
    if (result.leadScore === "comprador_potencial") {
      response.content.messages.push({
        type: "text",
        text: "¿Querés que te conecte con nuestro equipo para coordinar una visita? 👇",
        buttons: [
          {
            type: "url",
            caption: "💬 Hablar por WhatsApp",
            url: "https://wa.me/5491164000000?text=Hola!%20Quiero%20info%20sobre%20veleros",
          },
        ],
      });
    }

    res.json(response);
  } catch (error) {
    console.error("Error en webhook ManyChat:", error.message);
    res.json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: "Disculpá, tuve un problema técnico. ¿Podés repetir tu consulta? Si preferís, escribinos por WhatsApp y te atendemos al toque. ⛵",
          },
        ],
      },
    });
  }
});

// ─── API genérica para web / otros canales ──────────────────
// POST /api/chat { user_id, message }
app.post("/api/chat", async (req, res) => {
  try {
    const { user_id, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "El campo 'message' es requerido" });
    }

    const userId = user_id || `web_${Date.now()}`;
    const result = await chat(userId, message);

    res.json({
      reply: result.reply,
      lead_score: result.leadScore,
    });
  } catch (error) {
    console.error("Error en /api/chat:", error.message);
    res.status(500).json({
      error: "Error procesando el mensaje",
      reply: "Disculpá, tuve un problema técnico. Intentá de nuevo o escribinos por WhatsApp.",
    });
  }
});

// ─── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ENBA Backend corriendo en puerto ${PORT}`);
  console.log(`Anthropic API key: ${process.env.ANTHROPIC_API_KEY ? "✅ configurada" : "❌ NO configurada"}`);
});
