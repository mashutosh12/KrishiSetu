import express from "express"
import multer from "multer"
import { speechToTextController } from "../controllers/(sarvam)/speechToText.controller.js";
import { testingControllerSarvam } from "../controllers/(sarvam)/testing.controller.js";
import { textToSpeechController } from "../controllers/(sarvam)/textToSpeech.controller.js";
// const upload = multer({ dest: 'uploads/' });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      const uniqueName = `audio-${Date.now()}.${ext}`;
      cb(null, uniqueName);
    }
  });
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      // Allow only audio MIME types
      if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
      } else {
        cb(new Error("Only audio files are allowed!"), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // Max 10MB
    }
  });
const sarvamRouter  = express.Router()

sarvamRouter.post("/upload", upload.single('audio'),speechToTextController)
sarvamRouter.post("/testing",testingControllerSarvam)
sarvamRouter.post("/tts",textToSpeechController)
export {sarvamRouter}