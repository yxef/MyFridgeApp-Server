const express = require('express');
const app = express();
const PORT = 8080;

const appDao = require('./appDAO');

app.use(express.json());

app.listen(
    PORT,
    () => console.log(`it's alive on http://localhost:${PORT}`)
)

// ---- Helper Function ----
const createJsonArrayObject = (res, result) => {
    res.setHeader('Content-Type', 'application/json');
    res.write(`[`   , 'utf8', ()=>{});
    result.forEach((row) => {
        res.write(JSON.stringify(row), 'utf8', ()=>{});
        res.write(',')
    });
    res.write(`]`, 'utf8', ()=>{});
    res.end('');
}

// ------------ GETTERS ----------------

/* Example. just takes space
app.get(`/user`, (req, res) => {
    res.status(200).send({
        userId: '69',    // Result of Query
        isCool: 'no'
    })
});
*/

/**
 * Returns the content of a Fridge
 */
app.get(`/fridge/:id/foods`, (req, res) => {

    const { id } = req.params;
    appDao.openDatabase();

    const foodResult = appDao.getFoodResult(parseInt(id));

    appDao.closeDatabase();

    foodResult.then((result) => {
        createJsonArrayObject(res, result);
    });

});


/**
 * Returns all fridges of user
 */
app.get(`/user/:id/fridges`, (req, res) => {

    const { id } = req.params;
    appDao.openDatabase();

    const fridgesResult = appDao.getAllFridgesOfUser(parseInt(id));

    appDao.closeDatabase();

    fridgesResult.then((result) => {
        createJsonArrayObject(res, result);
    });

});

/**
 * 
 */
 app.get(`/fridge/:fridgeId/access`, (req, res) => {
    const { fridgeId } = req.params;
    
    appDao.openDatabase();

    const accessResult = appDao.getAccessOfFridge(parseInt(fridgeId));

    appDao.closeDatabase();

    accessResult.then((result) => {
        createJsonArrayObject(res, result);
    });
});

// ------------- SETTERS -----------------

/**
 * Creates a new User
 */
app.post(`/user/:id`, (req, res) => {

    const { id } = req.params;

    appDao.openDatabase();
    appDao.addNewUser(id);
    appDao.closeDatabase();

    res.status(200).send(`Sent request to create new user with id: ${id}`);

    // if (isCool == "no") {
    //     res.status(200).send({ message: "lol u sugs: " + isCool })
    // }

    // res.send({
    //     isCool: `are u cool? ${isCool}. You have an id of ${id}`,
    // })
});

app.post(`/user/create/fridge`, (req, res) => {
    const {userId} = req.body;
    const {fridgeName} = req.body;

    appDao.openDatabase();
    appDao.addNewFridge(userId, fridgeName);
    appDao.closeDatabase();

    res.status(200).send(`Sent request to create new fridge with name: ${fridgeName}`);

});

/**
 * Gives Access of a fridge to a User
 * User id has to be passed on a body JSON
 */
app.post(`/fridge/access/give/:fridgeId`, (req, res) =>{
    const { fridgeId } = req.params; 
    const { userId } = req.body;

    if(userId != null){
        appDao.openDatabase();
        appDao.addToAccess(userId, parseInt(fridgeId), false);
        appDao.closeDatabase();
        res.status(200).send(`Recieved request to give ${userId} access to ${fridgeId}`);
    }

    res.status(400).send(`Did not pass a valid userId in json body`);
})

/**
 * Adds a single food Item to a fridge
 * All params are passed with a JSON body
 */
app.post(`/fridge/add/food/`, (req, res) => {
    const { fridgeId } = req.body;
    const { foodName } = req.body;
    const { expirationDate } = req.body;
    const { iconId } = req.body;


    appDao.openDatabase();
    appDao.addFood(parseInt(fridgeId), foodName, expirationDate, parseInt(iconId));
    appDao.closeDatabase();

    res.status(200).send(`fId: ${fridgeId}, foodname: ${foodName}, exp_date: ${expirationDate}`);
})

// -------------- UPDATERS ----------------

app.put(`/fridge/:fridgeId/update`, (req, res) => {
    const { fridgeId } = req.params;
    const { fridgeName } = req.body;

    appDao.openDatabase();
    appDao.updateFridge(fridgeId, fridgeName);
    appDao.closeDatabase();

    res.status(200).send(`Updated fridge with Id ${fridgeId} with its new name ${fridgeName}`);
});

app.put(`/food/:foodId/update`, (req, res) => {
    const { foodId } = req.params;
    const { foodName } = req.body;
    const { expiration_date } = req.body;
    const { iconId } = req.body;

    appDao.openDatabase();
    appDao.updateFood(foodId, foodName, expiration_date, iconId);
    appDao.closeDatabase();

    res.status(200).send(`Updated food with Id ${foodId} 
        with its new name ${foodName}, 
        new expiration date ${expiration_date},
        and new icon id ${iconId}`);

});

// -------------- DELETERS ----------------

/**
 * Deletes the Fridge of a User
 */
app.delete(`/user/:userId/delete/fridge/:fridgeId`, (req, res) => {
    const {userId} = req.params;
    const {fridgeId} = req.params;

    appDao.openDatabase();
    appDao.deleteFridgeOfUser(userId, parseInt(fridgeId));
    appDao.closeDatabase();

    res.status(200).send(`Deletato fridgo ${fridgeId} di ${userId}`);

})

/**
 * Deletes from a fridge a single Food item
 */
app.delete(`/fridge/:fridgeId/delete/food/:foodId`, (req, res) => {
    const {fridgeId} = req.params;
    const {foodId} = req.params;

    appDao.openDatabase();
    appDao.deleteSingleFoodOfFridge(parseInt(fridgeId), parseInt(foodId));
    appDao.closeDatabase();

    res.status(200).send(`Deletato ${foodId} da ${fridgeId}`);
})


/**
 * Deletes a users access to a fridge
 */
app.delete(`/fridge/:fridgeId/access/delete/:userId`, (req,res) =>{
    const {userId} = req.params;
    const {fridgeId} = req.params;

    appDao.openDatabase();
    appDao.deleteAccessOfUserToFridge(userId, parseInt(fridgeId));
    appDao.closeDatabase();

    res.status(200).send(`Deletato Accesso di ${userId} a ${fridgeId}`);
})

// ----------------------------- DEBUG METHODS----------------

/**
 * Prints all tables to the console
 */
app.get(`/debug/all`, (req, res) => {
    appDao.openDatabase();
    appDao.getAllTables();
    appDao.closeDatabase();

    res.status(418).send(`Debug printed to console`);
});