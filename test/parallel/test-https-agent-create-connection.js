'use strict';

const common = require('../common');
if (!common.hasCrypto) {
  common.skip('missing crypto');
  return;
}

const assert = require('assert');
const https = require('https');

const agent = new https.Agent();

const fs = require('fs');

const options = {
  key: fs.readFileSync(common.fixturesDir + '/keys/agent1-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent1-cert.pem'),
};

const server = https.createServer(options, (req, res) => {
  res.end('hello world\n');
});

const expectedHeader = /^HTTP\/1.1 200 OK/;
const expectedBody = /hello world\n/;
const expectCertError = /^Error: unable to verify the first certificate$/;

const checkRequest = (socket, server) => {
  let result = '';
  socket.on('connect', common.mustCall((data) => {
    socket.write('GET / HTTP/1.1\r\n\r\n');
    socket.end(); 
  }));
  socket.on('data', common.mustCall((chunk) => { 
    result += chunk;
  }));
  socket.on('end', () => {
    assert(expectedHeader.test(result));
    assert(expectedBody.test(result));
    server.close();
  });
};

// use option connect
server.listen(0, () => {
  const port = server.address().port;
  const host = 'localhost';
  const options = {
    port: port,
    host: host,
    rejectUnauthorized: false,
    _agentKey: agent.getName({
      port: port,
      host: host,
    }),
  };

  const socket = agent.createConnection(options);
  checkRequest(socket, server);
});

// use port and option connect
server.listen(0, () => {
  const port = server.address().port;
  const host = 'localhost';
  const options = {
    rejectUnauthorized: false,
    _agentKey: agent.getName({
      port: port,
      host: host,
    }),
  };
  const socket = agent.createConnection(port, options);
  checkRequest(socket, server);
});

// use port and host and option connect
server.listen(0, () => {
  const port = server.address().port;
  const host = 'localhost';
  const options = {
    rejectUnauthorized: false,
    _agentKey: agent.getName({
      port: port,
      host: host,
    }),
  };
  const socket = agent.createConnection(port, host, options);
  checkRequest(socket, server);
});

// use port and host and option does not have agentKey
server.listen(0, () => {
  const port = server.address().port;
  const host = 'localhost';
  const options = {
    rejectUnauthorized: false,
  };
  const socket = agent.createConnection(port, host, options);
  checkRequest(socket, server);
});

// options is null
server.listen(0, () => {
  const port = server.address().port;
  const host = 'localhost';
  const options = null;
  const socket = agent.createConnection(port, host, options);
  socket.on('error', common.mustCall((e) => { 
    assert(expectCertError.test(e.toString()));
  }));
});

// options is undefined
server.listen(0, () => {
  const port = server.address().port;
  const host = 'localhost';
  const options = undefined;
  const socket = agent.createConnection(port, host, options);
  socket.on('error', common.mustCall((e) => { 
    assert(expectCertError.test(e.toString()));
  }));
});
