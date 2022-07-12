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
 * it takes a SELECT SQL query and it prints each row returned
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
 * Debug method, prints all the tables
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
 * Creates a new User with specific Id
 * We have to pass the Id since its meant to be the App install Id
 */
let createNewUser = (id) => {
    db.run(
        `INSERT INTO users (id) VALUES(?)`,
        [id],
        (err) => {
            if (err) return console.log(err.message);

            console.log("new row has been created");
        }
    )
}

/**
 * Creates a new Fridge row
 * It needs a userId, a fridgeName
 * Creates a table row where fridgeName equals the passed fridgeName
 * then it calls addToAccess() method which uses the userId that was passed to
 * this function, the fridgeId of the row we just inserted and the isOwner flag
 * which is always True given that the user created the Fridge
 */
let createNewFridge = (userId, fridgeName) => {
    db.run(
        `INSERT INTO fridges (name) VALUES(?)`,
        [fridgeName],
        function (err) {
            if (err) return console.log(err.message);

            addToAccess(userId, this.lastID, True);
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
* Deletes ALL fridges and access of every user
* Only to be used for a complete database cleanup, preferrebly not by itself
* For design testing purposes only
*/
let deleteAllFridges = () => {
    db.run(`DELETE FROM fridges`, [], (err) => {
        if (err) return console.log(err.message);
    })
    db.run(`DELETE FROM access`, [], (err) => {
        if (err) return console.log(err.message);
    })
}

/*
* Deletes a row of the fridge table with specific fridgeId
* and all of its appereances on the access table
*/ 
let deleteFridgeOfUser = (userId, fridgeId) => {
    db.run(
        `DELETE FROM fridges WHERE id = ?`,
        [fridgeId],
        (err) => {
            if (err) return console.log(err.message);

            deleteAccessOfUserToFridge(userId, fridgeId);
        }
    );
}

/* 
* Deletes all records from access where userId and fridgeId match
* To be used to delete a single specific access combination
* Unless its the owner of the fridge
*/
let deleteAccessOfUserToFridge = (userId, fridgeId, isOwner) => {
    if(isOwner == true)
        return;
    
    db.run(
        `DELETE FROM access WHERE userId = ? AND fridgeId = ? and isOwner = ?`,
        [userId, fridgeId, isOwner],
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
 * DB setup, FOR TESTING PURPOSES ONLY
 */
let initializeDatabase = () => {
    createTableUser();
    createTableFridge();
    createTableFoods();
    createTableAccess();
}

/**
 * TO REPOPULATE DB
 * FOR TESTING ONLY
 * TODO("ADD FOODS QUERIES")
 */
let populateDatavase = () => {
    for(let i = 0; i < 10; i++){createNewUser(i);}
    for(let i = 0; i < 10; i++){createNewFridge(i, `${i} fridge`);}
}



openDatabase();

// START MANUAL FUCTION CALLS HERE

getAllTables();


closeDatabase();
