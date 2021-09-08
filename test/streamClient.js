var axios = require('axios')
var { bgRedBright, black, cyanBright } = require('chalk')

var fileAddress = process.argv[2] || "http://api.localhost/api/v1/file/general/film.mp4?start=85010&end=122509";

axios({
  method: 'get',
  url: fileAddress,
  responseType: 'stream'
})
  .then(function (response) {

    var r = response.data;
    var download_progress = 0;
    var isStarted = false;

    r.on("data", function (chunk) {
      if ( !isStarted ) console.log(bgRedBright(black('        Start        ')));
      download_progress += chunk.length
      isStarted = true
      console.log('[data]', chunk)
      console.log(cyanBright('[byte]'),  download_progress);
    })

    r.on("end", function (res) {
      console.log(bgRedBright(black('       Finished       ')));
      console.log('Total recived byte :',  download_progress);
    })

  });
