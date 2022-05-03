const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const localStorage = require('local-storage');


const server = http.createServer(function (req, res) {
       readSession(req, res);
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
            let tokenId = createRandomString(20);
            createTokenSession(tokenId, tokenSession);
            localStorage.set('token', tokenId);
            console.log("chua dang nhap");
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

handlers.dashboard = function (req, res){
    fs.readFile('./views/dashboard.html', 'utf8', function (err, datahtml) {
        if (err) {
            console.log(err);
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(datahtml);
        return res.end();
    });
}
// products page
var router = {
    'login': handlers.login,
    'home': handlers.home,
    'notfound': handlers.notfound,
    'dashboard': handlers.dashboard
}

var createTokenSession = function (fileName, data){
    //tao ngau nhien ten file

    fileName = './token/' + fileName;
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
//lấy dữ liệu từ local storage, đọc dữ liệu từ session
//true -> chua het han
//false -> da het han
var readSession = function(req, res){
    var tokenID = localStorage.get("token");
    if (tokenID){
        var sessionString= "";
        let expires=0;
        fs.readFile('./token/'+tokenID, 'utf8' , (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            sessionString = String(data);
            expires = JSON.parse(sessionString).expires;
            var now = Date.now();
            if (now> expires){
                console.log("Da dang nhap nhung het han");
                console.log("vao cac trang theo kich ban")
                var parseUrl = url.parse(req.url, true);
                // //get the path
                var path = parseUrl.pathname;
                var trimPath = path.replace(/^\/+|\/+$/g, '');
                var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
                chosenHandler(req, res);
            }
            else {
                console.log("Da dang nhap va chua het han");
                console.log("vao chao hoi luon")
                fs.readFile('./views/dashboard.html', 'utf8', function (err, datahtml) {
                    if (err) {
                        console.log(err);
                    }
                    datahtml = datahtml.replace('{name}', JSON.parse(sessionString).name);
                    datahtml = datahtml.replace('{email}', JSON.parse(sessionString).email);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(datahtml);
                    return res.end();
                });
            }
        });
    }
    else {
        console.log("Chua dang nhap")
        console.log("vao cac trang theo kich ban")
        var parseUrl = url.parse(req.url, true);
        // //get the path
        var path = parseUrl.pathname;
        var trimPath = path.replace(/^\/+|\/+$/g, '');
        var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
        chosenHandler(req, res);
    }
}





