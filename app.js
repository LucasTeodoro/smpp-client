<<<<<<< HEAD
const express = require("express"),
    http = require("http"),
    app = express(),
    server = http.createServer(app),
    clients = require("./src/connectores"),
    port = process.env.SERVER_PORT || 9500;

server.listen(port, async () => {
    console.log(`> Server listen on port: ${port}`);
    const manager = await clients();
    await manager.newConnector("teste1", "fakesmpp", "2775", "user", "pass");
    await manager.newConnector("teste2", "fakesmpp", "2775", "user", "pass");
});
=======
const smpp = require("smpp"),
    iconv = require("iconv-lite"),
    _  = require("lodash"),
    winston = require('winston');

delete smpp.encodings.UCS2;

module.exports = function Client(name, host, port, username, password, enquire, publish) {
    let _isConnected = false;
    let _status = false;
    let _session = undefined;
    let _enable = false;
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: name },
        transports: [
            new winston.transports.Console({ format: winston.format.simple() })
        ]
    });
    const connection_data = {
        url: `smpp://${host}:${port}`,
        auto_enquire_link_period: 1000 * enquire
    };
    function init() {
        _session = smpp.connect(connection_data);
        _session.on("connect", () => {
            _isConnected = true;
            _status = true;
        });
        _session.on("deliver_sm", (pdu) => {
            if (_.isString(pdu.short_message.message) && pdu.esm_class === 4) {
                let responseStatus = pdu.short_message.message.replace(/ date/g, "_date").split(" ");
                let responseStatusObj = {};
                _.each(responseStatus, (elements) => {
                    const element = elements.split(":");
                    responseStatusObj[element[0]] = element[1];
                });
                responseStatusObj["destination_addr"] = pdu.destination_addr;
                responseStatusObj["source_addr"] = pdu.source_addr;
                publish(`dlr.${name}`, {
                    name,
                    responseStatusObj
                });
                _session.send(pdu.response());
            } else {
                if (pdu.data_coding === 8) {
                    pdu.short_message.message = iconv.decode(pdu.short_message.message, 'latin1');
                }
                if (pdu.short_message.message.indexOf('dlvrd:') === -1) {
                    publish(`mo.${name}`, {
                        name,
                        pdu
                    });
                    _session.send(pdu.response());
                }
            }
        });
        _session.on("error", (error) => {
            _isConnected = false;
            logger.error(error.message);
            _session.close();
        });
        _session.on("unknown", (pdu) => {

        });
        _session.on("enquire_link", (pdu) => {
            _session.send(pdu.response());
        });
        _session.on("close", () => {
            if (_enable === true) {
                _isConnected = false;
                const delay = process.env.SMPP_RETRAY_DELAY || 30;
                logger.info(`${name}: This session is close. Trying to reconnect in ${delay}...`);
                setTimeout(() => {
                    logger.info(`${name}: reconnecting...`);
                    init();
                }, 1000 * delay);
            } else {
                _session.destroy();
                logger.info(`Stop client ${name}`);
            }
        });
    }
    function start() {
        if(_status === false){
            _session.resume();
            _status = true;
        }
    }
    function pause() {
        if(_status === true) {
            _session.pause();
            _status = false;
        }
    }
    function enable() {
        if(_enable === false){
            _session.bind_transceiver({
                system_id: username,
                password
            }, async (pdu) => {
                const state = lookupPDUStatusKey(pdu.command_status);
                if (state === "ESME_ROK") {
                    logger.info(`${name} is connected.`);
                    _enable = true;
                } else {
                    logger.error(`${name} is not connected. smpp error: ${state}`);
                    _enable = false;
                }
            });
        }
    }
    function disable() {
        if(_enable === true) _enable = false;
    }
    async function send(message, destine) {
        if(_enable === false) throw new Error("Can send a message. Connector is not enable.");
        let pdu;
        if (message.length > 160) {
            pdu = new smpp.PDU("submit_sm", {
                destination_addr: destine,
                message_payload: message,
                registered_delivery: 1
            });
        } else {
            pdu = new smpp.PDU("submit_sm", {
                destination_addr: destine,
                short_message: message,
                registered_delivery: 1
            });
        }

        _session.send(pdu, (responsePdu) => {
            const command_status = lookupPDUStatusKey(responsePdu.command_status);
            if (responsePdu.command_status === 0) {
                return {message_id: responsePdu.message_id, command_status: command_status};
            } else {
                return {message_id: undefined, command_status: command_status};
            }
        });
    }
    function lookupPDUStatusKey(pduCommandStatus) {
        for (var k in smpp.errors) {
            if (smpp.errors[k] === pduCommandStatus) {
                return k;
            }
        }
    }
    return {
        init,
        send,
        start,
        enable,
        disable,
        pause
    }
};
>>>>>>> 5e9bbed7fa937d8d1b9e99560bcaa62bbcda5600
