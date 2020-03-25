module.exports = {
    apps : [
        {
            name: "smpp-cliente",
            script: "./app.js",
            watch: true,
            env: {
                "AMQP_QUEUE": "default_queue",
                "AMQP_HOST": "localhost",
                "AMQP_PORT": "5672",
                "AMQP_USERNAME": "guest",
                "AMQP_PASSWORD": "guest",
                "AMQP_LOCALE": "en_US",
                "AMQP_HEARTBEAT": "0",
                "AMQP_VHOST": "/",
                "AMQP_PREFETCH": undefined,
                "AMQP_EXCHANGE": undefined,
                "SMPP_HOST": "localhost",
                "SMPP_PORT": "2775",
                "SMPP_USER": "admin",
                "SMPP_PASSWORD": "",
                "SMPP_ENQUIRELINK": "30",
                "SMPP_RETRAY_DELAY": "30",
            }
        }
    ]
}