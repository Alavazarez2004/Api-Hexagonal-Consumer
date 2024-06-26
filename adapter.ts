const amqp = require('amqplib');
const axios = require('axios');

async function recibirEvento() {
    const connection = await amqp.connect('amqp://guest:guest@3.226.114.66');
    const channel = await connection.createChannel();

    const exchange = 'MiguelCola'; //nombre del exchange al que apunta

    await channel.assertExchange(exchange, 'direct', { durable: true });

    const queueName = 'Miguel'; //busca la cola a la que apunta el exchange
    const queue = await channel.assertQueue(queueName, { exclusive: false });
    await channel.bindQueue(queue.queue, exchange, 'alavazarez');

    console.log('Escuchando eventos de RabbitMQ');

    channel.consume(queue.queue, async(mensaje: { content: any; } | null) => {
        if (mensaje !== null) {
            console.log(`Mensaje recibido de RabbitMQ: ${mensaje.content}`);
            
            // Enviar el mensaje a través de una solicitud POST a una API externa
            const id = mensaje.content
            try {
                const id = Number(mensaje.content)
                const response = await axios.post('https://api-hexagonal-back2.onrender.com/mensaje', {
                   id
                });
                console.log("Respuesta de la API externa:",response.data);
            } catch (error) {
                console.error("Error al enviar el mensaje a la API externa:", error);
            }
        }
    }, { noAck: true });
}

recibirEvento().catch(console.error);