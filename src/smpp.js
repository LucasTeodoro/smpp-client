const smpp = require("smpp"),
      iconv = require("iconv-lite"),
      _ = require("lodash");

delete smpp.encodings.UCS2;

class Smpp {
    constructor() {
        this._isConnected = false;
        this._session = undefined;
    }

    connect() {
        this._session = smpp.connect({
            url: `smpp://${process.argv.SMPP_HOST}:${process.argv.SMPP_PORT}`,
            auto_enquire_link_period: 1000 * (process.argv.SMPP_ENQUIRELINK || 10)
        });

        this._session.on("connect", () => {
            this._session.bind_transceiver({
                system_id: process.argv.SMPP_USER,
                password: process.argv.SMPP_PASSWORD
            }, async (pdu) => {
                if (pdu.command_status === 0) {
                    this._isConnected = true;
                }
            });
        });

        this._session.on("deliver_sm", (pdu) => {
            if (_.isString(pdu.short_message.message) && pdu.esm_class === 4) {
                let responseStatus = pdu.short_message.message.replace(/ date/g,"_date").split(" ");
                let responseStatusObj = {};
                _.each(responseStatus, (elements) => {
                    const element = elements.split(":");
                    responseStatusObj[element[0]] = element[1];
                });
                responseStatusObj["destination_addr"] = pdu.destination_addr;
                responseStatusObj["source_addr"] = pdu.source_addr;
                channel.publish(confirmQueue, buffer(responseStatusObj));
                this._session.send(pdu.response());
            } else {
                if (pdu.data_coding === 8) {
                    pdu.short_message.message = iconv.decode(pdu.short_message.message, 'latin1');
                }
                if (pdu.short_message.message.indexOf('dlvrd:') === -1) {
                    channel.publish(receiveQueue, buffer(pdu));
                    this._session.send(pdu.response());
                }
            }
        });

        this._session.on("error", (error) => {
            this._isConnected = false;
            console.error(error.message);
            this._session.close();
        });

        this._session.on("unknown", (pdu) => {

        });

        this._session.on("enquire_link", (pdu) => {
            this._session.send(pdu.response());
        });

        this._session.on("close", () => {
            this._isConnected = false;
            console.error("This session is close. Trying to reconnect...");
            setTimeout(() => { this._session.connect() }, 30000);
        });
    }

    isConnected() {
        return this._isConnected;
    }

    async send(message, destine) {
        let pdu;
        if(message.length > 160) {
            pdu = new smpp.PDU("submit_sm", {
                destination_addr: destine,
                message_payload: message,
                registered_delivery: 1,
                data_coding: 0x01
            });
        } else {
            pdu = new smpp.PDU("submit_sm", {
                destination_addr: destine,
                short_message: message,
                registered_delivery: 1,
                data_coding: 0x01
            });
        }

        this._session.send(pdu, (responsePdu) => {
            const command_status = this.lookupPDUStatusKey(responsePdu.command_status);
            if(responsePdu.command_status === 0) {
                return {message_id: responsePdu.message_id, command_status: command_status};
            } else {
                return {message_id: undefined, command_status: command_status};
            }

            throw new Error(`Não foi possivel enviar o sms erro: ${command_status}`);
        });
    }

    lookupPDUStatusKey(pduCommandStatus) {
        for (var k in smpp.errors) {
            if (smpp.errors[k] === pduCommandStatus) {
                return k
            }
        }
    }
}

module.exports = Smpp;