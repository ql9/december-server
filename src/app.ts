import express, { Request, Response } from 'express';
// import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import * as userController from './controllers/user.controller';
import * as authController from './controllers/auth.controller';
import * as postController from './controllers/post.controller';
import * as commentController from './controllers/comment.controller';
import * as followController from './controllers/follow.controller';
import * as dashboardController from './controllers/dashboard.controller';
import { uploadImage } from './controllers/upload.controller';

dotenv.config();
const app = express();

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

app.use('/images', express.static('images'));

// Check token, ignored when create account or login
app.use((req: Request, res: Response, next) => {
    let token = req.headers.authorization;
    if (!token) {
        token = req.headers.cookie?.split('=')[1];
    }
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

// images
app.post('/upload', uploadImage);

// user
app.get('/users', userController.getAll);
app.get('/users/:userId', userController.readUser);
app.put('/users/:userId', userController.updateUser);
app.delete('/users/:userId', userController.deleteUser);

// posts
app.get('/post/:postId', postController.read);
app.post('/post', postController.create);
app.put('/post', postController.update);
app.delete('/post/:postId', postController.deletePost);
app.put('/post/like/:postId/:userId', postController.like);
app.put('/post/unlike/:postId/:userId', postController.unLike);

// comment
app.post('/comment', commentController.create);
app.put('/comment', commentController.edit);
app.delete('/comment/delete/:commentId/:userId', commentController.deleteComment);

// follow
app.put('/follow/:userId/:followerId', followController.follow);
app.put('/unfollow/:userId/:followerId', followController.unFollow);

// get posts and comments
app.get('/:userId', dashboardController.getPosts);
app.get('/', dashboardController.get);
app.get('/comment/:postId', dashboardController.getCommentByPost);
app.get('/post/user/:userId', dashboardController.getPostsByUserId);

export default app;
