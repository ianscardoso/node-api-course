import { Router } from '../common/router'
import * as restify from 'restify'
import { User } from './users.model'
import { DocumentQuery } from 'mongoose';

class UsersRouter extends Router {
    constructor() {
        super()
        this.on('beforeRender', document => {
            document.password = undefined //or delete document.password
        })
    }

    applyRoutes(application: restify.Server) {
        application.get('/users', (req, res, next) => {
            User.find()
                .then(this.render(res, next))
        })

        application.get('/users/:id', (req, res, next) => {
            User.findById(req.params.id)
                .then(this.render(res, next))
        })

        application.post('/users', (req, res, next) => {
            let user = new User(req.body)
            user.save()
                .then(this.render(res, next))
        })

        application.put('/users/:id', (req, res, next) => {
            // in theory, PUT replaces an object, but the mongoose update() would partially update the document, hence this option to overwrite it
            const options = { overwrite: true }

            User.update({ _id: req.params.id }, req.body, options)
                .exec().then(result => {
                    if (result.n) {
                        return User.findById(req.params.id).exec()
                    } else {
                        res.send(404)
                    }
                })
                .then(this.render(res, next))
        })

        application.patch('/users/:id', (req, res, next) => {
            // by default findByIdAndUpdate() returns the old document (before update)
            // this option makes the findByIdAndUpdate() return the new document (with the updates apllied)
            const options = { new: true }

            User.findByIdAndUpdate(req.params.id, req.body, options)
                .then(this.render(res, next))
        })

        application.del('/users/:id', (req, res, next) => {
            User.remove({ _id: req.params.id })
                .exec().then((cmdResult: any) => {
                    if (cmdResult.result.n) {
                        res.send(204)
                    } else {
                        res.send(404)
                    }

                    return next()
                })
        })
    }
}

export const usersRouter = new UsersRouter()