import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("ok");
});

app.post("/webhook/manychat", (req, res) => {
  const text = req.body.text || "";
  const intent = req.body.intent || "";

  res.json({
    version: "v2",
    content: {
      messages: [
        {
          type: "text",
          text: `Recibido: ${text} | intent: ${intent}`
        }
      ]
    }
  });
});

app.listen(process.env.PORT || 3000);
