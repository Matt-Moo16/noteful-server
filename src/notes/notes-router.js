const express = require('express')
const NotesService = require('./notes-service')
const xss = require('xss')
const path = require('path')

const notesRouter = express.Router()
const bodyParser = express.json()

const serializeNotes = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderId: note.folder_id,
    content: xss(note.content),
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
        .then(notes => {
            res.json(notes.map(serializeNotes))
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const {name, folderId, content} = req.body
        const folder_id = parseInt(folderId)
        const newNote = {name, folder_id, content}
        

        for (const [key, value] of Object.entries(newNote))
            if (value === null)
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${note.id}`))
                .json(serializeNotes(note))
            })
            .catch(next)
    })

notesRouter
    .route('/:notes_id')
    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.notes_id
        )
            .then(note => {
                if(!note) {
                    return res.status(404).json({
                        error: {message: `Note doesn't exist`}
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(serializeNotes(res.note))
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.notes_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

    module.exports = notesRouter