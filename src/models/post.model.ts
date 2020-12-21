import { model, Schema } from 'mongoose';

const PostSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            trim: true,
            required: true,
        },
        image: {
            type: String,
            trim: true,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        likeBy: {
            type: Array,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

export const Post = model('Post', PostSchema);
