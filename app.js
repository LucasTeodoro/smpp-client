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