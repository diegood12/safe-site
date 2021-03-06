const db = require('./clients/database');

/**
 * @typedef {Object} User
 * @property {Number} id
 * @property {String} username
 * @property {String} password
 */

/**
 * @param {String | Number} name_or_id
 * @return {Promise <User>}
 */
function findUser(name_or_id) {
    return new Promise (async (resolve, reject) => {
        try{
            if (typeof name_or_id === 'string') {
                let username = name_or_id;
                let rows = (await db.query(
                    'SELECT * FROM users WHERE username = $1',
                    [username]
                )).rows;
                resolve(rows.length ? rows[0] : null);
            }
            else if (Number.isInteger(name_or_id)) {
                let id = name_or_id;
                let rows = (await db.query(
                    'SELECT * FROM users WHERE id = $1',
                    [id]
                )).rows;
                resolve(rows.length ? rows[0] : null);
            }
            else resolve(null);
        }
        catch (err){
            reject(err);
        }
    });
}

/**
 * @param {String} username
 * @param {String} password
 * @return {Promise <User>} Inserted user
 */
function addUser (username, password, email){
    return new Promise (async (resolve, reject) => {
        let client = await db.connect();
        try {
            let rows = (await client.query(
                'SELECT id FROM users WHERE username=$1',
                [username]
            )).rows;

            if (rows.length) resolve(null);
            else {
                rows = (await client.query(
                    `INSERT INTO users (username, password, email)
                    VALUES ($1, $2, $3) RETURNING *
                `,
                [username, password, email]
            )).rows;

                if (!rows.length) throw Error(`Couldn't insert ${username} on DB`);
                else resolve(rows[0]);
            }
        }
        catch (err){
            reject(err);
        }
        finally {
            client.release();
        }
    });
}

/**
 * @name userController
 */
module.exports = {
    findUser, addUser
};
