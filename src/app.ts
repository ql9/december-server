import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import * as bodyParser from 'body-parser';
import * as config from './config/mongodb';
import * as userController from './controllers/user.controller';
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//add

mongoose.Promise = global.Promise;
mongoose
    .connect(config.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => {
        console.log('Successfully connected to the database');
    })
    .catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });

// Create account
app.post('/users/', userController.createUser);

// Login
app.post('/users/login', userController.login);

// Check token, ignored when create account or login
app.use((req: Request, res: Response, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, userController.superSecret, function (err: any, decoded: any) {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Failed to authenticate token',
                });
            }
            req.accepted = decoded;
            next();
        });
    } else {
        res.status(403).json({
            success: false,
            message: 'No token provided',
        });
    }
});

// Get information of user by id
app.get('/users/:userId', userController.readUser);

// Update information of user by id
app.put('/users/:userId', userController.updateUser);

// Delete user by id
app.delete('/users/:userId', userController.deleteUser);

export default app;
