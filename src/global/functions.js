global.buffer = (msg) => {
    return Buffer.from(JSON.stringify(msg));
};

global.nack = (msg) => {
    return setTimeout(() => {
        channel.nack(msg);
    }, 1000 * (process.argv.SMPP_RETRAY_DELAY || 30));
};

global.publish = (queue, msg) => {
    if(exchange === undefined) {
        channel.publish(queue, buffer(msg), {persistent: process.argv.AMQP_PERSIST || true});
    } else {
        channel.publish(exchange, queue, buffer(msg), {persistent: process.argv.AMQP_PERSIST || true});
    }
};