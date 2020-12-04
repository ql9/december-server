import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { hash, generateSalt, compare } from '../hash';

export const readUser = async (req: Request, res: Response) => {
    await User.findById(req.params.userId)
        .then(user => {
            res.status(200).send(user);
        })
        .then(err => {
            res.status(500).send(err);
        });
};

export const createUser = async (req: Request, res: Response) => {
    if (!req.body.username || !req.body.password || !req.body.name) {
        res.status(400).send('Invalid input data');
    }

    const user = new User({
        username: req.body.username,
        password: await hash(req.body.password, generateSalt(10)),
        name: req.body.name,
    });

    await user
        .save()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send(err);
        });
};

export const updateUser = async (req: Request, res: Response) => {
    await User.findById(req.params.userId)
        .then(async user => {
            if (req.body.username) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: Object is possibly 'null'
                user.username = req.body.username;
            }
            if (req.body.password) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: Object is possibly 'null'
                user.password = await hash(req.body.password, generateSalt(10));
            }
            if (req.body.name) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore: Object is possibly 'null'
                user.name = req.body.name;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Object is possibly 'null'
            await user.save().then(() => {
                res.status(200).send('User update successful');
            });
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
};

export const deleteUser = async (req: Request, res: Response) => {
    await User.deleteOne({ _id: req.params.userId })
        .then(() => {
            res.status(204).send('Deleted user');
        })
        .catch((err: any) => {
            res.status(500).send(err);
        });
};

export const login = async (req: Request, res: Response) => {
    await User.findOne({ username: req.body.username })
        .select('+password')
        .then(async user => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Object is possibly 'null'
            await compare(req.body.password, user.password).then(result => {
                if (result) {
                    res.status(200).json({
                        status: 'Success',
                        message: 'Correct Details',
                        data: user,
                    });
                } else {
                    res.status(400).send('Invalid Username or Password');
                }
            });
        })
        .catch(() => res.status(404).send('User not found'));
};
