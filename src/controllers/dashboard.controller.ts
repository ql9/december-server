import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { Request, Response } from 'express';

export const get = async (req: Request, res: Response) => {
    const { userId } = req.params;
    await User.find({ follower: userId }).then(async users => {
        if (users) {
            users.forEach(async user => {
                await Post.find({ userId: user._id }).then(posts => {});
            });
        }
    });
};
