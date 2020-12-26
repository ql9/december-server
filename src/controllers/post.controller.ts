import { Request, Response } from 'express';

import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';

export const create = async (req: Request, res: Response) => {
    const { image, content, userId } = req.body;
    const likeBy: string[] = [];
    const post = new Post({
        userId,
        image,
        content,
        likeBy,
    });

    await post
        .save()
        .then(post => {
            res.status(201).json({
                success: true,
                message: 'Posted Successfully',
                post,
            });
        })
        .catch(err => {
            res.status(401).json({
                success: false,
                message: 'Error when create post',
                err,
            });
        });
};

export const read = async (req: Request, res: Response) => {
    const { postId } = req.params;
    await Post.findById(postId)
        .then(async post => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { name, avatar } = await User.findById(post.userId);
            const data = {
                postId: post?._id,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                userId: post.userId,
                name: name,
                avatar: avatar,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                content: post.content,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                image: post.image,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                likeBy: post.likeBy,
            };
            return res.status(200).json({
                success: true,
                message: 'get post',
                data,
            });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: 'can not read post',
                err,
            });
        });
};

export const update = async (req: Request, res: Response) => {
    const { image, postId, content } = req.body;

    await Post.findById(postId)
        .then(async post => {
            if (image) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                post.image = image;
            }
            if (content) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                post.content = content;
            }
            await post
                ?.save()
                .then(() => {
                    res.status(200).json({
                        success: true,
                        message: 'Updated Post Successfully',
                        post,
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        success: false,
                        message: 'error when edit post',
                        err,
                    });
                });
        })
        .catch(err =>
            res.status(404).json({
                success: false,
                message: 'cannot find comment',
                data: err,
            }),
        );
};

export const deletePost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    await Post.deleteOne({ _id: postId })
        .then(async () => {
            await Comment.deleteMany({ postId: postId });
            res.status(204).json({
                success: true,
                message: 'deleted post',
            });
        })
        .catch((err: any) =>
            res.status(500).json({
                success: false,
                message: err,
            }),
        );
};

export const like = async (req: Request, res: Response) => {
    const { postId, userId } = req.body;
    await Post.findById(postId)
        .then(async post => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            post.likeBy.push(userId);
            await post
                ?.save()
                .then(data => {
                    return res.status(201).json({
                        success: true,
                        message: 'Liked',
                        data,
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        success: false,
                        message: 'error when like post',
                        err,
                    });
                });
        })
        .catch(err => {
            return res.status(404).json({
                success: false,
                message: 'cannot find comment',
                err,
            });
        });
};

export const unLike = async (req: Request, res: Response) => {
    const { postId, userId } = req.body;
    await Post.findById(postId)
        .then(async post => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            post.likeBy.pull(userId);
            await post
                ?.save()
                .then(data => {
                    return res.status(201).json({
                        success: true,
                        message: 'unLiked',
                        data,
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        success: false,
                        message: 'error when unlike post',
                        err,
                    });
                });
        })
        .catch(err => {
            return res.status(404).json({
                success: false,
                message: 'cannot find comment',
                err,
            });
        });
};
