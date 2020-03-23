global.buffer = (msg) => {
    return Buffer.from(JSON.stringify(msg));
};

global.nack = (msg) => {
    return setTimeout(() => {
        channel.nack(msg);
    }, 1000 * (process.argv.SMPP_RETRAY_DELAY || 30));
};