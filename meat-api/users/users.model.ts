import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'
import { validateCPF } from '../common/validators'
import { environment } from '../common/environment'

export interface User extends mongoose.Document {
    name: string,
    email: string,
    password: string
}

export interface UserModel extends mongoose.Model<User> {
    findByEmail(email: string): Promise<User>
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 80,
        minlength: 3
    },
    email: {
        type: String,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        required: true
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    gender: {
        type: String,
        required: false,
        enum: ['Male', 'Female', 'Other']
    },
    cpf: {
        type: String,
        required: false,
        validate: {
            validator: validateCPF,
            message: '{PATH}: Invalid CPF ({VALUE})'
        }
    }
})

userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email }) // {email: email}
}

const hashPassword = (obj, next) => {
    bcrypt.hash(obj.password, environment.security.saltRounds)
        .then(hash => {
            obj.password = hash
            next()
        })
        .catch(next)
}

const saveMiddleware = function (next) {
    const user: User = this // 'this' represents the document object
    if (!user.isModified('password'))
        next()
    else
        hashPassword(user, next)
}

const updateMiddleware = function (next) {
    if (!this.getUpdate().password) // this.getUpdate() returns the changes to be done in the document. 'this' represents the query object
        next()
    else
        hashPassword(this.getUpdate(), next)
}

userSchema.pre('save', saveMiddleware)
userSchema.pre('findOneAndUpdate', updateMiddleware) // PATCH method
userSchema.pre('update', updateMiddleware) // PUT method

export const User = mongoose.model<User, UserModel>('User', userSchema)