import { Request, Response } from 'express';
// import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'images');
    },
    filename: (_req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

export const upload = multer({ storage: storage }).single('file');

export const uploadImage = (req: Request, res: Response) => {
    upload(req, res, (err: any) => {
        // console.log(req.file);
        const { content } = req.body;
        console.log(content);
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }
        return res.status(200).send(req.file.filename);
    });
};
