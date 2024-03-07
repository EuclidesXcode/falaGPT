require('dotenv').config();
const express = require('express');
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const GptClass = require('./src/gpt-class')

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

    if(msg.type !== 'chat' || msg.from === 'status@broadcast' || msg.from === '120363112131039503@g.us') return

    console.log('Mensagem recebida:', msg.body, "tipo: ", msg.type, "from: ", msg.from);

    const response = await GptClass.generateOpenAIResponse(msg.body);
    
    if(response.msg) {
        msg.reply(response.msg);
    } else {
        msg.reply(response);
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

client.initialize();
