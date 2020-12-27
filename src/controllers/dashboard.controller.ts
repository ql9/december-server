import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { Request, Response } from 'express';
import moment from 'moment';

export const get = async (req: Request, res: Response) => {
    await Post.find()
        .sort({ createdAt: -1 })
        .then(posts => {
            let length = posts.length;
            if (length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'no post yet',
                });
            }
            const data: {
                userId: string;
                name: string;
                avatar: string;
                postId: string;
                content: string;
                image: string;
                likeBy: Array<string>;
            }[] = [];
            posts.forEach(async post => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const { _id, name, avatar, isDeleted } = await User.findById(post.userId);
                if (isDeleted) length--;
                else {
                    data.push({
                        userId: _id,
                        name: name,
                        avatar: avatar,
                        postId: post._id,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        content: post.content,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        image: post.image,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        likeBy: post.likeBy,
                    });
                }
                if (data.length === length) {
                    return res.status(200).json({
                        success: true,
                        message: 'get list post',
                        data,
                    });
                }
            });
        })
        .catch(err =>
            res.status(500).json({
                success: false,
                message: 'cannot get posts',
                err,
            }),
        );
};

export const getPostsByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params;
    await Post.find({ userId: userId })
        .then(posts => {
            if (posts.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'no post yet',
                });
            }
            const data: {
                userId: string;
                name: string;
                avatar: string;
                postId: string;
                content: string;
                image: string;
                likeBy: Array<string>;
            }[] = [];
            posts.forEach(async post => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const { _id, name, avatar } = await User.findById(post.userId);
                data.push({
                    userId: _id,
                    name: name,
                    avatar: avatar,
                    postId: post._id,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    content: post.content,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    image: post.image,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    likeBy: post.likeBy,
                });
                if (data.length === posts.length) {
                    return res.status(200).json({
                        success: true,
                        message: 'get list post',
                        data,
                    });
                }
            });
        })
        .catch(err =>
            res.status(500).json({
                success: false,
                message: 'cannot get posts',
                err,
            }),
        );
};

export const getCommentByPost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    await Comment.find({ postId: postId })
        .sort({ createdAt: 1 })
        .then(comments => {
            if (comments.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'post have not comment',
                });
            }
            let results: {
                key: string;
                userId: string;
                avatar: string;
                header: string;
                headerMedia: string;
                content: string;
                createdAt: number;
            }[] = [];
            comments.forEach(async comment => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await User.findById(comment.userId).then(user => {
                    results.push({
                        userId: user?._id,
                        key: comment._id,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        avatar: user.avatar,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        header: user.name,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        headerMedia: moment(comment.createdAt).fromNow(),
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        content: comment.content,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        createdAt: comment.createdAt,
                    });

                    if (results.length === comments.length) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        results = results.sort((x, y) => x.createdAt - y.createdAt);
                        return res.status(200).json({
                            success: true,
                            message: 'get comment by postId',
                            results,
                        });
                    }
                });
            });
        })
        .catch(err =>
            res.status(500).json({
                success: false,
                message: 'error when get comment by postId',
                err,
            }),
        );
};
