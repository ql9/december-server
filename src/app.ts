import express from 'express';
import mongoose from 'mongoose';
import * as bodyParser from 'body-parser';

import * as config from './config/mongodb';
import * as userController from './controllers/user.controller';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.post('/users/', userController.createUser);
app.get('/users/:userId', userController.readUser);
app.put('/users/:userId', userController.updateUser);
app.delete('/users/:userId', userController.deleteUser);

app.post('/users/login', userController.login);

export default app;
