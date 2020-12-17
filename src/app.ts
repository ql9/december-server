import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as bodyParser from 'body-parser';
const cors = require('cors');
import dotenv from 'dotenv';

import * as userController from './controllers/user.controller';
import * as authController from './controllers/auth.controller';

dotenv.config();

const app = express();

//use cors middleware
// app.use(
//     cors({
//         allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token'],
//         credentials: true,
//         methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
//         origin: process.env.APP_URL,
//         preflightContinue: false,
//     }),
// );

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;

mongoose
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .connect(process.env.MONGO_DB_URI, {
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

app.post('/register', authController.register);
app.post('/activation', authController.activate);
app.post('/login', authController.login);
app.post('/auth/google', authController.google);
app.post('/auth/facebook', authController.facebook);

// Check token, ignored when create account or login
app.use((req: Request, res: Response, next) => {
    const token = req.headers.authorization;
    if (token) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jwt.verify(token, process.env.JWT_SECRET_KEY, function (err: any, decoded: any) {
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
