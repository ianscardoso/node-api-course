import * as restify from 'restify'
import { Restaurant } from './restaurants.model'
import { NotFoundError } from 'restify-errors'
import { ModelRouter } from '../common/model-router';

class RestaurantsRouter extends ModelRouter<Restaurant>{
    constructor() {
        super(Restaurant)
    }

    findMenu = (req, res, next) => {
        Restaurant.findById(req.params.id, "+menu")
            .then(restaurant => {
                if (!restaurant)
                    throw new NotFoundError('Restaurant not found')
                else {
                    res.json(restaurant.menu)

                    return next()
                }
            })
            .catch(next)
    }

    replaceMenu = (req, res, next) => {
        Restaurant.findById(req.params.id)
            .then(restaurant => {
                if (!restaurant)
                    throw new NotFoundError('Restaurant not found')
                else {
                    restaurant.menu = req.body

                    return restaurant.save()
                }
            })
            .then(restaurant => {
                res.json(restaurant.menu)

                return next()
            })
            .catch(next)
    }

    applyRoutes(application: restify.Server) {
        application.get('/restaurants', this.findAll)
        application.get('/restaurants/:id', [this.validateId, this.findById])
        application.post('/restaurants', this.save)
        application.put('/restaurants/:id', [this.validateId, this.replace])
        application.patch('/restaurants/:id', [this.validateId, this.update])
        application.del('/restaurants/:id', [this.validateId, this.delete])

        application.get('/restaurants/:id/menu', [this.validateId, this.findMenu])
        application.put('/restaurants/:id/menu', [this.validateId, this.replaceMenu])
    }
}

export const restaurantsRouter = new RestaurantsRouter()