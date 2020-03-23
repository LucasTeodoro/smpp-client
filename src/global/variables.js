global.queue = process.argv.AMQP_QUEUE || "default_queue";
global.sendQueue = `send.${queue}`;
global.confirmQueue = `confirm.${queue}`;
global.receiveQueue = `receive.${queue}`;
global.exchange = process.argv.AMQP_EXCHANGE;