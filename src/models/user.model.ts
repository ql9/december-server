import { model, Schema } from 'mongoose';

const UserSchema: Schema = new Schema({
    name: String,
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: Object,
        required: true,
        select: false,
    },
});

export const User = model('User', UserSchema);
