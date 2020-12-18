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
            required: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: Object,
            required: true,
            select: false,
        },
        role: {
            type: String,
            default: 'user',
        },
    },
    {
        timestamps: true,
    },
);

export const User = model('User', UserSchema);
