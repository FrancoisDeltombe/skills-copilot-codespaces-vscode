// Create web server
// 1. create a web server
// 2. define routes
// 3. start server

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const comments = require('./comments');

// 1. create a web server
const server = http.createServer((req, res) => {
    // 2. define routes
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (req.method === 'GET') {
        if (pathname === '/comments') {
            comments.getAllComments((err, allComments) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                    return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(allComments));
            });
        } else {
            const filePath = path.join(__dirname, 'public', pathname);
            fs.readFile(filePath, 'utf8', (err, file) => {
                if (err) {
                    res.statusCode = 404;
                    res.end('Not Found');
                    return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(file);
            });
        }
    } else if (req.method === 'POST') {
        if (pathname === '/comments') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });

            req.on('end', () => {
                const newComment = JSON.parse(body);
                comments.addComment(newComment, (err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                        return;
                    }

                    res.statusCode = 201;
                    res.end('Created');
                });
            });
        }
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

// 3. start server
server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});