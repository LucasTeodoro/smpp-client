const amqp = require("amqplib");

async function main() {
    try {
        const queue = process.argv.AMQP_QUEUE || "default_queue";
        const amqp_connection = await amqp.connect({
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

        const channel = await amqp_connection.createChannel();
        if(typeof process.argv.AMQP_PREFETCH != "undefined") {
            channel.prefetch(process.argv.AMQP_PREFETCH);
        }
        channel.assertQueue(queue, {durable: true});
        channel.consume(queue, "CONSUMIDOR");
    } catch (e) {
        throw `Something was wrong if connection: ${e.message}`;
    }

}

main().catch(reason => {
    console.error(reason);
});