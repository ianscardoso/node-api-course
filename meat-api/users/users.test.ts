import 'jest'
import * as request from 'supertest'
import { Server } from '../server/server'
import { environment } from '../common/environment'
import { usersRouter } from './users.router'
import { User } from './users.model'

let address: string
let server: Server
beforeAll(() => {
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db'
    environment.server.port = process.env.SERVER_PORT || 3001
    address = `http://localhost:${environment.server.port}`
    server = new Server()

    return server.bootstrap([usersRouter])
        .then(() => User.remove({}).exec())
        .catch(console.error)
})

test('get /users', () => {
    return request(address)
        .get('/users')
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body.items).toBeInstanceOf(Array)
        })
        .catch(fail)
})

test('post /users', () => {
    return request(address)
        .post('/users')
        .send({
            name: 'user test',
            email: 'usertest@email.com',
            password: 'test',
            cpf: '962.116.531-82'
        })
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('user test')
            expect(response.body.email).toBe('usertest@email.com')
            expect(response.body.cpf).toBe('962.116.531-82')
            expect(response.body.password).toBeUndefined()
        })
        .catch(fail)
})

test('get /users/aaa - not found', () => {
    return request(address)
        .get('/users/aaa')
        .then(response => {
            expect(response.status).toBe(404)
        })
        .catch(fail)
})

test('patch /users/:id', () => {
    return request(address)
        .post('/users')
        .send({
            name: 'user test 2',
            email: 'usertest2@email.com',
            password: 'test'
        })
        .then(response =>
            request(address)
                .patch(`/users/${response.body._id}`)
                .send({
                    name: 'user test 2 - patch'
                }))
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('user test 2 - patch')
            expect(response.body.email).toBe('usertest2@email.com')
            expect(response.body.password).toBeUndefined()
        })
        .catch(fail)
})

afterAll(() => {
    return server.shutdown()
})