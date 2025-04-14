import vision from "@google-cloud/vision";
import path from "path";
import { fileURLToPath } from "url";
import { visionService } from "../services/visionService.js";
import supabase from '../models/database.js';

import { decode } from "base64-arraybuffer";
import dotenv from "dotenv";
dotenv.config();  
// __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "..", "vision-key.json"),
});

export const performOCR = async (req, res) => {
  try {
    const [result] = await client.textDetection(req.file.path);
    const extractedText = result.textAnnotations[0]?.description || "";

    // Nutrient value extraction
    const nutrientData = {
      N: extractValue(extractedText, /N(?:itrogen)?:?\s*(\d+\.?\d*)/i),
      P: extractValue(extractedText, /P(?:hosphorus)?:?\s*(\d+\.?\d*)/i),
      K: extractValue(extractedText, /K(?:alium|Potassium)?:?\s*(\d+\.?\d*)/i),
      pH: extractValue(extractedText, /pH(?:\s*value)?:?\s*(\d+\.?\d*)/i),
    };

    res.status(200).json({
      message: "OCR Successful",
      text: extractedText,
      nutrients: nutrientData,
    });
  } catch (error) {
    console.error("OCR Error:", error.message);
    res.status(500).json({
      error: "OCR Failed",
      details: error.message,
    });
  }
};

function extractValue(text, regex) {
  const match = text.match(regex);
  return match ? parseFloat(match[1]) : "Not found";
}







  export const  VisionController = async(
    req,res
  )=>
  {
   
try{

  let all_buckets = await supabase.storage.listBuckets()
  console.log(all_buckets)

   console.log(req.file.buffer);
   const fileName = "uploads/"+ req.file.originalname+`_${Date.now()}`;
   await supabase.storage.from('kisansetu').upload(fileName,req.file.buffer,{
    cacheControl: '3600',
    upsert: true,
    contentType: req.file.mimetype,
   } )
   const data = await supabase
   .storage
   .from('kisansetu')
   .createSignedUrl([fileName],3600);
    console.log("url of image is  "+data.data.signedUrl )
    
    visionService("what is the 12 digit adhar number of this person's adhar card ", data.data.signedUrl)

    res.send(all_buckets)
  }
  catch(error){
    console.error("Error uploading file:", error.message);
    res.status(500).json({
      error: "File upload failed",
      details: error.message,
    });
  }
  }