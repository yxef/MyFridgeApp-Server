const { rejects } = require('assert');
const { randomInt } = require('crypto');
const { json } = require('express');
const { resolve } = require('path');

const sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./MyFridge.db');


/**
 * Opens connection to the Database file MyFridge.db
 * Also generates the file if not present
 */
let openDatabase = () => {
    db = new sqlite3.Database("./MyFridge.db", sqlite3.OPEN_READWRITE, (err) => {
        if (err) return console.log(err.message);

        console.log("Connection Successful");
    });
}

/**
 * Closes connection to the database.
 * To be used after completing your operations on it
 */
let closeDatabase = () => {
    db.close((err) => {
        if (err) return console.log(err.message);

        console.log("Connection Terminated");
    });
}

/**
 * Creates the user table
 * It only holds a primary key
 * This primary key is supposed to be a unique installation Id
 */
let createTableUser = () => {
    db.run(
        `CREATE TABLE users(id PRIMARY KEY)`
    );
}

/**
 * Creates the Fridge Table
 * It holds the name of the fridge 
 * and its automatically increasing primary id
 */
let createTableFridge = () => {
    db.run(`CREATE TABLE fridges(
            id INTEGER PRIMARY KEY,
            name NOT NULL
        )`);
}

/**
 * Creates the Access table
 * its purpose is to track who can access which fridge
 * and if they are the owner of said fridge
 */
let createTableAccess = () => {
    db.run(`CREATE TABLE access(
            userId,
            fridgeId,
            isOwner BOOLEAN NOT NULL,
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(fridgeId) REFERENCES fridges(id),
            PRIMARY KEY(userId, fridgeId)
        )`);
}

/**
 * Creates the Food table
 * It holds information about the food such as
 * its Id, name, and expiration date which is held as a string
 * Also it tracks which fridges holds said food
 */
let createTableFoods = () => {
    db.run(`CREATE TABLE foods(
            foodId INTEGER PRIMARY KEY,
            fridgeId NOT NULL,
            foodName TEXT NOT NULL,
            expiration_date TEXT NOT NULL,
            iconId NOT NULL,
            FOREIGN KEY(fridgeId) REFERENCES fridges(id)
        )`);
}


/**
 * Debug Method
 * Takes a SELECT SQL query and it prints each row returned to console
 */
let performAllQuery = (sql) => {
    db.all(sql, [], (err, rows) => {
        if (err) return console.log(err.message);

        console.log(sql);
        rows.forEach((row) => {
            console.log(row);
        });
    });
}

/**
 * Debug method
 * Prints all the tables to the console
 */
let getAllTables = () => {
    let sqlUsers = `SELECT * FROM users`;
    let sqlFridges = `SELECT * FROM fridges`;
    let sqlAccess = `SELECT * FROM access`;
    let sqlFoods = `SELECT * FROM foods`;

    performAllQuery(sqlUsers);
    performAllQuery(sqlFridges);
    performAllQuery(sqlAccess);
    performAllQuery(sqlFoods);
}



/**
 * Debug method
 * Prints to console all Users in table Users
 */
let getAllUsers = () => {
    db.all(`SELECT * FROM users`,
        [],
        (err, rows) => {
            if (err) return console.log(err.message);

            rows.forEach((row) => {
                console.log(row);
            });
        });

}

/**
 * Debug method
 * Prints to console all Fridges in table fridge
 */
let getAllFridges = () => {
    db.all(
        `SELECT * FROM fridges`,
        [],
        (err, rows) => {
            if (err) return console.log(err.message);

            rows.forEach((row) => {
                console.log(row);
            });
        });

}


/**
 * Prints to console a single User with matching Id
 */
let getUser = (id) => {
    db.all(
        `SELECT * FROM users WHERE id = ?`,
        [id],
        (err, rows) => {
            if (err) return console.log(err.message);

            rows.forEach((row) => {
                console.log(row);
            });
        });
}

/**
 * Creates a new User with specific Id
 * We have to pass the Id since its meant to be the App install Id
 */
