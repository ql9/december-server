import { Comment } from '../models/comment.model';
import { Request, Response } from 'express';

export const create = async (req: Request, res: Response) => {
    const { userId, postId, content } = req.body;
    const comment = new Comment({
        userId,
        postId,
        content,
    });
    await comment
        .save()
        .then(comment =>
            res.status(201).json({
                success: true,
                message: 'add comment',
                comment,
            }),
        )
        .catch(err =>
            res.status(401).json({
                success: false,
                message: 'error when add comment to this post',
                err,
            }),
        );
};

export const edit = async (req: Request, res: Response) => {
    const { commentId, content } = req.body;
    await Comment.findById(commentId)
        .then(async comment => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            comment.content = content;
            await comment?.save().then(data =>
                res.status(200).json({
                    success: true,
                    message: 'edited comment',
                    data,
                }),
            );
        })
        .catch(err =>
            res.status(401).json({
                success: false,
                message: 'error when edit comment',
                err,
            }),
        );
};

export const deleteComment = async (req: Request, res: Response) => {
    const { commentId, userId } = req.params;
    await Comment.findById(commentId)
        .then(async comment => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (userId === comment.userId) {
                await Comment.deleteOne({ _id: commentId }).then(() =>
                    res.status(204).json({
                        success: true,
                        message: 'deleted comment',
                    }),
                );
            } else
                () =>
                    res.status(401).json({
                        success: false,
                        message: 'action is not allowed',
                    });
        })
        .catch(err =>
            res.status(404).json({
                success: false,
                message: 'cannot find comment',
                err,
            }),
        );
};
