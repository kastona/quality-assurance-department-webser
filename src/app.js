const express = require('express')
const fs = require("fs");
const path = require("path");

const multer = require('multer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4000




















app.use(express.json())

let cors = require('cors')
app.use(cors({origin: '*'}));

const util = require('./util');

const endpoint = process.env.END_POINT;
const apiKey = process.env.KEY;
const readEndpoint = process.env.READ_END_POINT;
const readAPIKey = process.env.READ_API_KEY


const { FormRecognizerClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const ComputerVisionClient = require('@azure/cognitiveservices-computervision').ComputerVisionClient;
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials;
const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': readAPIKey } }), readEndpoint);


const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));


const upload = multer({
    limits: {
        fileSize: 3000000
    },
    fileFilter(req, file, cb) {
        console.log("i am called!")
        if(!file.originalname.match(/\.(jpeg|jpg|png|pdf)/)) {
            return cb(new Error('Please upload an image'))
        }

        
        cb(undefined, true)
    },

    storage: multer.diskStorage({
        destination: 'temp',
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
})




const myUpload = multer({
    limits: {
        fileSize: 3000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|jpg|png|pdf)/)) {
            return cb(new Error('Please upload an image'))
        }

        
        cb(undefined, true)
    },

    storage: multer.memoryStorage()

})


app.post('/files', upload.single('file'), async (req, res) => {

    try {

        let filename = req.body.filename? req.body.filename: 'converted file'
        
        const buffer = await util.recognizeContent(client, req.file.path)
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.set('Content-Disposition', `attachement;filename=${filename}.xlsx`)
        return res.send(buffer)
    }catch(error) {
        return res.send('error')
    }
    
})


app.post('/read', myUpload.single('file'), async (req, res) => {





    let filename = req.body.filename? req.body.filename: 'converted file'

    const result = await util.textractText(computerVisionClient, req.file);
    let buffer = Buffer.from(result[0])

    res.set('Content-Type', 'text/plain')
    res.set('Content-Disposition', `attachement;filename=${filename}.txt`)


    res.send(buffer)
})





app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})