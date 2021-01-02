import app from './app';

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Listening as port ${PORT}`);
});

export default server;
