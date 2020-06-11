let ClauseModel = require('../models/clauseModel')
let auth = require('../middleware/auth')
let express = require('express')
let router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Three Strand Analysis
 *   description: Three Strand Analysis Management URIs
 */

router.post('/threestrand/UpdateThreeStrandTableByText', auth,  (req, res) => {

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
                "data.analysis.threeStrand.Exp" : req.body.threeStrand.Exp,
                "data.analysis.threeStrand.Inter" : req.body.threeStrand.Inter,
                "data.analysis.threeStrand.Text" : req.body.threeStrand.Text
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
 *  /threestrand/UpdateThreeStrandTableByText/:
 *    post:
 *      summary: Update the three strand analysis of a clause
 *      tags: [Three Strand Analysis]
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
 *                 Exp: 
 *                   type: object
 *                   description: Object containing Experiantal analysis
 *                 Inter:
 *                  type: object
 *                  description: Object containing Interpersonal analysis
 *                 Text:
 *                  type: object
 *                  description: Object containing Textual analysis 
 *                  
 *      responses:
 *        "200":
 *          description: A clause schema
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Exp: 
 *                   type: object
 *                   description: Object containing Experiantal analysis
 *                 Inter:
 *                  type: object
 *                  description: Object containing Interpersonal analysis
 * 
 *                 Text:
 *                  type: object
 *                  description: Object containing Textual analysis 
 *          "400":
 *              description: Not Found! Check request body! 
 */

router.post('/threestrand/UpdateThreeStrandTableByID', auth,  (req, res) => {

    if(!req.body){
        return res.status(400).send('Request body is empty!')
    }
    else{
        ClauseModel.updateOne(
            {
                "_id" : req.body.id
            }, //document to update
            {
                "data.analysis.threeStrand.Exp" : req.body.threeStrand.Exp,
                "data.analysis.threeStrand.Inter" : req.body.threeStrand.Inter,
                "data.analysis.threeStrand.Text" : req.body.threeStrand.Text
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
 *  /threestrand/UpdateThreeStrandTableByID/:
 *    post:
 *      summary: Update the three strand analysis of a clause
 *      tags: [Three Strand Analysis]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                  type: string 
 *                 Exp: 
 *                   type: object
 *                   description: Object containing Experiantal analysis
 *                 Inter:
 *                  type: object
 *                  description: Object containing Interpersonal analysis
 *                 Text:
 *                  type: object
 *                  description: Object containing Textual analysis 
 *                  
 *      responses:
 *        "200":
 *          description: A clause schema
 *          content:
 *            application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Exp: 
 *                   type: object
 *                   description: Object containing Experiantal analysis
 *                 Inter:
 *                  type: object
 *                  description: Object containing Interpersonal analysis
 * 
 *                 Text:
 *                  type: object
 *                  description: Object containing Textual analysis 
 *          "400":
 *              description: Not Found! Check request body! 
 */

  router.get('/threestrand/getThreeStrandByID/:id', auth,  (req, res) => {
    if(!req.params.id) {
      return res.status(400).send('Missing URL parameter: id')
    }

    ClauseModel.find(
      {"_id" : req.params.id},
      {"data.analysis.threeStrand": 1}
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
 *  /threestrand/getThreeStrandByID/{ClauseID}:
 *    get:
 *      summary: Get the Three Strand Analysis data for a supplied Clause ID
 *      tags: [Three Strand Analysis]
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
 *                 Exp: 
 *                   type: object
 *                   description: Object containing Experiantal analysis
 *                 Inter:
 *                  type: object
 *                  description: Object containing Interpersonal analysis
 * 
 *                 Text:
 *                  type: object
 *                  description: Object containing Textual analysis 
 *          "400":
 *              description: Not Found! Check request body! 
 */


  router.get('/threestrand/getThreeStrandByText/:createdby/:text', auth,  (req, res) => {
    if(!req.params.text) {
      return res.status(400).send('Missing URL parameter: text')
    }
    if(!req.params.createdby) {
        return res.status(400).send('Missing URL parameter: createdBy')
      }

    ClauseModel.find(
      {"data.text" : req.params.text, "metadata.createdBy" : req.params.createdby},
      {"data.analysis.threeStrand": 1}
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
 *  /threestrand/getThreeStrandByText/{createdby}/{text}:
 *    get:
 *      summary: Get the Three Strand Analysis of a Clause 
 *      tags: [Three Strand Analysis]
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
 *                 Exp: 
 *                   type: object
 *                   description: Object containing Experiantal analysis
 *                 Inter:
 *                  type: object
 *                  description: Object containing Interpersonal analysis
 * 
 *                 Text:
 *                  type: object
 *                  description: Object containing Textual analysis 
 *          "400":
 *              description: Not Found! Check request body! 
 */


///////////////////////////////////
// the following routes should not be used in production
// they were made during testing and may still have use for testing in the future
  router.get('/threestrand/getThreeStrandByID', (req, res) => {
    if(!req.body._id) {
      return res.status(400).send('Missing URL parameter: id')
    }

    ClauseModel.find(
      {"_id" : req.body._id},
      {"data.analysis.threeStrand": 1}

    )
      .then(doc => {
        res.json(doc)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  })

  router.get('/threestrand/getThreeStrandByText', (req, res) => {
    if(!req.body.text) {
      return res.status(400).send('Missing URL parameter: text')
    }
    if(!req.body.createdBy) {
        return res.status(400).send('Missing URL parameter: createdBy')
      }

    ClauseModel.find(
      {"data.text" : req.body.text, "metadata.createdBy" : req.body.createdBy},
      {"data.analysis.threeStrand": 1}
    )
      .then(doc => {
        res.json(doc)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  })

  router.get('/threestrand/getClauseByID123/:id', (req, res) =>{

    ClauseModel.find({ 
      "_id" : req.params.id
   })
      .then(doc => {
        var x = getThreeStrandValues(doc)
        res.json(x)
      })
      .catch(err => {
        res.status(500).json(err)
      })
  })
  
  function getThreeStrandValues(doc){
  
    expArray = ["Exp"];
    interArray = ["Inter"]; 
    textArray = ["Text"];
    returnArray = []
  
    var obj = doc[0].data.analysis.threeStrand.Exp;
    
    var keys = Object.keys(obj);
    console.log(keys)
  
    for(var i = 0; i < keys.length; i++){
      expArray.push(doc[0].data.analysis.threeStrand.Exp[keys[i]]);
      interArray.push(doc[0].data.analysis.threeStrand.Inter[keys[i]]);
      textArray.push(doc[0].data.analysis.threeStrand.Text[keys[i]]);
    }
    returnArray.push(expArray)
    returnArray.push(interArray)
    returnArray.push(textArray)
  
    var TSTValues = { id: 0, values: [], colspanArray: [], headings: [] };
    TSTValues.values = returnArray
    TSTValues.headings = keys
  
    return TSTValues
  }


module.exports = router