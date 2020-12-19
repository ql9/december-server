import { model, Schema } from 'mongoose';

const CommentSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            trim: true,
            required: true,
        },
        postId: {
            type: String,
            trim: true,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const Comment = model('Comment', CommentSchema);
