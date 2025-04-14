import "dotenv/config";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const speechToTextController = async (req, res) => {
  try {
    // Using a test file path, or you can use req.file.path if using Multer
    // const filePath = "uploads/testing.mp3";
    const filePath = req.file.path; // If using multer to handle file uploads

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "Audio file does not exist at path." });
    }

    const form = new FormData();
    form.append("with_timestamps", "false");
    form.append("with_diarization", "false");
    form.append("file", fs.createReadStream(filePath)); // ✅ Correct file upload
    form.append("model", "saarika:v2");
    form.append("language_code", "hi-IN");

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
        ...form.getHeaders() // ✅ SUPER IMPORTANT
      },
      body: form
    });

    const data = await response.json();

    console.log("Response from Sarvam:", data);
    return res.json(data);
  } catch (err) {
    console.error("Error in Sarvam API request:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
