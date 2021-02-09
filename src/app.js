const express = require('express')
const fs = require("fs");
const path = require("path");
const util = require('./util');
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000


const endpoint = process.env.END_POINT;
const apiKey = process.env.KEY;
const postUrl = `${endpoint}/formrecognizer/v2.1-preview.2/layout/analyze`

const { FormRecognizerClient, FormTrainingClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));

const fileName = path.join(__dirname, './file.jpg');



app.get('', async (req, res) => {

    await util.recognizeContent(client)
    return res.send({title: 'Weather', description: 'This is the main page of the app', name: 'Steve'})
})



app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})