import app from './app';

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Listening as port 5000');
});

export default server;
