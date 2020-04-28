const {connect} = require("amqplib");

module.exports =  function amqp() {
    let connection = undefined;
    const persist = process.env.AMQP_PERSIST || true;
    const exchange = "messaging";
    const submitResponse = "submit.response";
    const dlrTower = "dlrTower";
    const responseTower = "responseTower";

    async function init() {
        connection = await connect({
            protocol: 'amqp',
            hostname: process.env.AMQP_HOST,
            port: process.env.AMQP_PORT || 5672,
            username: process.env.AMQP_USERNAME || 'guest',
            password: process.env.AMQP_PASSWORD || 'guest',
            locale: process.env.AMQP_LOCALE || 'en_US',
            frameMax: 0,
            heartbeat: process.env.AMQP_HEARTBEAT || 0,
            vhost: process.env.AMQP_VHOST || '/',
        });
    }

    async function newChannel() {
        if(connection === undefined) throw Error("Don't have one connection up.");
        const channel = await connection.createChannel();
        await channel.assertExchange(exchange, "topic", {durable: persist});
        await channel.assertQueue(submitResponse, {durable: persist});
        await channel.assertQueue(dlrTower, {durable: persist});
        await channel.assertQueue(responseTower, {durable: persist});
        await channel.bindQueue(submitResponse, exchange, 'submit.resp.*');
        await channel.bindQueue(dlrTower, exchange, 'dlr.*');
        await channel.bindQueue(responseTower, exchange, 'resp.*');

        async function newConsumer(name, session, consume) {
            const queue = `submit.sm.${name}`;
            await channel.assertQueue(queue, {durable: persist});
            await channel.bindQueue(queue, exchange, queue);
            channel.consume(queue, (msg) => {
                try {
                    const data = JSON.parse(msg.content);
                    session.send(data.message, data.number).then((response) => {
                        console.log(response);
                    }).catch((err) => {
                        console.error(err.message);
                        setTimeout(() => {
                            channel.nack(msg);
                        }, 15000);
                    });
                } catch (e) {
                    console.log(e.message);
                    channel.nack(msg);
                }
            }, {noAck: false});
        }

        function publish(where, msg) {
            channel.publish(exchange, where, buffering(msg), {persistent: persist});
        }

        function setPrefetch(value) {
            channel.prefetch(value);
        }

        function nack(msg, number) {
            const timeout = process.env.SMPP_RETRAY_DELAY || 30;
            console.error(`Error to send: ${number}, Waiting ${timeout} seconds to try again...`);
            return setTimeout(() => {
                channel.nack(msg);
            }, 1000 * timeout);
        }

        function buffering(msg) {
            return Buffer.from(JSON.stringify(msg));
        }

        return {
            newConsumer,
            setPrefetch,
            publish,
            nack
        }
    }

    return {
        init,
        newChannel
    }
}