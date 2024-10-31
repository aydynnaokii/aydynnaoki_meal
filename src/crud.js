const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

var btnCreate = document.getElementById('btnCreate');
var btnRead = document.getElementById('btnRead');
var btnUpdate = document.getElementById('btnUpdate'); // New update button
var btnDelete = document.getElementById('btnDelete');
var fileName = document.getElementById('fileName');
var fileContents = document.getElementById('fileContents');

let pathName = path.join(__dirname, 'Files');

// Ensure the Files directory exists
if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName);
}

// Create a new file
btnCreate.addEventListener('click', function() { 
    let file = path.join(pathName, fileName.value);
    let contents = fileContents.value;
    
    fs.writeFile(file, contents, function(err) { 
        if (err) {
            return console.log(err);
        }
        
        alert(fileName.value + " text file was created");
        console.log("The file was created");
    });
});

// Read the contents of a file
btnRead.addEventListener('click', function() {
    let file = path.join(pathName, fileName.value);

    fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }

        fileContents.value = data;
        console.log("The file was read!");
    });
});

// Update an existing file
btnUpdate.addEventListener('click', function() {
    let file = path.join(pathName, fileName.value);
    let newContents = fileContents.value;

    fs.writeFile(file, newContents, function(err) {
        if (err) {
            return console.log(err);
        }

        alert(fileName.value + " has been updated.");
        console.log("The file was updated!");
    });
});

// Delete a file
btnDelete.addEventListener('click', function() {
    let file = path.join(pathName, fileName.value);

    fs.unlink(file, function(err) {
        if (err) {
            return console.log(err);
        }

        fileName.value = "";
        fileContents.value = "";
        console.log("The file was deleted!");
    });
});
