import { User } from '../models/user.model';
import { Request, Response } from 'express';

export const follow = async (req: Request, res: Response) => {
    const { userId, followerId } = req.params;
    await User.findById(followerId)
        .then(async user => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            user.follower.push(userId);
            await user
                ?.save()
                .then(data =>
                    res.status(201).json({
                        success: true,
                        message: 'followed user',
                        data,
                    }),
                )
                .catch(err =>
                    res.status(401).json({
                        success: false,
                        message: 'error when follow user',
                        err,
                    }),
                );
        })
        .catch(err =>
            res.status(404).json({
                success: false,
                message: 'cannot find user',
                err,
            }),
        );
};

export const unFollow = async (req: Request, res: Response) => {
    const { userId, followerId } = req.body;
    await User.findById(followerId)
        .then(async user => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            user.follower.pull(userId);
            await user
                ?.save()
                .then(data =>
                    res.status(201).json({
                        success: true,
                        message: 'followed user',
                        data,
                    }),
                )
                .catch(err =>
                    res.status(401).json({
                        success: false,
                        message: 'error when follow user',
                        err,
                    }),
                );
        })
        .catch(err =>
            res.status(404).json({
                success: false,
                message: 'cannot find user',
                err,
            }),
        );
};
