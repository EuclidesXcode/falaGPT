const OpenAI = require("openai")
const openai = new OpenAI();

class GptClass {

    static generateOpenAIResponse = async (message) => {

        const maxRetries = 3;
        let retryDelay = 10000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await openai.completions.create({
                    model: "gpt-3.5-turbo-instruct",
                    prompt: message,
                    max_tokens: 150,
                    temperature: 1,
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    }
                });

                console.log('respons: ', response)

                return response.choices[0].text.trim();
            } catch (error) {
                console.error('Erro ao gerar resposta da OpenAI:', error);

                if (error.response && error.response.status === 429) {
                    console.log(`Atingido o limite de taxa. Tentando novamente em ${retryDelay / 1000} segundos.`);

                    await new Promise(resolve => setTimeout(resolve, retryDelay));

                    retryDelay *= 2;
                } else {
                    return {
                        msg: `Error: ${error.code || error.message}`
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

module.exports = GptClass