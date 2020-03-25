const {connect} = require("amqplib");

class Amqp {
    constructor() {
        return this.connect();
    }

    async connect() {
        return await connect({
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
    }
}

module.exports = Amqp;