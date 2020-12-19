const express = require('express')
const xss = require('xss')
const { response } = require('../app')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const bodyParser = express.json()

const serializeFolders = folder => ({
    id: folder.id,
    name: xss(folder.name)
}) 

foldersRouter 
    .route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(req.app.get('db'))
        .then(folders => {
            res.json(folders.map(serializeFolders))
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const {name} = req.body
        const newFolder = {name}

        for(const [key, value] of Object.entries(newFolder))
        if (value === null) 
        return res.status(400).json({
            error: {message: `Missing '${key}' in request body`}
        })
        FoldersService.insertFolders(
            req.app.get('db'),
            newFolder
        )
        .then(folder => {
            res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${folder.id}`))
            .json(serializeFolders(folder))
        })
        .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folder_id
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: {message: `Folder doesn't exist`}
                    })
                }
                res.folder = folder 
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolders(res.folder))
    })
    .delete((req, res, next) => {
        FoldersService.deleteFolders(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    module.exports = foldersRouter