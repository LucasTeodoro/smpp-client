require("./src/global/functions");
require("./src/global/variables");
const Smpp = require("./src/smpp");
const Amqp = require("./src/connections/rabbit");
const rules = require("send-rules");

async function main() {
    try {
        const smpp = new Smpp();
        smpp.connect();
        const amqp = await new Amqp();
        global.channel = await amqp.createChannel();

        if(typeof process.argv.AMQP_PREFETCH != "undefined") {
            channel.prefetch(process.argv.AMQP_PREFETCH);
        }
        channel.assertQueue(queue, {durable: process.argv.AMQP_PERSIST || true});
        channel.assertQueue(sendQueue, {durable: process.argv.AMQP_PERSIST || true});
        channel.assertQueue(confirmQueue, {durable: process.argv.AMQP_PERSIST || true});
        channel.assertQueue(receiveQueue, {durable: process.argv.AMQP_PERSIST || true});
        if(exchange !== undefined) {
            channel.assertExchange(exchange, "topic", {durable: process.argv.AMQP_PERSIST || true});
        }
        channel.consume(queue, async (msg) => {
            const data = JSON.parse(msg.content);
            if(smpp.isConnected()) {
                try {
                    const {message_id, command_status} = await smpp.send(data.message, data.number);
                    publish(sendQueue,{message_id: data.message_id, send_message_id: message_id, command_status: command_status});
                    channel.ack(msg);
                    return;
                } catch (e) {
                    console.log(e.message);
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