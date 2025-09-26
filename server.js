const http = require('http');
const app = require('./app');   // ✅ relative path sahi
const port = 2300;              // ✅ same port use karo

const server = http.createServer(app);

server.listen(port, () => {
    console.log('✅ App is running on port ' + port);
});
