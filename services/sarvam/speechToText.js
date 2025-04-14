const form = new FormData();
form.append("with_timestamps", "false");
form.append("with_diarization", "false");
form.append("file", "{}");
form.append("model", "saarika:v2");
form.append("language_code", "hi-IN");

const options = {
  method: 'POST',
  headers: {
    'api-subscription-key': process.env.SARVAM_API_KEY,
    'Content-Type': 'multipart/form-data'
  }
};

options.body = form;

fetch('https://api.sarvam.ai/speech-to-text', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));