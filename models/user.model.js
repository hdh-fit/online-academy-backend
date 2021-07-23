const db = require('../utils/database');
const bcrypt = require('bcryptjs');

module.exports = {
    getall() {
        return db('user');
    },

    async getUserById(id) {
        const user = await db('user').where('id', id);
        if (user.length == 0) return null;

        return user[0];
    },

    async getUserByName(username) {
        const user = await db('user').where('username', username);
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
    },

    updateUser(id, user) {
        return db('user').where('id', id).update(user);
    },

    updatePassword(id, password) {
        hashPass = bcrypt.hashSync(upassword, 10);
        return db('user').where('id', id).update({password: hashPass});
    }
};

function adduser(user) {
    return db('users').insert(user);
}