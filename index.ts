import express from "express";
import { describeImage, detectMediaType } from "./ai-client.ts";

const app = express();
const port = 3000;
const FILE_SIZE_LIMIT = "10mb";

app.use(express.json({ limit: FILE_SIZE_LIMIT }));


app.post("/get-description", async (req, res) => {
  const image = req.body?.image;

  if (typeof image !== "string" || image.length === 0) {
    return res.status(400).send("Missing 'image' (base64 string)");
  }

  const base64 = image.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  if (buffer.length === 0) {
    return res.status(400).send("Invalid base64 image");
  }

  if (!detectMediaType(buffer)) {
    return res.status(400).send("Unsupported image format (use JPEG, PNG, GIF or WebP)");
  }

  try {
    const description = await describeImage(buffer);
    res.status(200).send(description);
  } catch (error) {
    console.error("Failed to describe image:", error);
    res.status(500).send("Failed to describe image");
  }
});

app.listen(port, () => {
  console.log(`ai-photo-description app listening on port ${port}!`);
});
