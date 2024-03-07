const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class GptClass {

    static generateOpenAIResponse = async (message) => {
        const maxRetries = 3;
        let retryDelay = 10000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                
                const response = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [{role: "system", content: "Este é o seu prompt de sistema"}, {role: "user", content: message}],
                    temperature: 0,
                    max_tokens: 500,
                });

                console.log('Response: ', response);

                if (response.data && response.data.choices && response.data.choices.length > 0) {
                    return response.data.choices[0].message.content.trim();
                }

                return "Não foi possível obter uma resposta.";
            } catch (error) {
                console.error('Erro ao gerar resposta da OpenAI:', error);

                if (error.response && error.response.status === 429) {
                    console.log(`Atingido o limite de taxa. Tentando novamente em ${retryDelay / 1000} segundos.`);

                    await new Promise(resolve => setTimeout(resolve, retryDelay));

                    retryDelay *= 2;
                } else {
                    return {
                        msg: `Error: ${error.response?.status || error.message}`
                    };
                }
            }
        }

        console.log('Falha após várias tentativas.');
        return {
            msg: "Falha após várias tentativas. Por favor, tente novamente mais tarde."
        };
    }
}

module.exports = GptClass;
