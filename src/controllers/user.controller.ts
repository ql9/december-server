import { User } from '../models/user.model';
import { Request, Response } from 'express';
import { hash, generateSalt } from '../hash';

export const readUser = async (req: Request, res: Response) => {
    await User.findById(req.params.userId)
        .then(user => {
            return res.status(200).json({
                success: true,
                data: user,
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
    const { email, name, password } = req.body;
    await User.findById(req.params.userId)
        .then(async user => {
            if (email) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user.email = email;
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
