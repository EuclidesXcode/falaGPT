const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient({
    credentials: {
      client_email: 'apifalagpt@falagpt-eucode-ana.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZf9zqLuX/6aec\n7T9OQDeCkTRhHMM8nsI1kUKssrMMmUKgNlMDddSE4bWYm3Cs4U+MCUYhIqsR/Nhy\nESfTgq/g2mySzOVBp8jnynNv3mMoSubo0TqfMYvRTWxIuCRr0nUZBt6nVzutysCe\n8xtG2jsYY+cEf9V4gwaobp/xMPjg1R8SPWvXwBc21+BffoAp9KM3RsU75n7vG6PL\nVx/50f+k+wjAUET/mfwtUXgkWwwMua1Zg5mhVKngynEDGulMCTbFP+AUj70N8bWo\nMu6iFzWQs/BpgxrW2P+jzcbJqTe3mDmktGfSnIU24s2P2D2+kH1ovY7D/fHWxIBO\nPkDpNxmlAgMBAAECggEAFol7r8WJfvC5K5T4z74leE3l/SEqOC8OECve+Hi3SbEB\n44B+YTpuZME39qtR2IwvL/4XlhtfNyGizOKgcJFWTeL8AHTFb0WZfZDPsJvb/qk6\nrHG10/REFUuzC50/ubX5e95yl+q6qCpl7CCA/37goNTgMRysxMgmFNpDMPgx/l6J\n2WoZ/gcrEuBP1NaomLe9rBy0Pfi6KAb1+ypqDVIx5eOloXlmBLAKjBZ8FQQA8Rld\nDYDSk1uYVpnhROkPjhTTEnlqHKWTEWG3LiZjYK4B0GysybD2JhwGAxbev62BA88p\nbcU04GPdM39NFiAOsSBDf6CSaWZZGVdsKpsKCQZ6cQKBgQDUxGBzwRzAIAe7nhV7\n57TBxvjpXBFnx3He3NbtN/6jOnZa21/Ex1Rp7eWFOS6Mi4utVy5j94GMS2PzQlUM\ncYzqNPU4YVZRH2tEL22wFhkrL71LMUSIDdfrkyQ/Y/NGNqQrxgoQ6YICuhXDo+Pd\nx1b1CfDzmPuw8uvLDN9DNisuNQKBgQC4sId02WHlVOK1Vh6BIEJiaQ0Ic/hJFEBu\n5PPN9TMxa4+zKl7/j/eIVX1be6L/dWmC6npmvPgVq4eoZlciM8gjox8lnrT2f5g/\nO1Z0JcCcGJ/vHKzNWqziNE2BqaPOk4n0KGkuEApMVjJvUm0009WpLVvOeEhkFVno\nitryVlxrsQKBgCIWpG1nTzfo6dRBa6fCY894FYEt4wwBhFj0gOrYwc9dGoFMDHf2\nh6vBFbjWhIK4CNTo1uHlUbgsjAL5aa7osm8DtRYnYjD1G7Z88tH3eGjW6TkW16gE\nr8dqd7BAT0W8k2j//bTf9JiDP+FsbKGnwmLYCOa+Z/TdtrF9ine2QgzRAoGAR6lP\nVdqHLqnKMZxRx76Ro4epY+9Dlm+CNMUniHGsxG882cMGC1l8LW0mb9nAPCj9oKuE\nhNqr1BSzVXcoNgArlxBTJJC5HLATje1jNTv0yVyQqgHRVvjo/fhXXolJIv2CWLdZ\nYGMe69HCTgmIkCflznfoGGv5gsP6F83Q+Jjj0XECgYEAkfuGqQDUdbBvEOHq1SQQ\nicTMfq97NARgjSqd0dlxx/lLbOONqwe6de5u09gWvvZI3K6O2FG3YenE4W4Qa9Ww\nV5koS7mDRZn+MdaDRi47yUVi9fe41l0a2CCG+cxFlwT4muVow5qnah9YsM0pe9TH\nx/GAK6Sg4mzvKpxeRUr3TRA=\n-----END PRIVATE KEY-----\n',
    },
  });
const googleTTS = require('google-tts-api');
const fs = require('fs');
const axios = require('axios');

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
    
            const writer = fs.createWriteStream(`${outputPath}/file.ogg`);

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                response.data.on('error', reject);
    
                writer.on('finish', async () => {
                    const transcription = await this.getAudioFromClient(`${outputPath}/file.ogg`);

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

            const config = {
                encoding: 'OGG_OPUS',
                sampleRateHertz: 16000,
                languageCode: 'pt-BR',
                enableAutomaticPunctuation: true
            };
            

            const request = {
                audio: audio,
                config: config,
            };
            const [response] = await speechClient.recognize(request);

            console.log("RESPONSE FICOU ASSIM: ", response)

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
