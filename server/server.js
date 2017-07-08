const express = require('express')
const bodyParser = require('body-parser')
const extractor = require('unfluff');
const _ = require('lodash')
const fetch = require('node-fetch');
const sw = require('stopword')
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3')
var scrape = require('website-scraper');
const fs = require('fs');
const download = require('download');
const sizeOf = require('image-size');
var validSources = require('./sources.json')

var app = express()
const port = process.env.PORT || 3000

var tone_analyzer = new ToneAnalyzerV3({
    username: "229ab9be-387c-4cab-a4dd-5cd3716f3683",
    password: "OtikuhbzNXkv",
    version_date: '2017-07-06'
});

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

var visual_recognition = new VisualRecognitionV3({
  api_key: '575a6e4e5aba5732305b869eb77d5d698150c8a7',
  version_date: '2017-07-06',
});

src = `Allah (ta’ala) fortresses protect terror hearts destroyed their houses by their own hands believers. So take warning vision.blessed battle soldiers of the Caliphate (may Allah strengthen and support it) targeting the capital of prostitution and vice the cross in Europe — Paris. youth divorced the worldly life enemy hoping to be killed for Allah’s sakeHis enemies. truthful Allah victory cast terror hearts crusaders homeland.explosive belts assault rifles attacked targets crusader imbecile prostitution and vice crusaders detonated explosive belts disbelievers ammunition. martyrs curse Prophet (blessings and peace be upon him), war against Islam Caliphate. Allah is the greatest.“The executor attack Islamic State fighter”perpetrator attacks parliament Islamic State soldier operation response citizens coalition, Islamic State fighters attack armed attack targeted gay night club Orlando America people dead or injured Islamic State fighterParis, Manila, London, Syria Amaq Aamaq Amaaq al-Nabaa Syria Levant Iraq Isis-linked Aamaq attack “heroic soldier of the caliphate” attacked nightclub Christians celebratinginfidel Turkey blood Muslims airstrikes artillery shelling fire territoriessecular non-Islamic youth fall into the trap enemy convert their religionslove their behaviors, religion and history and hide the history of Islam. terror terrorism holy war jihad suicide bomb infidel `

function eq(a, b){
    var l = (a < b) ? a.length : b.length
    var l2 = (a > b) ? a.length : b.length
    var threshold = 0.8 * l2 > l2 - 3 ? 0.8 * l2 : l2 - 3
    var count = 0

    for(var i = 0; i < l; i++){
        if(a[i] === b[i]){
            count++
        }
    }

    if (count >= threshold){
        console.log(a, b)
        return true
    }
    return false
}

function matcher(a, b){
    var matches = 0
    for (var s of a)
    {
        for (var t of b)
        {
            if (eq(s,t)){
                matches++
                console.log(`${s}, ${t}`)
            }
        }
    }
    return matches
}

function analyseScores(scores){
    fear_factor = scores.fear >= 0.50;
    disgust_factor = scores.disgust >= 0.50;
    anger_factor = scores.anger >= 0.50;

    sum = fear_factor + disgust_factor + anger_factor;

    var max = Math.max(fear_factor, disgust_factor, anger_factor);


    if (max >= 0.5){
        tone_certainty = max
    }
    else
    {
        tone_certainty = sum / 3
    }

    return {tone_certainty:tone_certainty, keyword_certainty:inputMatchSrc}
}

templates = {
    src_notok:"<p id='src-notok' class='label label-danger'> The sources are unreliable </p>",
    src_ok:"<p id='src-ok' class='label label-success'> The sources are reliable </p>",
    tone_notok: "<p id='tone-notok' class='label label-danger'> The tone of the article is aggressive </p>",
    tone_ok: "<p id='tone-ok' class='label label-success'> The tone of the article is not aggressive </p>",
    img_notok:"<p id='img-notok' class='label label-danger'> The images may be graphic </p>",
    img_ok:"<p id='img-ok' class='label label-success'> The images are not graphic </p>",
    txt_notok:"<p id='txt-notok' class='label label-danger'> May contain propoganda </p>",
    txt_ok:"<p id='txt-ok' class='label label-success'> Does not contain propoganda </p>"
}

