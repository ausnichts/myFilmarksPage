const http = require('http');
const server = http.createServer();
const client = require('cheerio-httpcli');
const urlParser = require('url');

const filmarksUrl = 'https://filmarks.com/users/';

server.on('request', function(req, res){
    
  if (req.url === '/favicon.ico'){
    res.end();
  }else{
    const user = urlParser.parse(req.url, true).query.user;
    const movie = urlParser.parse(req.url, true).query.movie;
    const myPageUrl = filmarksUrl + encodeURI(user);

    client.fetch(myPageUrl)
      .then((result) => {
        const href = result.$('a.c-pagination__last').attr('href');
        const page = urlParser.parse(href, true).query.page;
        return page;
      })
      .then((page) => {
        let j = 0;
        let url = '';
        for (let i=1; i<=page; i++){
          let targetUrl = myPageUrl + `?page=${i}`;
          client.fetch(targetUrl)
            .then((result) => {
              result.$('h3.c-content-card__title').each(function (idx){
                const title = result.$(this).text();
                if(title.indexOf(movie) !== -1){
                  url = result.$(this).find('a').url();
                  url = url.replace('?mark_id=', '/reviews/');
                }
              });
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              j++;
              if (j === Number(page)){
                if (url === '') url = 'no mark';
                res.setHeader('Access-Control-Allow-Origin', 'https://www.movieimpressions.com'); // クライアントのオリジン
                res.writeHead(200, {'Content-Type' : 'application/plain'});
                res.write(url);
                res.end();
              }
            });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log('done');
      });
  }
});

server.listen(process.env.PORT || 8080);
console.log('Server running at http://localhost:8080/');
