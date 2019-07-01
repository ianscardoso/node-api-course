import * as restify from 'restify'

const server = restify.createServer({
    name: 'meat-api',
    version: '1.0.0'
})

server.use(restify.plugins.queryParser())

server.get('/hello', (req, res, next) => {
    res.json({ message: 'hello' });
    return next();
})

server.get('/info',
    [(req, res, next) => { // it is possible to pass an array of callbacks
        if (req.userAgent() && req.userAgent().includes('MSIE 7.0')) {
            // res.status(400);
            // res.json({ message: 'Please, update your browser' });

            // return next(false); // false skips the callback below

            let error: any = new Error();
            error.statusCode = 400;
            error.message = 'Please, update your browser';

            return next(error);
        }

        return next()
    },
    (req, res, next) => {
        res.json({
            browser: req.userAgent(),
            method: req.method,
            url: req.href(),
            path: req.path(),
            query: req.query
        })

        return next();
    }])

server.listen(3000, () => {
    console.log('API is running on http://localhost:3000');
})