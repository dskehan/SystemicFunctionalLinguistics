let ClauseModel = require('../models/clauseModel')
let express = require('express')
let router = express.Router()
let auth = require('../middleware/auth')
let fs = require('file-system')


/**
 * @swagger
 * tags:
 *   name: Clause
 *   description: Clause Management URIs
 */


router.post('/clause/', auth, (req, res) => {
    
  if(!req.body){
      return res.status(400).send('Request body is empty!')
  }

  let model = new ClauseModel(req.body)
  var words = model.data.text.split(" ");
  var threeStrands = ["Exp", "Inter", "Text"];

  model.data.analysis = {
    oneStrand : {
      "One Strand Analysis" : ""
    }, 
    threeStrand : 
    {
      "Exp" : {

      },
      "Inter" : {
    
      }, 
      "Text" : {

      }
    }
  }

  for(var i =  0; i<words.length; i++){
    for(var j = 0; j<threeStrands.length; j++){
      model.data.analysis.threeStrand[threeStrands[j]][words[i]] = "";  
    }
  }

  model.metadata.createdBy = req.user.name
  model.metadata.createdByEmail = req.user.email

  model.save()
      .then(doc => {
          if(!doc || doc.length === 0){
          return res.status(500).send(doc) 
      }
      res.status(201).send(doc)
      })
      .catch(err => {
          res.status(500).json(err) 
      })
})

/**
 * @swagger
 * path:
 *  /clause/:
 *    post:
 *      summary: Create a new clause
 *      tags: [Clause]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Clause'
 *      responses:
 *        "200":
 *          description: A clause schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Clause'
 *          "400":
 *              description: Not Found! Check request body! 
 */

