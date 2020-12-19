const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('noteful_folders')
    },
    getById(knex, id) {
        return knex
        .from('noteful_folders')
        .select('*')
        .where('id', id)
        .first()
    },
    insertFolders(knex, newFolder) {
        return knex
        .insert(newFolder)
        .into('noteful_folders')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },
    deleteFolders(knex, id) {
        return knex('noteful_folders')
        .where({id})
        .delete()
    },
    updateFolders(knex, id, newFolderFields) {
        return knex('noteful_folders')
        .where({id})
        .update(newFolderFields)
    },
}

module.exports = FoldersService