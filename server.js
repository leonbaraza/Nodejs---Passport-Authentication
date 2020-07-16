// --------------------- load configuration based on env --------------------
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
// --------------------- load configuration based on env --------------------

const express = require('express')
const mongoose = require('mongoose')
const expressLayouts = require('express-ejs-layouts')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

const app = express()

// Passport config
require('./config/passport')(passport);

// --------------------- Middlewares --------------------
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))

// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Set global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})
// --------------------- Middlewares --------------------

// --------------------- Database connection --------------------
mongoose.connect(process.env.DATABASE_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true    
})
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', ()=>console.log('Connected to db'))
// --------------------- Database connection --------------------

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))


const PORT= process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))