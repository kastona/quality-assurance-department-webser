const https = require('https');
const axios = require('axios');
const ExcelJS = require('exceljs');

const fs = require("fs");
const path = require("path");


module.exports = {
    async recognizeContent(client) {


        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('My Sheet');

        try {

            const fileName = path.join(__dirname, "../Test.png");


            if (!fs.existsSync(fileName)) {
                throw new Error(`Expecting file ${fileName} exists`);
            }
    
            const readStream = fs.createReadStream(fileName);
    
    
    
            const formUrl = "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/simple-invoice.png";
            const poller = await client.beginRecognizeContent(readStream);
            const pages = await poller.pollUntilDone();
        
            if (!pages || pages.length === 0) {
                throw new Error("Expecting non-empty list of pages!");
            }
        
            for (const page of pages) {
                console.log(
                    `Page ${page.pageNumber}: width ${page.width} and height ${page.height} with unit ${page.unit}`
                );
                for (const table of page.tables) {
                    let rowCount = table.rowCount
                    let columnCount = table.columnCount
                    for (const cell of table.cells) {

                        console.log((`${String.fromCharCode(65 + cell.columnIndex)}`+(cell.rowIndex)))
                        const excelCell = worksheet.getCell(`${String.fromCharCode(65 + cell.columnIndex)}`+(cell.rowIndex+1));

                        excelCell.value = cell.text
                        //console.log(`cell [${cell.rowIndex},${cell.columnIndex}] has text ${cell.text}`);
                    }

                    console.log(worksheet.getCell('A1').value)
                    
                }
            }


            const newFile = path.join(__dirname, "../test.xlsx");
            
// write to a new buffer
const buffer = await workbook.xlsx.writeBuffer();

fs.writeFile(newFile, buffer, function (err) {
    if (err) return console.log(err);
    console.log('Hello World > helloworld.txt');
  });
      
        }catch(error) {
            console.log(error.message)
        }

    }
};