import { model, Schema } from 'mongoose';

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: false,
            unique: true,
            lowercase: true,
        },
        password: {
            type: Object,
            required: true,
            select: false,
        },
        role: {
            type: String,
            default: 'subscriber',
        },
        facebook_id: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

export const User = model('User', UserSchema);
