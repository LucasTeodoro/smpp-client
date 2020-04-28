# Smpp Client

Smpp client is a package to help a faster implement.\
[![Version npm](https://img.shields.io/npm/v/smpp-client.svg?style=flat-square)](https://www.npmjs.com/package/smpp-client)[![npm Downloads](https://img.shields.io/npm/dm/smpp-client.svg?style=flat-square)](https://npmcharts.com/compare/smpp-client?minimal=true)


## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install Smpp Client.\
[![NPM](https://nodei.co/npm/smpp-client.png?downloads=true&downloadRank=true)](https://nodei.co/npm/smpp-client/)

## Usage
###**1. Creating a session**
```node
const {Client} = require("smpp-client");

const client = Client(
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

```node
client.start();
```
###**3. Stop the client**

The stop pause the session.

```node
client.stop();
```

###**4. Enable  the client**

The enable make the bind if server.

```node
client.enable();
```

###**5. disable  the client**

The disable destroy de session if server.

```node
client.disable();
```

###**6. Send a message**

The send submit a submit pdu to the server.

```node
const response = client.send("Foo bar", +55999999999);
console.log(response.message_id, response.command_status);
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Built With

* [node-smpp](https://github.com/farhadi/node-smpp) SMPP Base
* [wiston](https://github.com/winstonjs/winston) Logger
* [lodash](https://lodash.com/)
* [iconv-lite](https://github.com/ashtuchkin/iconv-lite)