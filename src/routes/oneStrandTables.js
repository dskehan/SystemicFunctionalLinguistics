let ClauseModel = require('../models/clauseModel')
let auth = require('../middleware/auth')
let express = require('express')
let router = express.Router()

/**
 * @swagger
 * tags:
 *   name: One Strand Analysis
 *   description: One Strand Analysis Management URIs
 */

router.post('/oneStrand/UpdateOneStrandTableByText',  auth,  (req, res) => {

    if(!req.body){
        return res.status(400).send('Request body is empty!')
    }
    else{

        ClauseModel.updateOne(
            {
                "data.text" : req.body.text, 
                "metadata.createdBy" : req.body.createdBy
            }, //document to update
            {
                "data.analysis.oneStrand" : req.body.oneStrand
            }//vlaues to update with
        )
        .then(doc => {
            res.json("Success!")
          })
          .catch(err => {
            res.status(500).json(err)
          })

        //return res.status(200).send('not empty')
    }
})

/**
 * @swagger
 * path:
 *  /oneStrand/UpdateOneStrandTableByText/:
 *    post:
 *      summary: Update the one strand analysis of a clause
 *      tags: [One Strand Analysis]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 createdBy:
 *                  type: string 
 *                 oneStrand: 
 *                   type: object
 *                   description: Object containing One Strand analysis
 *                  
 *      responses:
 *        "200":
 *          description: A clause schema
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oneStrand: 
 *                   type: object
 *                   description: Object containing One Strand analysis
 *          "400":
 *              description: Not Found! Check request body! 
 */


router.post('/UpdateOneStrandTableByID', auth,  (req, res) => {

    if(!req.body){
        return res.status(400).send('Request body is empty!')
    }
    else{

        ClauseModel.updateOne(
            {
                "_id" : req.body._id
            }, //document to update
            {
                "data.analysis.oneStrand" : req.body.oneStrand
            }//vlaues to update with
        )
        .then(doc => {
          res.json("Success!")
          })
          .catch(err => {
            res.status(500).json(err)
          })

        //return res.status(200).send('not empty')

    }
})

/**
 * @swagger
 * path:
 *  /oneStrand/UpdateOneStrandTableByID/:
 *    post:
 *      summary: Update the one strand analysis of a clause
 *      tags: [One Strand Analysis]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 oneStrand: 
 *                   type: object
 *                   description: Object containing One Strand analysis
 *                  
 *      responses:
 *        "200":
 *          description: A clause schema
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oneStrand: 
 *                   type: object
 *                   description: Object containing One Strand analysis
 *          "400":
 *              description: Not Found! Check request body! 
 */




router.get('/oneStrand/getOneStrandByID/:id', auth,  (req, res) => {
    if(!req.params.id) {
      return res.status(400).send('Missing URL parameter: id')
    }

    ClauseModel.find(
      {"_id" : req.params.id},
       {"data.analysis.oneStrand": 1}
       )
      .then(doc => {
        res.json(doc)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  })

  /**
 * @swagger
 * path:
 *  /oneStrand/getOneStrandByID/{ClauseID}:
 *    get:
 *      summary: Get the One Strand Analysis data for a supplied Clause ID
 *      tags: [One Strand Analysis]
 *      parameters:
 *        - in: path 
 *          name: ClauseID 
 *          schema: 
 *            type: string
 *          required: true
 *          description: ID of the clause you wish to view. 
 *      responses:
 *        "200":
 *          description: A clause schema
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oneStrand: 
 *                   type: object
 *                   description: Object containing One Strand analysis
 *          "400":
 *              description: Not Found! Check request body! 
 */


router.get('/oneStrand/getOneStrandByText/:createdby/:text', auth,  (req, res) => {
    if(!req.params.text) {
      return res.status(400).send('Missing URL parameter: text')
    }
    if(!req.params.createdBy) {
        return res.status(400).send('Missing URL parameter: createdBy')
      }


    ClauseModel.find(
      {"data.text" : req.params.text, "metadata.createdBy" : req.params.createdBy},
      {"data.analysis.oneStrand": 1}
    )
      .then(doc => {
        res.json(doc)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  })

    /**
 * @swagger
 * path:
 *  /oneStrand/getOneStrandByText/{createdby}/{text}:
 *    get:
 *      summary: Get the One Strand Analysis of a Clause 
 *      tags: [One Strand Analysis]
 *      parameters:
 *        - in: path 
 *          name: createdby 
 *          schema: 
 *            type: string
 *          required: true
 *          description: URL encoded string of the user who owns the clause you wish to view.
 *        - in: path 
 *          name: text 
 *          schema: 
 *            type: string
 *          required: true
 *          description: URL encoded string of the text contained in the clause you wish to view.  
 *      responses:
 *        "200":
 *          description: A clause schema
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oneStrand: 
 *                   type: object
 *                   description: Object containing One Strand analysis
 *          "400":
 *              description: Not Found! Check request body! 
 */


module.exports = router