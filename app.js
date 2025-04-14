import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import ocrRoutes from "./routes/ocrRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import { sarvamRouter } from "./routes/sarvam.route.js";
import * as farmerController from "./controllers/farmerController.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/ocr", ocrRoutes);
app.use("/api/sarvam",sarvamRouter)
app.use("/api/planner", plannerRoutes);
app.use("/api/farmer/save", farmerController.saveProfile);
app.use("/api/farmer/id", farmerController.getProfile);
// Default route
app.get('/', (req, res) => {
  res.send('API is running - OCR and Seed & Crop Planner services available');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});