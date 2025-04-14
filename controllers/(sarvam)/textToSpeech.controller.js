

export const textToSpeechController = async (req, res) => {

 try {
    const { text } = req.body; // Assuming you're sending the text in the request body
    const bodyJson = JSON.stringify( {"speaker":"anushka","pitch":0,"pace":1,"loudness":1,"speech_sample_rate":22050,"enable_preprocessing":false,"target_language_code":"hi-IN","inputs":[text],"model":"bulbul:v2"}    )
    const options = {
        method: 'POST',
        headers: {
          'api-subscription-key': process.env.SARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        body:     bodyJson   };
      
      fetch('https://api.sarvam.ai/text-to-speech', options)
        .then(response => response.json())
        .then(response =>{
            if(response.request_id){
                res.send(response.audios[0])
            }
        })
        .catch(err => console.error(err));

 } catch (error) {
    console.error("Error in textToSpeechController:", error);
    res.status(500).json({ error: "Internal Server Error" });
    
 }
}