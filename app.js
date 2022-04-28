const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');

const server = http.createServer(function (req, res) {
    var parseUrl = url.parse(req.url, true);
    // //get the path
    var path = parseUrl.pathname;
    var trimPath = path.replace(/^\/+|\/+$/g, '');

    var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
    chosenHandler(req, res);
});

server.listen(8080, function () {
    console.log('server running at localhost:8080 ')
});

var handlers = {};

handlers.login = function (rep, res) {
    fs.readFile('./views/login.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};
// products notfound


handlers.notfound = function (rep, res) {
    fs.readFile('./views/notfound.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};
// handlers.users page

handlers.home = function (req, res) {
// xu ly submit
    var data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        data = qs.parse(data);
        let expires = Date.now() + 1000*60*60;
        let tokenSession = "{\"name\":\""+data.name+"\",\"email\":\""+data.email+"\",\"password\":\""+data.password+"\",\"expires\":"+expires+"}";
        createTokenSession(tokenSession);
        fs.readFile('./views/homepage.html', 'utf8', function (err, datahtml) {
            if (err) {
                console.log(err);
            }
            datahtml = datahtml.replace('{name}', data.name);
            datahtml = datahtml.replace('{email}', data.email);
            datahtml = datahtml.replace('{password}', data.password);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(datahtml);
            return res.end();
        });
    })
    req.on('error', () => {
        console.log('error')
    })

};

// products page
var router = {
    'login': handlers.login,
    'home': handlers.home,
    'notfound': handlers.notfound
}

var createTokenSession = function (data){
    //tao ngau nhien ten file
    let tokenId = createRandomString(20);
    let fileName = './token/' + tokenId;
    fs.writeFile(fileName, data, err => {
    });
}

var createRandomString = function (strLength){
    strLength = typeof(strLength) == 'number' & strLength >0 ? strLength:false;
    if (strLength){
        var possibleCharacter = 'abcdefghiklmnopqwerszx1234567890';
        var str='';
        for (let i = 0; i <strLength ; i++) {
            let ramdomCharater = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length));
            str+=ramdomCharater;
        }
        return str;
    }
}



