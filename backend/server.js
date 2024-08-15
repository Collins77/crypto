require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;
const busboy = require('connect-busboy');
const bodyParser = require('body-parser');
// const cron = require('./utils/cronJobs');

console.log(process.env.NODE_ENV);

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboy());

app.use(cookieParser())
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))
app.use('/investments', require('./routes/investmentRoutes'))
app.use('/plans', require('./routes/planRoutes'))
app.use('/withdrawals', require('./routes/withdrawRoutes'))
app.use('/admins', require('./routes/adminRoutes'))


app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')) {
        res.json({ message: "404 Not Found" })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)
        // cron; // Initialize the cron job
    );
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrLog.log')
})