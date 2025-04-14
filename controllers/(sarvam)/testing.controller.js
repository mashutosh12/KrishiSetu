import fs from "fs";

export const testingControllerSarvam = async (req, res) => {
  const filePath = "uploads/testing.mp3";

  try {
    const file = fs.createReadStream(filePath);

    // You can debug using a stream event
    file.on("open", () => {
      console.log("File stream opened successfully.");
    });

    file.on("error", (err) => {
      console.error("Stream error:", err);
      return res.status(500).send("Error opening the file.");
    });

    res.send("hi");
  } catch (err) {
    console.error("Caught exception:", err);
    res.status(500).send("Unexpected error");
  }
};
