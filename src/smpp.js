const smpp = require("smpp");

const session = smpp.connect({
    url: ``,
    auto_enquire_link_period: 10000
});

session.on("error", (error) => {
    console.error(error.message);
});

session.on("unknown", (pdu) => {

});

session.on("close", () => {
    console.error("This session is close. Trying to reconnect...");
    setTimeout(session.connect, 30000);
});

exports.session = session;