router.get('/clause/allUserData/', auth, async (req, res) => {
 
    ClauseModel.find({
      "metadata.createdBy" : req.user.name,
      "metadata.createdByEmail" : req.user.email
    })
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
 *  /clause/allUserData/:
 *    get:
 *      summary: Get all clause data for the users access token
 *      tags: [Clause]
 *      responses:
 *        "200":
 *          description: All clause data for the supplied access token
 *        "500":
 *          description: Failed to find user! Check access token!  
 */




router.get('/clause/getClauseByText/:createdby/:text',  auth, (req, res) =>{

  if(!req.params.text) {
    return res.status(400).send('Missing URL parameter: text')
  }
  if(!req.params.createdby) {
    return res.status(400).send('Missing URL parameter: createdBy')
  }

  ClauseModel.find({
    "data.text" : req.params.text, 
     "metadata.createdBy" : req.params.createdby
  })
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
 *  /clause/getClauseByID/{createdby}/{text}:
 *    get:
 *      summary: Get the Clause data for supplied Clause information
 *      tags: [Clause]
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
 *              schema:
 *                $ref: '#/components/schemas/Clause'
 *        "500":
 *          description: clause not found! Possibily the wrong URL parameters 
 */

router.get('/clause/getClauseByID/:id',  auth, (req, res) =>{

  if(!req.params.id) {
    return res.status(400).send('Missing URL parameter: id')
  }
  
  ClauseModel.find({ 
     "_id" : req.params.id
  })
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
 *  /clause/getClauseByID/{ClauseID}:
 *    get:
 *      summary: Get the Clause data for a supplied Clause ID
 *      tags: [Clause]
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
 *              schema:
 *                $ref: '#/components/schemas/Clause'
 *        "500":
 *          description: clause not found! Possibily the wrong URL parameters 
 */



router.get('/clause/clauseIDByText/:createdby/:text',  auth, (req, res) => {
  if(!req.params.text) {
    return res.status(400).send('Missing URL parameter: text')
  }
  if(!req.params.createdby) {
    return res.status(400).send('Missing URL parameter: createdBy')
  }

  ClauseModel.find(
    {"data.text" : req.params.text, "metadata.createdBy" : req.params.createdby},
     {_id: 1}
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
 *  /clause/clauseIDByText/{createdby}/{text}:
 *    get:
 *      summary: Get the ID of a Clause 
 *      tags: [Clause]
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
 *              schema:
 *                id : id
 *        "500":
 *          description: clause not found! Possibily the wrong URL parameters 
 */


router.delete('/clause/DeleteClauseByText',  auth, (req, res) =>{ 
  if(!req.body){
    return res.status(400).send("Request body is empty!"); 
  }
    ClauseModel.deleteOne({
      
      "data.text" : req.body.text, 
      "metadata.createdBy" : req.body.createdBy,
      "metadata.collection" : req.body.collection

    })
    .then(doc => {
      res.json("Success!" + doc)
    })
    .catch(err => {
      res.status(500).json(err)
    })
})


/**
 * @swagger
 * path:
 *  /clause/DeleteClauseByText:
 *    delete:
 *      summary: delete a clause using a clauses' text
 *      tags: [Clause]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:  
 *                text:
 *                 type: string
 *                createdBy: 
 *                  type: string
 *                collection: 
 *                  type: string
 *            example:
 *              text: Enraged cow injures farmer with axe
 *              createdBy: David Skehan
 *              collection: Sample Phrases
 *      responses:
 *        "200":
 *          description: A success message 
 *          "400":
 *              description: Not Found! Check request body! 
 */

router.delete('/clause/DeleteClauseByID',  auth,  (req, res) =>{ 
  if(!req.body){
    return res.status(400).send("Request body is empty!"); 
  }
    ClauseModel.deleteOne({
      "_id" : req.body.id

    })
    .then(doc => {
      res.json("Success!" + doc)
    })
    .catch(err => {
      res.status(500).json(err)
    })
})

/**
 * @swagger
 * path:
 *  /clause/DeleteClauseByID:
 *    delete:
 *      summary: delete a clause using an ID
 *      tags: [Clause]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:  
 *                id:
 *                 type: string
 *            example: 
 *              id: 59asdi123ijasidj
 *  
 *      responses:
 *        "200":
 *          description: A success message 
 *          "400":
 *              description: Not Found! Check request body! 
 */

router.get('/error', (req, res) =>{
  throw new Error("There has been an error!")
})

///////////////////////////////////
// the following routes should not be used in production
// they were made during testing and may still have use for testing in the future

//GET requests should not contain a body! 
// router.get('/clauseByID', (req, res) => {
//   if(!req.body._id) {
//     return res.status(400).send('Missing URL parameter: text')
//   }
//   console.log(req.body._id)
//   ClauseModel.findOne({
//     "_id" : req.body._id
//   })
//     .then(doc => {
//       res.json(doc)
//     })
//     .catch(err => {
//       res.status(500).json(err)
//     })
// })

// router.get('/clauseByText', (req, res) => {
//   if(!req.body.text) {
//     return res.status(400).send('Missing URL parameter: text')
//   }
//   if(!req.body.createdBy) {
//     return res.status(400).send('Missing URL parameter: createdBy')
//   }
//   console.log(req.body.text)
//   console.log(req.body.createdBy)
//   ClauseModel.find({
//     "data.text" : req.body.text, 
//      "metadata.createdBy" : req.body.createdBy
//   })
//     .then(doc => {
//       res.json(doc)
//     })
//     .catch(err => {
//       res.status(500).json(err)
//     })
// })

// router.get('/clauseIDByText', (req, res) => {
//   if(!req.body.text) {
//     return res.status(400).send('Missing URL parameter: text')
//   }
//   if(!req.body.createdBy) {
//     return res.status(400).send('Missing URL parameter: createdBy')
//   }
//   console.log(req.body.text)
//   console.log(req.body.createdBy)
//   ClauseModel.find(
//     {"data.text" : req.body.text, "metadata.createdBy" : req.body.createdBy},
//      {_id: 1}
//      )
//     .then(doc => {
//       res.json(doc)
//     })
//     .catch(err => {
//       res.status(500).json(err)
//     })
// })

//test function to return all database data, should not be used in production
//   router.get('/clause/allData', (req, res) =>{
 
//     ClauseModel.find(function (err, results){
//       })
//       .then(doc => {
//         res.json(doc)
//       })
//       .catch(err => {
//         res.status(500).json(err)
//       })
// });


// //Test Routes, not documented and should not be implimented on production. 
// router.post('/clause/createClauseTest', (req, res) => {
    
//   if(!req.body){
//       return res.status(400).send('Request body is empty!')
//   }

//   let model = new ClauseModel(req.body)
//   var words = model.data.text.split(" ");
//   var threeStrands = ["Exp", "Inter", "Text"];

//   model.data.analysis = {
//     oneStrand : {
//       "One Strand Analysis" : ""
//     }, 
//     threeStrand : 
//     {
//       "Exp" : {

//       },
//       "Inter" : {
    
//       }, 
//       "Text" : {

//       }
//     }
//   }

//   for(var i =  0; i<words.length; i++){
//     for(var j = 0; j<threeStrands.length; j++){
//       model.data.analysis.threeStrand[threeStrands[j]][words[i]] = "";  
//     }
//   }

//   model.save()
//       .then(doc => {
//           if(!doc || doc.length === 0){
//           return res.status(500).send(doc) 
//       }
//       res.status(201).send(doc)
//       })
//       .catch(err => {
//           res.status(500).json(err) 
//       })
// })



module.exports = router