import Groq from "groq-sdk"
import "dotenv/config"
  const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

async function visionService(text, image_url) {
  const chatCompletion = await groq.chat.completions.create({
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": text
          },
          {
            "type": "image_url",
            "image_url": {
              "url": image_url
            }
          }
        ]
      }
    ],
    "model": "meta-llama/llama-4-scout-17b-16e-instruct",
    "temperature": 1,
    "max_completion_tokens": 1024,
    "top_p": 1,
    "stream": false,
    "stop": null
  });

   console.log(chatCompletion.choices[0].message.content);
}

export { visionService };