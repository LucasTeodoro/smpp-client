const Client = require("smpp-client"),
    amqp = require("./tools/amqp");

module.exports = async function clients() {
    const rabbit = amqp();

    await rabbit.init();
    const channel = await rabbit.newChannel();
    const state = {
        connectors: {}
    };

    function newConnector(name, host, port, username, password, enquire = 10) {
        const session = Client(name, host, port, username, password, enquire, channel.publish);
        session.init();
        session.enable();
        channel.newConsumer(name, session);
        state.connectors[name] = {session};
    }

    function getConnector(name) {
        return state.connectors[name];
    }

    return {
        newConnector,
        getConnector,
    }

};