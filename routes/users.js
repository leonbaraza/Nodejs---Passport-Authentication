const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const { body, check, validationResult } = require('express-validator')
const passport = require('passport')
const User = require('./../models/Users')


router.get('/login', (req, res) => {
    res.render('Login')
})
router.get('/register', (req, res) => {
    res.render('Register')
})

router.post('/register', [
        check('name').notEmpty().withMessage('Name is empty'),
        check('email').notEmpty().withMessage('Email is empty'),
        check('password').notEmpty().withMessage('Password is empty'),
        body('name')
            .trim(),
        body('email')
            .isEmail()
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min:6 }).withMessage('Password must be at least 6 chars long')
            .matches(/\d/).withMessage('Password must contain a number'),
        body('password2').custom((value, { req }) => {
                if (value !== req.body.password) {
                  throw new Error('Password confirmation does not match password');
                }
                return true;
            })
    ],
    (req, res) => {        
        const { name, email, password, password2 } = req.body
        bcrypt.hash(req.body.password, 10, function(err, hashedPass) {     
            let errors = validationResult(req)
            if (err) {
                errors.errors.push({errors})
                return res.render('register', { 
                    errors,
                    name, email, password, password2
                })
            }
            if(!errors.isEmpty()){
                return res.render('register', { 
                                            errors,
                                            name, email, password, password2
                                    })
            }else{
                // Validation pass
                User.findOne({email: email})
                    .then(user => {                    
                        if (user) {              
                            errors.errors.push({msg: 'Email already exists'})
                            return res.render('register', { 
                                errors,
                                name, email, password, password2
                            })
                        }else{
                        let user = new User({
                            name,
                            email,
                            password:hashedPass
                        })
                        console.log(user);
                        user.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in')
                            res.redirect('/users/login')
                        })
                        .catch( err => {
                            res.send('error occured')
                        })
                        }
                    })
            }
        })
})

router.post('/login', (req, res, next) => {
    const {email, password} = req.body
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})

module.exports = router