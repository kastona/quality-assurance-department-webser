const express = require('express')
const fs = require("fs");
const path = require("path");
const util = require('./util');
const multer = require('multer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4000


let cors = require('cors')

app.use(cors())

const endpoint = process.env.END_POINT;
const apiKey = process.env.KEY;
const postUrl = `${endpoint}/formrecognizer/v2.1-preview.2/layout/analyze`

const { FormRecognizerClient, FormTrainingClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));

const fileName = path.join(__dirname, './file.jpg');

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




app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})