let addNewUser = (id) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO users (id) VALUES(?)`,
            [id],
            (err) => {
                if (err) return console.log(err.message);
            }
        );
    });
}

/**
 * Creates a new Fridge row
 * It needs a userId, a fridgeName
 * Creates a table row where fridgeName equals the passed fridgeName
 * then it calls addToAccess() method which uses the userId that was passed to
 * this function, the fridgeId of the row we just inserted and the isOwner flag
 * which is always True given that the user created the Fridge
 */
let addNewFridge = (userId, fridgeName) => {
    db.run(
        `INSERT INTO fridges (name) VALUES(?)`,
        [fridgeName],
        function (err) {
            if (err) return console.log(err.message);

            addToAccess(userId, this.lastID, true);
        }
    )
}

/**
 * Creates a new row in Access table
 * It requires a userId and a fridgeId which represents whether the
 * specific user has access to the fridge contents
 * It also requires an isOwner flag to indicate 
 * whether they are the owners or a guest
 */
let addToAccess = (userId, fridgeId, isOwner) => {
    db.run(
        `INSERT INTO access (userId, fridgeId, isOwner) VALUES(?,?,?)`,
        [userId, fridgeId, isOwner],
        function (err) {
            if (err) return console.log(err.message);
        }

    );
}

/* 
* Debug Method
* Deletes ALL contents of tables
* Only to be used for a complete database cleanup, preferrebly not by itself
* For design testing purposes only
*/
let deleteAll = () => {
    db.run(`DELETE FROM fridges`, [], (err) => {
        if (err) return console.log(err.message);
    })
    db.run(`DELETE FROM access`, [], (err) => {
        if (err) return console.log(err.message);
    })
    db.run(`DELETE FROM foods`, [], (err) => {
        if (err) return console.log(err.message);
    })
    db.run(`DELETE FROM users`, [], (err) => {
        if (err) return console.log(err.message);
    })
}

/*
* Deletes a row of the fridge table with specific fridgeId
* and all of its appereances on the access table
*/
let deleteFridgeOfUser = (userId, fridgeId) => {
    db.run(
        `DELETE FROM fridges WHERE id = ?`,     // not gonna bother checking if they are the owner or not, i'm just gonna use it properly
        [fridgeId],
        (err) => {
            if (err) return console.log(err.message);

            deleteAccessOfUserToFridge(userId, fridgeId);
            deleteAllFoodOfFridge(fridgeId);
        }
    );
}

let deleteAllFoodOfFridge = (fridgeId) => {
    db.run(
        `DELETE FROM foods WHERE fridgeId = ?`,
        [fridgeId],
        (err) => {
            if (err) return console.log(err.message);
        }
    );
}

let deleteSingleFoodOfFridge = (fridgeId, foodId) => {
    db.run(
        `DELETE FROM foods WHERE fridgeId = ?`,
        [fridgeId],
        (err) => {
            if (err) return console.log(err.message);
        }
    );
}

/* 
* Deletes all records from access where userId and fridgeId match
* Not to be used if the user is the Owner of the fridge, just be careful :)
*/
let deleteAccessOfUserToFridge = (userId, fridgeId) => {

    db.run(
        `DELETE FROM access WHERE userId = ? AND fridgeId = ?`,
        [userId, fridgeId],
        (err) => {
            if (err) return console.log(err.message);
        }
    );
}

/*
* Deletes all rows of access with the userId passed
* To use only if you are deleting a user from the Database, not by itself
*/
let deleteAccessOfUserToAllFridges = (userId) => {
    db.run(
        `DELETE FROM access WHERE userId = ?`,
        [userId],
        (err) => {
            if (err) return console.log(err.message);
        });

}

/**
 * Debug Function
 * Creates Tables needed for the DB
 */
let initializeDatabase = () => {
    createTableUser();
    createTableFridge();
    createTableFoods();
    createTableAccess();
}

let addFood = (fridgeId, foodName, expirationDate, iconId) => {
    db.run(
        `INSERT INTO foods(fridgeId, foodName, expiration_date, iconId)
         VALUES(?, ?, ?, ?)`,
        [fridgeId, foodName, expirationDate, iconId],
        (err) => {
            if (err) return console.log(err.message);
        }
    )
}

let getAllFridgesOfUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(
                `SELECT * FROM access WHERE userId = ?`,
                [userId],
                (err, rows) => {
                    if (err) return reject(err.message);

                    resolve(rows);
                }
            );
        });
    });
}

const getAllFridgesOfUserAsync = async (userId) => {
    return await getAllFridgesOfUser(userId);
}

/**
 * 
 * @param {*} fridgeId 
 * @returns resolve = oromise JSON object. reject = error message  
 * is handled by getFoodResultAsync(fridgeId)
 * Selects all food of a single fridge
 * is asyncronous
 */
let getFoodInFridge = (fridgeId) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(
                `SELECT * FROM foods WHERE fridgeId = ?`,
                [fridgeId],
                (err, rows) => {
                    if (err) return reject(err.message);

                    resolve(rows);
                }
            );
        });
    });
}
const getFoodResultAsync = async (fridgeId) => {
    return await getFoodInFridge(fridgeId);
}

// let getFoodResultPromise = (fridgeId) => {
//     getFoodInFridge(fridgeId).then((results) => {
//         return results;
//     });
// }

/**
 * Debug Function
 * returns a random name from list name
 * used to populate food table organically
 */
let randomFoodName = () => {
    let nameList = [
        `apple`,
        `mayo`,
        `pasta`,
        `banana`,
        `tomato`,
        `pingas`,
        `pistacchio`,
        `meow`,
        `mozzarella`,
        `cheese`,
        `lettuce`
    ];

    return nameList[randomInt(0, nameList.length - 1)];
}

/**
 * TO REPOPULATE DB
 * FOR TESTING ONLY
 * TODO("ADD FOODS QUERIES")
 */
let populateDatabase = () => {
    for (let i = 0; i < 10; i++) { addNewUser(i); }
    for (let i = 0; i < 10; i++) { addNewFridge(i, `${i} fridge`); }
    for (let i = 0; i < 20; i++) { addFood(randomInt(1, 20), randomFoodName(), `2000-10-5`, randomInt(0, 5)) }
}



// openDatabase();

// // START MANUAL FUCTION CALLS HERE

// //getAllTables();
// //populateDatabase();
// //deleteAll();
// const foodResult = getFoodResultAsync(10);
// foodResult.then(result => console.log(result));

// closeDatabase();

// ---- BASIC FUNCTIONALITY
module.exports.openDatabase = openDatabase;
module.exports.closeDatabase = closeDatabase;

// ---- GETTERS ----
module.exports.getFoodResult = getFoodResultAsync;
module.exports.getAllFridgesOfUser = getAllFridgesOfUserAsync;

// ---- SETTERS ----
module.exports.addNewUser = addNewUser;
module.exports.addToAccess = addToAccess;
module.exports.addFood = addFood;
module.exports.addNewFridge = addNewFridge;

// ---- UPDATERS ----


// ---- DELETERS ----
module.exports.deleteFridgeOfUser = deleteFridgeOfUser;
module.exports.deleteSingleFoodOfFridge = deleteSingleFoodOfFridge;


// ---- DEBUG METHODS ----
module.exports.getAllTables = getAllTables;
