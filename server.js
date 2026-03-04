import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.post("/webhook/manychat", async (req, res) => {
  // Por ahora solo eco para probar
  const text =
    req.body?.text ||
    req.body?.message ||
    req.body?.last_text ||
    "mensaje sin texto";

  return res.json({
    reply: `Recibido: ${text}`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on", PORT));
