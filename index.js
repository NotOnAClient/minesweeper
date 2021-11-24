const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Express Middleware for serving static files
app.use('/js', express.static(path.join(__dirname, './js')));

app.use(express.static(__dirname + '/css'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})