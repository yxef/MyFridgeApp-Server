const http = require('http');

const server = http.createServer((req, res)=> {
    if(req.url === '/'){
        res.write('poggers hello');
        res.end();
        console.log("connection terminated copypasta but its connection started instead of terminated");
    }

    if(req.url === '/pog'){
        res.write("no way");
        res.end();
    }
});

server.listen(3000);

console.log("Listening on port 3000");