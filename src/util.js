const https = require('https');
const axios = require('axios');
const ExcelJS = require('exceljs');
const sleep = require('util').promisify(setTimeout);
const bufferToArrayBuffer = require('buffer-to-arraybuffer');
 

const fs = require("fs");
const path = require("path");


module.exports = {
    async recognizeContent(client, filePath) {


        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('My Sheet');

        try {
    
    
            const fileStream = fs.createReadStream(filePath)
            const poller = await client.beginRecognizeContent(fileStream);
            const pages = await poller.pollUntilDone();
        
            if (!pages || pages.length === 0) {
                throw new Error("Expecting non-empty list of pages!");
            }
        
            for (const page of pages) {
                console.log(
                    `Page ${page.pageNumber}: width ${page.width} and height ${page.height} with unit ${page.unit}`
                );
                let tableStart = 0;
                for (const table of page.tables) {
                    let rowCount = table.rowCount
                    let columnCount = table.columnCount
                    for (const cell of table.cells) {

                        console.log((`${String.fromCharCode(65 + cell.columnIndex)}`+(cell.rowIndex + tableStart)))
                        const excelCell = worksheet.getCell(`${String.fromCharCode(65 + cell.columnIndex)}`+(cell.rowIndex+1));

                        excelCell.value = cell.text
                        //console.log(`cell [${cell.rowIndex},${cell.columnIndex}] has text ${cell.text}`);
                    }

                    tableStart += rowCount + 2
                    
                }
            }

            
            // write to a new buffer
            const buffer = await workbook.xlsx.writeBuffer();


            return buffer
      
        }catch(error) {
            throw new Error('something happened')
        }

    },

    async textractText(computerVisionClient, file) {
        
        //const fileStream = await fs.createReadStream(filePath)

        const arrayBuffer = bufferToArrayBuffer(file.buffer);
        const printedResult = await this.readTextFromURL(computerVisionClient, arrayBuffer);
        return this.printRecText(printedResult);


    },


    async readTextFromURL(client, fileStream) {

        const STATUS_SUCCEEDED = "succeeded";

        

        // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
        let result = await client.readInStream(fileStream);
        // Operation ID is last path segment of operationLocation (a URL)
        let operation = result.operationLocation.split('/').slice(-1)[0];
      
        // Wait for read recognition to complete
        // result.status is initially undefined, since it's the result of read
        while (result.status !== STATUS_SUCCEEDED) { await sleep(1000); result = await client.getReadResult(operation); }
        return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
      },

      printRecText(readResults) {
        let foundPages = []
        console.log('Recognized text:');
        for (const page in readResults) {
          let text = ''
          if (readResults.length > 1) {
            console.log(`==== Page: ${page}`);
          }
          const result = readResults[page];
          if (result.lines.length) {
            for (const line of result.lines) {
              
              text +=(line.words.map(w => w.text).join(' ')) + '\n';
            }
          }
          else { console.log('No recognized text.'); }

          foundPages.push(text)
        }

        return foundPages;
      }
};