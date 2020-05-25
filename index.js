const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const fs = require('fs');
const multer = require('multer');
const csv = require('fast-csv');

const app = express();

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.post('/upload', async (req, res) => {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            const fileRows = [];
            let userFile = req.files.userFile;

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            userFile.mv('./uploads/' + userFile.name);

            if (userFile.mimetype === 'text/csv') {
                csv.parseFile('./uploads/' + userFile.name)
                    .on("data", function (data) {
                        fileRows.push(data); // push each row
                    })
                    .on("end", function () {
                        console.log(fileRows)
                        //process "fileRows" and respond
                        //send response
                        res.send({
                            status: true,
                            message: 'File is uploaded',
                            data: {
                                name: userFile.name,
                                mimetype: userFile.mimetype,
                                size: userFile.size,
                                data: fileRows
                            }
                        });
                    })
            } else if (userFile.mimetype === 'text/plain') {
                var data = '';
                var readStream = fs.createReadStream('./uploads/' + userFile.name, 'utf8');
                readStream.on('data', function(chunk) {
                    data += chunk;
                }).on('end', function() {
                    console.log(data.split('\n'));

                    res.send({
                        status: true,
                        message: 'File is uploaded',
                        data: {
                            name: userFile.name,
                            mimetype: userFile.mimetype,
                            size: userFile.size,
                            data: data.split('\n')
                        }
                    });
                });
            } else {
                res.send({
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: userFile.name,
                        mimetype: userFile.mimetype,
                        size: userFile.size,
                    }
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

var server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port %d', server.address().port)
})
