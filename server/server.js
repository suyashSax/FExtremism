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

var app = express()
const port = 3000

var tone_analyzer = new ToneAnalyzerV3({
    username: "229ab9be-387c-4cab-a4dd-5cd3716f3683",
    password: "OtikuhbzNXkv",
    version_date: '2017-07-06'
});

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

var visual_recognition = new VisualRecognitionV3({
  api_key: '575a6e4e5aba5732305b869eb77d5d698150c8a7',
  version_date: '2017-07-06'
});

// download('http://gulfnews.com/news/gulf/qatar/qatar-defiance-shows-its-support-to-terror-1.2054764').then(data => {
//     fs.writeFileSync('dist/foo.jpg', data);
// });

// var params = {
//   images_file: fs.createReadStream('./server/car.jpg')
// };
//
// visual_recognition.classify(params, function(err, res) {
//   if (err)
//     console.log(err);
//   else
//     console.log(JSON.stringify(res, null, 2));
// });

var src = `Allah (ta’ala) said, They thought that their fortresses would protect them from Allah but Allah came upon them from where they had not expected, and He cast terror into their hearts so they destroyed their houses by their own hands and the hands of the believers. So take warning, O people of vision. In a blessed battle whose causes of success were enabled by Allah, a group of believers from the soldiers of the Caliphate (may Allah strengthen and support it) set out targeting the capital of prostitution and vice, the lead carrier of the cross in Europe — Paris. This group of believers were youth who divorced the worldly life and advanced towards their enemy hoping to be killed for Allah’s sake, doing so in support of His religion, His Prophet (blessing and peace be upon him), and His allies. They did so in spite of His enemies. Thus, they were truthful with Allah — we consider them so — and Allah granted victory upon their hands and cast terror into the hearts of the crusaders in their very own homeland. And so eight brothers equipped with explosive belts and assault rifles attacked precisely chosen targets in the center of the capital of France. These targets included the Stade de France stadium during a soccer match — between the teams of Germany and France, both of which are crusader nations — attended by the imbecile of France (Francois Hollande). The targets included the Bataclan theatre for exhibitions, where hundreds of pagans gathered for a concert of prostitution and vice. There were also simultaneous attacks on other targets in the tenth, eleventh, and eighteenth districts, and elsewhere. Paris was thereby shaken beneath the crusaders’ feet, who were constricted by its streets. The result of the attacks was the deaths of no less than two hundred crusaders and the wounding of even more. All praise, grace, and favor belong to Allah. Allah blessed our brothers and granted them what they desired. They detonated their explosive belts in the masses of the disbelievers after finishing all their ammunition. We ask Allah to accept them amongst the martyrs and to allow us to follow them. Let France and all nations following its path know that they will continue to be at the top of the target list for the Islamic State and that the scent of death will not leave their nostrils as long as they partake in the crusader campaign, as long as they dare to curse our Prophet (blessings and peace be upon him), and as long as they boast about their war against Islam in France and their strikes against Muslims in the lands of the Caliphate with their jets, which were of no avail to them in the filthy streets and alleys of Paris. Indeed, this is just the beginning. It is also a warning for any who wish to take heed. Allah is the greatest. (And to Allah belongs all honor, and to His Messenger, and to the believers, but the hypocrites do not know). With the will of God, with the support of our people, with all our national capacity, we will bring them to their knees and give them all the necessary response. “The executor of the attack on the Indonesian police gathering in Jakarta was an Islamic State fighter” "The perpetrator of the attacks yesterday in front of the British parliament in London is an Islamic State soldier and he carried out the operation in response to calls to target citizens of the coalition," "Islamic State fighters carried out the Manila attack in the Philippines," "The armed attack that targeted a gay night club in the city of Orlando in the American state of Florida which left over 100 people dead or injured was carried out by an Islamic State fighter," Amaq Aamaq Amaaq al-Nabaa Syria Levant Iraq The Isis-linked Aamaq news agency said the attack was carried out by a “heroic soldier of the caliphate” who attacked the nightclub “where Christians were celebrating their pagan feast”. “We let infidel Turkey know that the blood of Muslims that is being shed by its airstrikes and artillery shelling will turn into fire on its territories,” the Daesh infidels fuck fuck rape rape statement said. “There are secular and non-Islamic schools and universities in our country, which serve to provide our youth with education that leads them to simply fall into the trap of their enemy and convert to their religions,” Ali Dhere said. “They make you love their behaviors, religion and history and hide the history of Islam.” terror terrorism holy war jihad suicide bomb infidel `


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


src = src.toLowerCase()
var srcTokens = src.split(" ")
var parsedSrc = sw.removeStopwords(srcTokens)

app.use(bodyParser.json())
var data
var html
var inputMatchSrc, srcTokensHit, fear, disgust, tone, anger, emotionalRange
app.post('/', (req, res) => {

    var url = req.body.url


    fetch(url)
        .then(function(res) {
            return res.text()
        }).then(function(body) {
            data = extractor(body, 'en');

            scrape({
                urls: [url],
                directory: './server/img.jpg',
                sources: [
                    {selector: 'img', attr: 'src'}
                ]
            }).then().catch(console.log);

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
                    res.status(200).send({inputMatchSrc, srcTokensHit, fear, disgust, anger, emotionalRange})
                }
            })

            console.log("Done...")
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
