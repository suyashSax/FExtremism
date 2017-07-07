const express = require('express')
const bodyParser = require('body-parser')
const extractor = require('unfluff');
const _ = require('lodash')
const fetch = require('node-fetch');
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');



var app = express()
const port = 3000

// var tone_analyzer = new ToneAnalyzerV3({
//   username: 'vigneshg@outlook.com',
//   password: '',
//   version_date: '2016-05-19'
// });

app.use(bodyParser.json())
var data
var html
app.post('/url', (req, res) => {

    var url = req.body.url

    fetch(url)
        .then(function(res) {
            return res.text()
        }).then(function(body) {
            data = extractor(body, 'en');
            res.status(200).send(data.text)
    });

    //     res.send(doc)
    //     console.log("Sent Response")
    // }, (e) => {
    //     res.status(400).send(e)
    // })
})

app.listen(port, () => {
    console.log(`Started on port ${port}`)
})

module.exports = {app}
