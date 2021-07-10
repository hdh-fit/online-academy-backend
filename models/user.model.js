const db = require('../utils/database');
const bcrypt = require('bcryptjs');

module.exports = {
    getall() {
        return db('user');
    },

    async getUserById(id) {
        const user = await db('users').where('id', id);
        if (user.length == 0) return null;

        return user[0];
    },

    async getUserByName(username) {
        const user = await db('users').where('username', username);
        if (user.length == 0) return null;

        return user[0];
    },

    async registerUser(user) {
        user.password = bcrypt.hashSync(user.password, 10);
        const newuser = await adduser(user);
        user.user_id = newuser[0];
        delete user.password;
        return user;
    },

    async validPassword(user, password) {
        if (!bcrypt.compareSync(password, user.password)){
            return false;
        }

        return true;
    }

};

function adduser(user) {
    return db('users').insert(user);
}