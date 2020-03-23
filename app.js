require("./src/global/functions");
require("./src/global/variables");
const Smpp = require("./src/smpp");
const Amqp = require("./src/connections/rabbit");

async function main() {
    try {
        const smpp = new Smpp();
        smpp.connect();
        const amqp = await new Amqp();
        global.channel = await amqp.createChannel();

        if(typeof process.argv.AMQP_PREFETCH != "undefined") {
            channel.prefetch(process.argv.AMQP_PREFETCH);
        }
        channel.assertQueue(queue, {durable: true});
        channel.assertQueue(sendQueue, {durable: true});
        channel.assertQueue(confirmQueue, {durable: true});
        channel.assertQueue(receiveQueue, {durable: true});
        channel.consume(queue, async (msg) => {
            const data = JSON.parse(msg.content);
            if(smpp.isConnected()) {
                try {
                    const {message_id, command_status} = await smpp.send(data.message, data.number);
                    channel.publish(sendQueue, buffer({message_id: data.message_id, send_message_id: message_id, command_status: command_status}));
                    channel.ack(msg);
                    return;
                } catch (e) {
                    console.log(e.message);
                    nack(msg);
                }
            }

            nack(msg);
        });
    } catch (e) {
        throw `Something was wrong if connection: ${e.message}`;
    }
}

main().catch(reason => {
    console.error(reason);
});