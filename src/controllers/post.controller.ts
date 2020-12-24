import { Post } from '../models/post.model';
import { Request, Response } from 'express';

import { upload } from './upload.controller';
import multer from 'multer';

export const create = async (req: Request, res: Response) => {
    upload(req, res, async (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }
        const { content, userId } = req.body;
        const image = `${process.env.APP_URL}/` + req.file.path;
        console.log(image);
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
                    message: 'create post success',
                    post,
                });
            })
            .catch(err => {
                res.status(401).json({
                    success: false,
                    message: 'error when create post',
                    err,
                });
            });
    });
};

export const read = async (req: Request, res: Response) => {
    const { postId } = req.params;
    await Post.findById(postId)
        .then(post =>
            res.status(200).json({
                success: true,
                message: 'get post',
                post,
            }),
        )
        .catch(err => {
            res.status(500).json({
                success: false,
                message: 'can not read post',
                err,
            });
        });
};

export const update = async (req: Request, res: Response) => {
    const { postId, image, content } = req.body;

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
                        message: 'updated post',
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
        .then(() =>
            res.status(204).json({
                success: true,
                message: 'deleted post',
            }),
        )
        .catch((err: any) =>
            res.status(500).json({
                success: false,
                message: err,
            }),
        );
};

export const like = async (req: Request, res: Response) => {
    const { postId, userId } = req.params;
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
    const { postId, userId } = req.params;
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
