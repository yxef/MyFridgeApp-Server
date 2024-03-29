const express = require('express');
const app = express();
const PORT = 8080;

const appDao = require('./appDAO');

app.use(express.json());

app.listen(
    PORT,
    () => console.log(`it's alive on http://79.55.187.52:${PORT}`)
)

// ---- Helper Function ----
const createJsonArrayObject = (res, result) => {
    let i = 0;
    res.setHeader('Content-Type', 'application/json');
    res.write(`[`   , 'utf8', ()=>{});
    result.forEach((row) => {
        res.write(JSON.stringify(row), 'utf8', ()=>{});
        i++;
        if(result.length > i)
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
 * Returns the foods of a Fridge
 */
app.get(`/fridge/:id/foods`, (req, res) => {

    const { id } = req.params;
    

    const foodResult = appDao.getFoodResult(parseInt(id));

    

    foodResult.then((result) => {
        createJsonArrayObject(res, result);
    });

});

/**
 * Gets a single fridge
 */
app.get(`/fridge/:id`, (req, res) => {

    const { id } = req.params;
    

    const foodResult = appDao.getSingleFridge(parseInt(id));

    

    foodResult.then((result) => {
        createJsonArrayObject(res, result);
    });

});


/**
 * Returns all fridges of user
 */
app.get(`/user/:userId/fridges`, (req, res) => {

    const { userId } = req.params;

    

    const fridgesResult = appDao.getAllFridgesOfUser(userId);

    

    fridgesResult.then((result) => {
        createJsonArrayObject(res, result);
    });

});

/**
 *  Gets which user can access specific Fridge
 */
 app.get(`/fridge/:fridgeId/access`, (req, res) => {
    const { fridgeId } = req.params;
    
    

    const accessResult = appDao.getAccessOfFridge(parseInt(fridgeId));

    

    accessResult.then((result) => {
        createJsonArrayObject(res, result);
    });
});

// ------------- POSTERS(?) -----------------

/**
 * Creates a new User with specified Id
 */
app.post(`/user/:id`, (req, res) => {

    const { id } = req.params;

    
    let response = appDao.addNewUserWithId(id);
    

    res.status(200).send(response);
});

app.post(`/user/create/fridge`, (req, res) => {
    const {userId} = req.body;
    const {fridgeName} = req.body;

    
    appDao.addNewFridge(userId, fridgeName);
    

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
        
        appDao.addToAccess(userId, parseInt(fridgeId), false);
        
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
    const { expiration_date } = req.body;
    const { iconId } = req.body;


    
    appDao.addFood(parseInt(fridgeId), foodName, expiration_date, parseInt(iconId));
    

    res.status(200).send(`fId: ${fridgeId}, foodname: ${foodName}, exp_date: ${expiration_date}`);
})

// -------------- UPDATERS ----------------

app.put(`/fridge/:fridgeId/update`, (req, res) => {
    const { fridgeId } = req.params;
    const { fridgeName } = req.body;

    
    appDao.updateFridge(fridgeId, fridgeName);
    

    res.status(200).send(`Updated fridge with Id ${fridgeId} with its new name ${fridgeName}`);
});

app.put(`/food/:foodId/update`, (req, res) => {
    const { foodId } = req.params;
    const { foodName } = req.body;
    const { expiration_date } = req.body;
    const { iconId } = req.body;

    
    appDao.updateFood(foodId, foodName, expiration_date, iconId);
    

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

    
    appDao.deleteFridgeOfUser(userId, parseInt(fridgeId));
    

    res.status(200).send(`Deletato fridgo ${fridgeId} di ${userId}`);

})

/**
 * Deletes from a fridge a single Food item
 */
app.delete(`/fridge/:fridgeId/delete/food/:foodId`, (req, res) => {
    const {fridgeId} = req.params;
    const {foodId} = req.params;

    
    appDao.deleteSingleFoodOfFridge(parseInt(fridgeId), parseInt(foodId));
    

    res.status(200).send(`Deletato ${foodId} da ${fridgeId}`);
})


/**
 * Deletes a users access to a fridge
 */
app.delete(`/fridge/:fridgeId/access/delete/:userId`, (req,res) =>{
    const {userId} = req.params;
    const {fridgeId} = req.params;

    
    appDao.deleteAccessOfUserToFridge(userId, parseInt(fridgeId));
    

    res.status(200).send(`Deletato Accesso di ${userId} a ${fridgeId}`);
})

// ----------------------------- DEBUG METHODS----------------

/**
 * Prints all tables to the console
 */
app.get(`/debug/all`, (req, res) => {
    
    appDao.getAllTables();
    

    res.status(418).send(`Debug printed to console`);
});

app.delete(`/debug/delete/all`, (req, res) => {
    
    appDao.deleteAllTables();
    
    res.status(200).send(`Deleted everything`);
 });

app.get(`/debug/initalize`, (req, res) => {
    appDao.initializeTables();

    res.status(200).send(`Tables have been initialized`);
});