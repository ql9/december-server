import { User } from '../models/user.model';
import { hash, compare, generateSalt } from '../hash';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: 'december.ql9.lms@gmail.com',
        pass: 'december-blog',
    },
});

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    await User.findOne({ email })
        .then(async user => {
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is taken',
                });
            }
            const token = jwt.sign(
                {
                    name,
                    email,
                    password,
                },
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: '15m',
                },
            );
            const mailOptions = {
                from: 'December Blog',
                to: email,
                subject: 'Account activation link',
                // text: 'This is code to active your Stapler account, do not share this code to anyone: ' + token,
                html: `
                    <h1>Please use the following to activate your account</h1>
                    <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                    <hr />
                    <p>This email may contains sensitive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `,
            };
            await transporter
                .sendMail(mailOptions)
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        message: `Email has been sent to ${email}`,
                    });
                })
                .catch(err => {
                    return res.status(400).json({
                        success: false,
                        message: err,
                    });
                });
        })
        .catch(err => {
            return res.status(400).json({
                success: false,
                message: err,
            });
        });
};

export const activate = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (token) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err: any) => {
            if (err) {
                console.log(err);
                res.status(401).json({
                    success: false,
                    message: 'Expired link. Signup again',
                });
            } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const { name, email, password } = jwt.decode(token);
                const user = new User({
                    name: name,
                    email: email,
                    password: await hash(password, generateSalt(11)),
                });
                await user
                    .save()
                    .then(user => {
                        res.status(201).json({
                            success: true,
                            message: 'Sign up success',
                            data: user,
                        });
                    })
                    .catch(err => {
                        res.status(401).json({
                            success: false,
                            message: err,
                        });
                    });
            }
        });
    } else {
        res.status(403).json({
            success: false,
            message: 'No token provided',
        });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    await User.findOne({ email })
        .select('+password')
        .then(async user => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await compare(password, user.password).then((result: boolean) => {
                if (result) {
                    const token = jwt.sign(
                        {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            name: user.name,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            email: user.email,
                        },
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        process.env.JWT_SECRET_KEY,
                        {
                            expiresIn: '24h',
                        },
                    );
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const { _id, name, email, role } = user;
                    res.status(200).json({
                        success: true,
                        message: 'Correct Details',
                        token: token,
                        user: {
                            _id,
                            name,
                            email,
                            role,
                        },
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid Username or Password',
                    });
                }
            });
        })
        .catch(() =>
            res.status(404).json({
                success: false,
                message: 'User not found',
            }),
        );
};

export const forgetPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    await User.findOne({ email }).then(async user => {
        const token = jwt.sign(
            {
                _id: user?._id,
            },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            process.env.JWT_RESET_PASSWORD,
            {
                expiresIn: '10m',
            },
        );
        const mailOptions = {
            from: 'December Blog',
            to: email,
            subject: `Password Reset link`,
            html: `
                    <h1>Please use the following link to reset your password</h1>
                    <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                    <hr />
                    <p>This email may contain sensitive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `,
        };
        await transporter
            .sendMail(mailOptions)
            .then(() => {
                return res.status(200).json({
                    success: true,
                    message: `Email has been sent to ${email}`,
                });
            })
            .catch(err => {
                return res.status(400).json({
                    success: false,
                    message: err,
                });
            });
    });
};

// Google Login
export const google = async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_APP_ID);

    await client
        .verifyIdToken({ idToken, audience: process.env.GOOGLE_APP_ID })
        .then(response => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { email_verified, name, email } = response.payload;
            if (email_verified) {
                User.findOne({ email }).then(async user => {
                    if (user) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const { name, email } = user;
                        const token = jwt.sign(
                            {
                                name: name,
                                email: email,
                            },
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            process.env.JWT_SECRET_KEY,
                            {
                                expiresIn: '24h',
                            },
                        );
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        const { _id, role } = user;
                        res.status(200).json({
                            success: true,
                            message: 'Correct Details',
                            token: token,
                            user: {
                                _id,
                                name,
                                email,
                                role,
                            },
                        });
                    } else {
                        const password = email + process.env.JWT_SECRET;
                        const user = new User({
                            name: name,
                            email: email,
                            password: await hash(password, generateSalt(11)),
                        });
                        await user
                            .save()
                            .then(user => {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                const { _id, name, email, role } = user;
                                const token = jwt.sign(
                                    {
                                        name: name,
                                        email: email,
                                    },
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    process.env.JWT_SECRET_KEY,
                                    {
                                        expiresIn: '24h',
                                    },
                                );
                                res.status(200).json({
                                    success: true,
                                    message: 'Correct Details',
                                    token: token,
                                    user: {
                                        _id,
                                        name,
                                        email,
                                        role,
                                    },
                                });
                            })
                            .catch(err => {
                                res.status(401).json({
                                    success: false,
                                    message: err,
                                });
                            });
                    }
                });
            } else {
                return res.status(400).json({
                    error: 'Google login failed. Try again',
                });
            }
        })
        .catch(err => {
            res.status(404).json({
                success: false,
                message: 'No token provided',
                data: err,
            });
        });
};

export const facebook = async (req: Request, res: Response) => {
    const { accessToken } = req.body;

    const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
            fields: ['id', 'email', 'name'].join(','),
            access_token: accessToken,
        },
    });
    const { id, email, name } = data; // { id, email, first_name, last_name }

    User.findOne({ facbook_id: id }).then(user => {
        if (user) {
            console.log('alo');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
                expiresIn: '7d',
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { _id, email, name, role } = user;
            return res.json({
                token,
                user: { _id, email, name, role },
            });
        } else {
            const password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password, facebook_id: id });
            user.save((err, data) => {
                if (err) {
                    console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                    return res.status(400).json({
                        error: 'User signup failed with facebook',
                    });
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const { _id, email, name, role } = data;
                return res.json({
                    token,
                    user: { _id, email, name, role },
                });
            });
        }
    });
};
