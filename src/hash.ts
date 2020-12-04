'use strict';
import crypto from 'crypto';

export const generateSalt = (rounds: number) => {
    if (rounds >= 15) {
        throw new Error(`${rounds} is greater than 15,Must be less that 15`);
    }
    if (typeof rounds !== 'number') {
        throw new Error('rounds param must be a number');
    }
    if (rounds == null) {
        rounds = 12;
    }

    return crypto
        .randomBytes(Math.ceil(rounds / 2))
        .toString('hex')
        .slice(0, rounds);
};

export const hasher = (password: string, salt: string) => {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        hashed: value,
    };
};

export const hash = async (password: string, salt: string) => {
    if (password == null || salt == null) {
        throw new Error('Must Provide Password and salt values');
    }
    if (typeof password !== 'string' || typeof salt !== 'string') {
        throw new Error('password must be a string and salt must either be a salt string or a number of rounds');
    }
    return hasher(password, salt);
};

export const compare = async (password: string, hash: { salt: string; hashed: string }) => {
    // hash = {
    //     salt: 'f844b09ff50c',
    //     hashedpassword: '2d2528d4534394d1e2702f53826d11c16ed4422f6bd466745cb4f1aa0e042b52b98fc5e65b86d73a6ce4807679b773fb955c4824b0471015354e1a872d42cb62'
    // }
    if (password == null || hash == null) {
        throw new Error('password and hash is required to compare');
    }
    if (typeof password !== 'string' || typeof hash !== 'object') {
        throw new Error('password must be a String and hash must be an Object');
    }
    const passwordData = hasher(password, hash.salt);
    if (passwordData.hashed === hash.hashed) {
        return true;
    }
    return false;
};
