const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
  });
const googleTTS = require('google-tts-api');
const fs = require('fs');
const axios = require('axios');

const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'pt-BR',
    enableAutomaticPunctuation: true,
    useEnhanced: false,
};

class AudioConverter {
    static async downloadAudio(msg) {
        const outputPath = './audio';
        if (!fs.existsSync(outputPath)){
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const path = msg._data.directPath

        try {

            const response = await axios({
                url: `https://mmg.whatsapp.net${path}`,
                method: 'GET',
                responseType: 'stream'
            });
    
            const writer = fs.createWriteStream(`${outputPath}/file.enc`);

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                response.data.on('error', reject);
    
                writer.on('finish', async () => {
                    const transcription = await this.getAudioFromClient(`${outputPath}/file.enc`);

                    console.log("COMO FICOU: ", transcription)
                    resolve(transcription);
                });
                writer.on('error', reject);
            });
    
        } catch (error) {
            console.error(`Erro ao baixar o áudio: ${error}`);
            throw error;
        }
    }
    
    static async getAudioFromClient(audioPath) {
        try {
            console.log("vai tentar ler o arquivo")
            const audioContent = fs.readFileSync(audioPath);

            const audio = {
                content: audioContent.toString('base64'),
            };

            const request = {
                audio: audio,
                config: config,
            };
            const [response] = await speechClient.recognize(request);

            console.log("RESPONSE FICOU ASSIM: ", response.results[0])
            console.log("RESPONSE FICOU ASSIM 2222: ", response.results[0].alternatives[0].transcript)

            return response.results.map(result => result.alternatives[0].transcript).join('\n');
        } catch (error) {
            console.error(`Erro ao converter áudio em texto: ${error}`);
            throw error;
        }
    }
    
    static async convertToAudioFromGptText(text) {
        try {
            const url = await googleTTS.getAudioUrl(text, {
                lang: 'pt-BR',
                slow: false,
                host: 'https://translate.google.com',
            });
            return url;
        } catch (error) {
            console.error(`Erro ao converter texto em áudio: ${error}`);
            throw error;
        }
    }
}

module.exports = AudioConverter;
