import { model, Schema } from 'mongoose';

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        avatar: {
            type: String,
            trim: true,
            default: 'https://icon-library.com/images/default-profile-icon/default-profile-icon-5.jpg',
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
        follower: {
            type: Array,
            required: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export const User = model('User', UserSchema);
