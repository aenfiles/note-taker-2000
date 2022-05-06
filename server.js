//Dependencies
const fs = require('fs');
const path = require('path');
const express = require('express');

//For generating unique IDs for each note
const uuid = require('./helpers/uuid');

//Set Port # to be defined or default to 3001 and Configure Express to be called with const app 
const PORT = process.env.PORT || 3001;
const app = express();

//Get all notes from json file db.json (I never actually ended up using this because of weird errors I got)
const notesDB = require('./db/db.json')

//Middleware (Used before and after requests)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Static Files Middleware (Contains All the front end assets, CSS/HTML/JS)
app.use(express.static('public'));


//Notes Get API Route
app.get('/api/notes', (req, res) => {
res.sendFile(path.join(__dirname, './db/db.json'), (err) => {
    if(err) throw err;
});
});

//Get a Single Note API route
app.get('/api/notes/:note_id', (req, res) => {
if (req.body && req.params.note_id) {
  console.info(`${req.method} request received to get a single a note`);
  const noteId = req.params.note_id;
  for (let i = 0; i < notes.length; i++) {
    const currentNote = notes[i];
    if (currentNote.note_id === noteId) {
      res.json(currentNote);
      return;
    }
  }
  res.json('Note ID not found');
}
});

//"DELETE" note request *API
app.delete('/api/notes/:id', (req, res) => {
// Reads data from db.json
fs.readFile(path.join(__dirname, './db/db.json'), (err, data) => {
    // Errors
    if(err) throw err;

    // Sets notes to reference objectified JSON compiled from the data read from db.json (Essentially data is now[{KEY:'VALUE'}])
    let notes = JSON.parse(data);

    // Use findIndex method to figure out where data is in db.json file
    let noteIndex = notes.findIndex(note => note.note_id === req.params.id);

    // Delete that note from notes array holding db.json data
    notes.splice(noteIndex,1);

    // Overwrite file w/ new JSON in notes array
    fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(notes), (err) => {
        if(err) throw err;
        console.info(`File updated: deleted note ID ${req.params.id}`);
    });
});

res.sendFile(path.join(__dirname, './db/db.json'));
});
// New Note Post API Route
app.post('/api/notes', (req, res) => {
    console.log("Post Request Received")
    const {title, text} = req.body;
    
        const newNote = {
            title,
            text,
            note_id:uuid(),
        };
        
        //Read the existing db.json file, throw an error if unable to do so
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
            console.error(err);
            } else {
            // Convert string into JSON object ( data = [{KEY:'VALUE'}]) )
            const parsedNotes = JSON.parse(data);
    
            // Add a new note to the parsedNotes array of objects
            parsedNotes.push(newNote);
    
            // Write updated notes back to the file (Converts JS value into JSON)
            fs.writeFile(
                './db/db.json',
                JSON.stringify(parsedNotes, null, 4),
                (writeErr) =>
                writeErr
                    ? console.error(writeErr)
                    : console.info(`File updated: note ID ${newNote.id}`)
            );
            }
        });
        const response = {
            status:'success',
            body: newNote,
        }
        console.log(response);

        // const noteString = JSON.stringify(response); -Relic from another attempt

        res.sendFile(path.join(__dirname, './db/db.json'));
    });

//Index HTML Get Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//Notes HTML Get Route
app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

//App Listening Log
app.listen(PORT, () => {
    console.log(`APP listening on ${PORT}!`);
});