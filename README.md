# ENBA Router Backend

Backend con IA (Claude) para atender consultas de clientes de Escuela Náutica Buenos Aires.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/webhook/manychat` | Webhook para ManyChat (Instagram/Messenger) |
| POST | `/api/chat` | API genérica para web u otros canales |

## Webhook ManyChat

**Request:**
```json
{
  "user_id": "12345",
  "text": "¿Cuánto sale el BRAMA?",
  "first_name": "Juan"
}
```

**Response** (formato ManyChat Dynamic Content v2):
```json
{
  "version": "v2",
  "content": {
    "messages": [
      { "type": "text", "text": "El BRAMA es un Bramador 24..." }
    ]
  }
}
```

## API Chat (web)

**Request:**
```json
{
  "user_id": "web_usuario_1",
  "message": "¿Qué veleros tienen?"
}
```

**Response:**
```json
{
  "reply": "Tenemos 4 veleros en stock...",
  "lead_score": "interesado"
}
```

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `ANTHROPIC_API_KEY` | Sí | API key de Anthropic (Claude) |
| `PORT` | No | Puerto del servidor (default: 3000, Railway lo asigna) |

## Deploy en Railway

1. Conectar este repo en Railway
2. Agregar variable: `ANTHROPIC_API_KEY` = tu key
3. Railway detecta Node.js y hace deploy automático

## Desarrollo local

```bash
cp .env.example .env
# Editar .env con tu API key
npm install
npm start
```

## Funcionalidades

- Respuestas inteligentes con Claude Haiku (rápido y económico)
- Conocimiento completo del catálogo de veleros ENBA
- Memoria de conversación (30 min por usuario)
- Calificación automática de leads (curioso / interesado / comprador potencial)
- Derivación a WhatsApp para compradores potenciales
- Manejo de errores con fallback amigable
