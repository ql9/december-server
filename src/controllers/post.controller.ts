import { Post } from '../models/post.model';
import { Request, Response } from 'express';

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
                message: 'create post success',
                data: post,
            });
        })
        .catch(err => {
            res.status(401).json({
                success: false,
                message: 'error when create post',
                data: err,
            });
        });
};

export const read = async (req: Request, res: Response) => {
    const { postId } = req.params;
    await Post.findById(postId)
        .then(post =>
            res.status(200).json({
                success: true,
                data: post,
            }),
        )
        .catch(err => {
            res.status(500).json({
                success: false,
                data: err,
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
                        data: post,
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        success: false,
                        message: 'error when edit post',
                        data: err,
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
                        data: data,
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        success: false,
                        message: 'error when like post',
                        data: err,
                    });
                });
        })
        .catch(err => {
            return res.status(404).json({
                success: false,
                message: 'cannot find comment',
                data: err,
            });
        });
};
