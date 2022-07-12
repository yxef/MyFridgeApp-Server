const { resolve } = require('path');

const sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./MyFridge.db');


let openDatabase = () => {
    db = new sqlite3.Database("./MyFridge.db", sqlite3.OPEN_READWRITE, (err) => {
        if (err) return console.log(err.message);

        console.log("Connection Successful");
    });
}

let closeDatabase = () => {
    db.close((err) => {
        if (err) return console.log(err.message);
    });
}

let createTableUser = () => {
    db.run(
        `CREATE TABLE users(id PRIMARY KEY)`
    );
}
let createTableFridge = () => {
    db.run(`CREATE TABLE fridges(
            id INTEGER PRIMARY KEY,
            name NOT NULL
        )`);
}
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

let performAllQuery = (sql) => {
    db.all(sql, [], (err, rows) => {
        if (err) return console.log(err.message);

        console.log(sql);
        rows.forEach((row) => {
            console.log(row);
        });
    });
}

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

let createNewFridge = (userId, fridgeName, isOwner) => {
    // INSERISCO IL FRIGO
    db.run(
        `INSERT INTO fridges (name) VALUES(?)`,
        [fridgeName],
        function (err) {
            if (err) return console.log(err.message);

            console.log("new fridge named " + fridgeName +
                " has been created with ID " + this.lastID);
            addToAccess(userId, this.lastID, isOwner);
        }
    )

    console.log(`this.lastID = ${this.lastID}`);
}

let addToAccess = (userId, lastId, isOwner) => {
    // INSERISCO IL FRIGO APPENA CREATO IN ACCESS
    db.run(
        `INSERT INTO access (userId, fridgeId, isOwner) VALUES(?,?,?)`,
        [userId, lastId, isOwner],
        function (err) {
            if (err) return console.log(err.message);

            console.log("inserito in access: " + lastId);
        }

    );
}

let deleteFridges = () => {
    db.run(`DELETE FROM fridges`, [], (err) => {
        if (err) return console.log(err.message);
    })
    db.run(`DELETE FROM access`, [], (err) => {
        if (err) return console.log(err.message);
    })
}

// db.run(`DROP TABLE fridges`);
// createTableFridge();
// createTableFoods();
// createTableAccess();


// for(let i = 0; i < 10; i++){createNewUser(i);}

openDatabase();

//createNewFridge(22, "aaaaaaa", false);
//deleteFridges();
getAllTables();
closeDatabase();
