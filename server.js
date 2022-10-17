const express = require('express');

const server = express();

server.listen(3000, () => {
    console.log('start! express server on port 3000');
});
