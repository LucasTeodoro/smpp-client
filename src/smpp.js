const smpp = require("smpp"),
      iconv = require("iconv-lite")
      _ = require("lodash");

delete smpp.encodings.UCS2;

class Smpp {
    constructor() {
        this._isConnected = false;
        this._session = undefined;
    }

    connect() {
        this._session = smpp.connect({
            url: ``,
            auto_enquire_link_period: 10000
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
                    element = elements.split(":");
                    responseStatusObj[element[0]] = element[1];
                });
                responseStatusObj["destination_addr"] = pdu.destination_addr;
                responseStatusObj["source_addr"] = pdu.source_addr;
                rabbit.publish("dlr", responseStatusObj);
                this._session.send(pdu.response());
            } else {
                if (pdu.data_coding === 8) {
                    pdu.short_message.message = iconv.decode(pdu.short_message.message, 'latin1');
                }
                if (pdu.short_message.message.indexOf('dlvrd:') === -1) {
                    rabbit.publish("mo", pdu);
                    session.send(pdu.response());
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

        this._session.on("close", () => {
            this._isConnected = false;
            console.error("This this._session is close. Trying to reconnect...");
            setTimeout(() => { this._session.connect() }, 30000);
        });
    }

    isConnected() {
        return this._isConnected;
    }
}

module.exports = Smpp;