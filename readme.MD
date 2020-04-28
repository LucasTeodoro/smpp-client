# Smpp Client

Smpp client is a package to help a faster implement.\
[![Version npm](https://img.shields.io/npm/v/smpp-client.svg?style=flat-square)](https://www.npmjs.com/package/smpp-client)[![npm Downloads](https://img.shields.io/npm/dm/smpp-client.svg?style=flat-square)](https://npmcharts.com/compare/smpp-client?minimal=true)


## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install Smpp Client.\
[![NPM](https://nodei.co/npm/smpp-client.png?downloads=true&downloadRank=true)](https://nodei.co/npm/smpp-client/)

## Usage
###**1. Creating a session**
```nodejs
const {Client} = require("smpp-client");

const client = new Client(
    "foo", 
    "localhost", 
    "2775", 
    "username", 
    "password", 
    10, 
    publisher
);
```
|Name       |Description                               |
|-----------|------------------------------------------|
|`name`     |Name the client                           |
|`host`     |IP or DNS to connect                      |
|`port`     |Port smpp                                 |
|`user`     |Username to connect                       |
|`pass`     |Password to connect                       |
|`enquire`  |Time to send a enquire_link(seconds)      |
|`publisher`|AMQP\Redis to publish the responses(DLR)  |

###**2. Star the client**

The start resume the session.

```nodejs
client.start();
```
###**3. Stop the client**

The stop pause the session.

```nodejs
client.stop();
```

###**4. Enable  the client**

The enable make the bind if server.

```nodejs
client.enable();
```

###**5. disable  the client**

The disable destroy de session if server.

```nodejs
client.disable();
```

###**6. Send a message**

The send submit a submit pdu to the server.

```nodejs
client.send("Foo bar", +55999999999).then((response) => {
    console.log(response.message_id, response.command_status);
});
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)