const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

app.listen(
    PORT,
    () => console.log(`it's alive on http://localhost:${PORT}`)
)

app.get(`/user`, (req, res) => {
    res.status(200).send({
        userId: '69',    // Result of Query
        isCool: 'no'
    })
});

app.post(`/user/:id`, (req, res) => {

    const{ id } = req.params;
    const{ isCool } = req.body;

    if(isCool == "no"){
        res.status(200).send({message: "lol u sugs: "+isCool})
    }

    res.send({
        isCool : `are u cool? ${isCool}. You have an id of ${id}`,
    })
});