function prepareResponse(certainty){
    var response = '';
    if (certainty.tone_certainty >= 0.50){
        response += templates.tone_notok;
    }
    else{
        response += templates.tone_ok;
    }
    if (certainty.keyword_certainty >= 0.50){
        response += templates.txt_notok;
    }
    else{
        response += templates.txt_ok;
    }

    if(certainty.authentic){
        response += templates.src_ok
    }
    else{
        response += templates.src_notok
    }
    return response;
}

function isValid(url){
    var trace = 0
    var i = 0
    var start, end
    for (var letter of url){
        if (letter === '/'){
            i++
            if (i == 2){
                start = trace
            }
            if (i == 3){
                end = trace
            }
        }
        trace++
    }
    var parsedUrl = url.substr(start+1, end)
    parsedUrl = parsedUrl.split('/')[0]
    console.log("parsed", parsedUrl)
    var short = parsedUrl.substr(4)
    console.log("short", short)
    if(validSources.hasOwnProperty(parsedUrl) || validSources.hasOwnProperty(short)){
        return false
    }
    else{
        return true
    }
}

src = src.toLowerCase()
var srcTokens = src.split(" ")
var parsedSrc = sw.removeStopwords(srcTokens)

app.use(bodyParser.json())
var data
var html
var inputMatchSrc, srcTokensHit, fear, disgust, tone, anger, emotionalRange, authentic

app.post('/', (req, res) => {
    var url = req.body.url
    fetch(url)
        .then(function(res) {
            return res.text()
        }).then(function(body) {
            data = extractor(body, 'en');
            authentic = isValid(url)
            // scrape({
            //     urls: [url],
            //     directory: './server/img',
            //     sources: [
            //         {selector: 'img', attr: 'src'}
            //     ]
            // }).then(function (){
            //     // var dimensions = sizeOf('images/*.jpg');
            //     //     console.log(dimensions.width, dimensions.height);
            // //     var params = {
            // //         images_file: fs.createReadStream('./server/images'),
            // //         classifier_ids: ['Terrorism2_1310302581'],
            // //         owners: ["me"],
            // //         threshold: 0.0
            // //     }
            // //
            // // visual_recognition.classify(params, function(err, res) {
            // //     if (err)
            // //         console.log(err)
            // //     else
            // //     {
            // //         // var is = res.images[0].classifiers[0].classes[0].score
            // //         // var nazi = res.images[0].classifiers[0].classes[1].score
            // //         // var violence = res.images[0].classifiers[0].classes[2].score
            // //         // imageClass = {
            // //         //     is, nazi, violence
            // //         // }
            // //         // console.log(imageClass)
            // //     }})
            // }).catch(console.log)
            var input = data.text
            var inputTokens = input.split(" ")
            var parsedInput = sw.removeStopwords(inputTokens)

            var result = matcher(parsedSrc, inputTokens)

            console.log("Total Sim", result);

            inputMatchSrc = result/(parsedSrc.length)
            srcTokensHit = result/(inputTokens.length)

            tone_analyzer.tone({ text: input },
            function(err, tone) {
                if (err)
                    console.log(err)
                else {
                    fear = tone.document_tone.tone_categories[0].tones[2].score
                    disgust = tone.document_tone.tone_categories[0].tones[1].score
                    anger = tone.document_tone.tone_categories[0].tones[0].score
                    emotionalRange = tone.document_tone.tone_categories[2].tones[4].score
                    console.log('Fear', fear)
                    console.log('Disgust', disgust)
                    console.log('Anger', anger)
                    console.log('Emotion', emotionalRange)

                    res.header('Access-Control-Allow-Origin', "*");
                    cert = analyseScores({inputMatchSrc, srcTokensHit, fear, disgust, anger, emotionalRange, authentic});
                    res.status(200).send(prepareResponse(cert))
                }
            })
            console.log("Done...")
    })})

app.listen(port, () => {
    console.log(`Started on port ${port}`)
})

module.exports = {app}
