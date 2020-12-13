import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { hash, generateSalt, compare } from '../hash';
import jwt from 'jsonwebtoken';

export const superSecret =
    '20073e0938c0b6791114ba21deecec5eee4dfdce7482653e134f1a6a2f307a7cf05986013a46689eed83072370d4f2dac7b634db8ba77b55437ac200a0a23ff5';

export const readUser = async (req: Request, res: Response) => {
    await User.findById(req.params.userId)
        .then(user => {
            res.status(200).json({
                success: true,
                data: user,
            });
        })
        .then(err => {
            res.status(500).json({
                success: false,
                message: err,
            });
        });
};

export const createUser = async (req: Request, res: Response) => {
    if (!req.body.username || !req.body.password || !req.body.name) {
        res.status(400).json({
            success: false,
            message: 'Invalid input data',
        });
    }

    const user = new User({
        username: req.body.username,
        password: await hash(req.body.password, generateSalt(10)),
        name: req.body.name,
    });

    await user
        .save()
        .then(data => {
            const token = jwt.sign(
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    name: user.name,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    username: user.username,
                },
                superSecret,
                {
                    expiresIn: '24h',
                },
            );
            res.status(200).json({
                success: true,
                data: data,
                token: token,
            });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err,
            });
        });
};

export const updateUser = async (req: Request, res: Response) => {
    await User.findById(req.params.userId)
        .then(async user => {
            if (req.body.username) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user.username = req.body.username;
            }
            if (req.body.password) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user.password = await hash(req.body.password, generateSalt(10));
            }
            if (req.body.name) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user.name = req.body.name;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await user.save().then(() => {
                res.status(200).json({
                    success: true,
                    message: 'Updated',
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: err,
            });
        });
};

//#region delete user
export const deleteUser = async (req: Request, res: Response) => {
    await User.deleteOne({ _id: req.params.userId })
        .then(() => {
            res.status(204).json({
                success: true,
                message: 'Deleted',
            });
        })
        .catch((err: any) => {
            res.status(500).json({
                success: false,
                message: err,
            });
        });
};

//#endregion

export const login = async (req: Request, res: Response) => {
    await User.findOne({ username: req.body.username })
        .select('+password')
        .then(async user => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await compare(req.body.password, user.password).then(result => {
                if (result) {
                    const token = jwt.sign(
                        {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            name: user.name,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            username: user.username,
                        },
                        superSecret,
                        {
                            expiresIn: '24h',
                        },
                    );
                    res.status(200).json({
                        success: true,
                        message: 'Correct Details',
                        token: token,
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
