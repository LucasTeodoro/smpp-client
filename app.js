const {connect} = require("amqplib");
const Smpp = require("./src/smpp");

async function main() {
    try {
        const smpp = new Smpp();
        smpp.connect();
        const queue = process.argv.AMQP_QUEUE || "default_queue";
        const amqp_connection = await connect({
            protocol: 'amqp',
            hostname: process.argv.AMQP_HOST,
            port: process.argv.AMQP_PORT || 5672,
            username: process.argv.AMQP_USERNAME || 'guest',
            password: process.argv.AMQP_PASSWORD || 'guest',
            locale: process.argv.AMQP_LOCALE || 'en_US',
            frameMax: 0,
            heartbeat: process.argv.AMQP_HEARTBEAT || 0,
            vhost: process.argv.AMQP_VHOST || '/',
        });
        window.channel = await amqp_connection.createChannel();
        if(typeof process.argv.AMQP_PREFETCH != "undefined") {
            channel.prefetch(process.argv.AMQP_PREFETCH);
        }
        channel.assertQueue(queue, {durable: true});
        channel.consume(queue, async (msg) => {
            const data = JSON.parse(msg.content);
            if(smpp.isConnected()) {
                try {
                    const message_id = await smpp.send(data.message, data.number);
                    channel.ack(msg);
                } catch (e) {
                    console.log(e.message);
                    setTimeout(() => {
                        channel.nack(msg);
                    }, 1000 * (process.argv.SMPP_RETRAY_DELAY || 30));
                }
            }

            channel.nack(msg);
        });
    } catch (e) {
        throw `Something was wrong if connection: ${e.message}`;
    }
}

main().catch(reason => {
    console.error(reason);
});