let User = require('../models/userModel')
let express = require('express')
let router = express.Router()
let auth = require('../middleware/auth')


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management URIs
 */


router.post('/users', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

/**
 * @swagger
 * path:
 *  /users/:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Users'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Users'
 *          "400":
 *              description: Not Found! Check request body! 
 */

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})

/**
 * @swagger
 * path:
 *  /users/login:
 *    post:
 *      summary: Create a new user access token
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Users'
 *      responses:
 *        "200":
 *          description: An access token for a user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Users'
 */

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

/**
 * @swagger
 * path:
 *  /users/me/:
 *    get:
 *      summary: Get the profile for the user of the supplied access token
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: the user profile for the supplied access token
 *        "500":
 *          description: Failed to find user! Check access token!  
 */

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

/**
 * @swagger
 * path:
 *  /users/me/logout:
 *    post:
 *      summary: Create a new user access token
 *      tags: [Users]
 *      requestBody:
 *        required: false
 *      responses:
 *        "200":
 *          description: Deletes the current access token
 *        "400":
 *          description: Couldn't find the supplied access token 
 */

router.post('/users/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

/**
 * @swagger
 * path:
 *  /users/me/logoutall:
 *    post:
 *      summary: Deletes all access tokens for the supplied user 
 *      tags: [Users]
 *      requestBody:
 *        required: false
 *      responses:
 *        "200":
 *          description: Deletes all the current user's access token
 *        "400":
 *          description: Couldn't find the supplied access token 
 */


module.exports = router