require('dotenv').config();
const express = require('express');
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const GptClass = require('./src/gpt-class')
const AudioConverter = require('./src/audio-converter')

const app = express();
const client = new Client();

app.use(express.json());

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
});

client.on('message', async msg => {

    if(msg.from === 'status@broadcast' || msg.from === '120363112131039503@g.us') return

    console.log('Mensagem recebida:', msg.body, "TYPE: ", msg.type, "FROM: ", msg.from);

    if(msg.type === 'chat') {

        const response = await GptClass.generateOpenAIResponse(msg.body);
        
        if(response.msg) {
            msg.reply(response.msg);
        } else {
            msg.reply(response);
        }
    } else if (msg.type === 'ptt') {

        const text = await AudioConverter.downloadAudio(msg)

        console.log('texto convertido: ', text)

        const response = await GptClass.generateOpenAIResponse(text);
        
        if(response.msg) {
            msg.reply(response.msg);
        } else {
            msg.reply(response);
        }

    }

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

client.initialize();
