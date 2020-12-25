import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { Request, Response } from 'express';
import moment from 'moment';

function compare(a: any, b: any) {
    if (a.updatedAt < b.updatedAt) {
        return 1;
    }
    if (a.updatedAt > b.updatedAt) {
        return -1;
    }
    return 0;
}

export const get = async (req: Request, res: Response) => {
    await Post.find()
        .then(posts => {
            if (posts.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'no post yet',
                });
            }
            posts = posts.sort(compare);
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
            posts = posts.sort(compare);
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
export const getPosts = async (req: Request, res: Response) => {
    const { userId } = req.params;
    await User.find({ follower: userId })
        .then(async users => {
            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'you are not following anybody',
                });
            }
            users.forEach(async user => {
                await Post.find({ userId: user._id })
                    .then(posts => {
                        if (posts.length === 0) {
                            res.status(404).json({
                                success: false,
                                message: 'no post yet',
                            });
                        }
                        posts = posts.sort(compare);
                        const results: {
                            userId: string;
                            name: string;
                            avatar: string;
                            postId: string;
                            content: string;
                            image: string;
                        }[] = [];
                        posts.forEach(async post => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            const { _id, name, avatar } = await User.findById(post.userId);
                            results.push({
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
                            });
                            if (posts.length === results.length) {
                                return res.status(200).json({
                                    success: true,
                                    message: 'get list post',
                                    results,
                                });
                            }
                        });
                    })
                    .catch(err =>
                        res.status(401).json({
                            success: false,
                            message: 'error when get post',
                            err,
                        }),
                    );
            });
        })
        .catch(err =>
            res.status(500).json({
                success: false,
                message: 'error when get post',
                err,
            }),
        );
};

export const getCommentByPost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    await Comment.find({ postId: postId })
        .then(comments => {
            if (comments.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'post have not comment',
                });
            }
            const results: {
                key: string;
                userId: string;
                avatar: string;
                header: string;
                headerMedia: string;
                content: string;
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
                        headerMedia: moment(comment.updatedAt).format('ll'),
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        content: comment.content,
                    });

                    if (results.length === comments.length) {
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
