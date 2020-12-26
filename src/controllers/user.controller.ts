import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { hash, generateSalt } from '../hash';

export const getAll = async (req: Request, res: Response) => {
    await User.find({ isDeleted: false })
        .then(users =>
            res.status(200).json({
                success: true,
                message: 'list all users',
                users,
            }),
        )
        .catch(err =>
            res.status(500).json({
                success: false,
                message: 'error when get list all users',
                err,
            }),
        );
};

export const readUser = async (req: Request, res: Response) => {
    await User.findById(req.params.userId)
        .then(user => {
            return res.status(200).json({
                success: true,
                message: 'read success',
                user,
            });
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err,
            });
        });
};

export const updateUser = async (req: Request, res: Response) => {
    const { avatar, name, password } = req.body;
    await User.findById(req.params.userId)
        .then(async user => {
            if (avatar) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user.avatar = avatar;
            }
            if (password) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user.password = await hash(password, generateSalt(11));
            }
            if (name) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user.name = name;
            }
            await user?.save().then(() => {
                res.status(200).json({
                    success: true,
                    message: 'Profile Updated Successful',
                });
            });
        })
        .catch(err => {
            res.status(404).json({
                success: false,
                message: 'cant find user',
                err,
            });
        });
};

//#region delete user
export const deleteUser = async (req: Request, res: Response) => {
    await User.findById(req.params.userId)
        .then(async user => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            user.isDeleted = true;
            await user?.save().then(() => {
                res.status(204).json({
                    success: true,
                    message: 'Deleted',
                });
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
