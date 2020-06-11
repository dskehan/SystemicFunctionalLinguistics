let express = require('express')
let router = express.Router()
let swaggerJsdoc = require('swagger-jsdoc');
let swaggerUi = require('swagger-ui-express');
let fs = require('file-system')
let path = require('path')

let modelPath = path.join(__dirname, '..', 'models/') 
let routesPath = path.join(__dirname, '..', 'routes/') 

const options = {
    "swaggerDefinition": {
        "openapi": "3.0.0",
        "info": {
          "title": "API for SFL Clause Management",
          "version": "1.0.0",
          "description":
            "API Documentation for clause management",
          "license": {
            "name": "MU",
            "url": "https://www.maynoothuniversity.ie/"
          },
          "contact": {
            "name": "David Skehan",
            "url": "https://swagger.io",
            "email": "david.skehan.2017@mumail.ie"
          }
        },
        "servers": [
          {
            "url": "http://localhost:3000/"
          }
        ]
      },

      "apis": [
          routesPath + "clause.js",
          routesPath + "threeStrandTables.js",
          routesPath + "oneStrandTables.js", 
          routesPath + "treeGeneration.js",
          routesPath + "user.js",
          modelPath + "clauseModel.js",
          modelPath + "userModel.js",

               
            
            ]

    }

const specs = swaggerJsdoc(options);
router.use("/docs", swaggerUi.serve);
router.get("/docs",swaggerUi.setup(specs, {explorer: true}));

module.exports = router