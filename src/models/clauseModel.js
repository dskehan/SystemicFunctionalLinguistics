let mongoose = require('mongoose')

const uri = "mongodb+srv://dskehan:123skeener@skehan0-poaoy.azure.mongodb.net/clauseAnalysis?retryWrites=true&w=majority"
mongoose.connect(uri, {'useNewUrlParser': true, 'useUnifiedTopology': true})
mongoose.set('useCreateIndex', true)

let clauseSchema = new mongoose.Schema({
   
    data : {
        type: Object, 
        required: true,
        unique: false,

        text : {
            type: String, 
            required: true,
            unique: false 
        },
        notes : {
            type: String, 
            required: false,
            unique: false 
        },
        analysis: {
            type: Object, 
            required: false,
            unique: false,
            oneStrand: {
                type: Object, 
                required: false,
                unique: false 
            },
            threeStrand :{
                Exp :{
                    type: String, 
                    required: false,
                    unique: false 
                },
                Inter :{
                    type: String, 
                    required: false,
                    unique: false 

                },
                Text: {
                    type: String, 
                    required: false,
                    unique: false 
                }
            }
        }
    },
    metadata: {
        type: Object, 
        required: true,
        unique: false,

        createdBy: {
            type: String, 
            required: true,
            unique: false 
        },
        createdByEmail: {
            type: String, 
            required: true,
            unique: false 
        },
        collection: {
            type: String, 
            required: true,
            unique: false 
        },
        access: {
            type: Number, 
            required: true,
            unique: false 
        }
    }
    
})

module.exports = mongoose.model('Clause', clauseSchema)


/**
 * @swagger
 *  components:
 *    schemas:
 *      Clause:
 *        type: object
 *        properties:
 *          data:
 *            required:
 *              - text
 *            type: object
 *            properties:
 *              text:
 *                  type: string
 *                  description: The text of the clause to be analysed
 *              notes:
 *                  type: string
 *                  description: Aditional information pretaining to the clause
 *              analysis:
 *                  type: object
 *                  properties:
 *                      oneStrand:
 *                          type: object
 *                          description: Object containing oneStrand Anlaysis
 *                      threeStrand: 
 *                          type: object
 *                          properties:
 *                              Exp: 
 *                                  type: object
 *                                  description: Object containing Experiantal analysis
 *                              Inter:
 *                                  type: object
 *                                  description: Object containing Interpersonal analysis
 * 
 *                              Text:
 *                                  type: object
 *                                  description: Object containing Textual analysis 
 *   
 *            
 *          metadata:
 *              required:
 *                  - createdBy 
 *                  - createdByEmail
*                   - access 
 *                  - collection
 *              type: object
 *              properties:
 *                  createdBy:
 *                      type: string
 *                      description: Name of the user who created the clause, this should be included within the POSTed object, however it will be overwritten with User info
 *                  createdByEmail: 
 *                      type: string
 *                      description: Name of the user who created the clause, this should be included within the POSTed object, however it will be overwritten with User info
 *                  collection: 
 *                      type: string
 *                      description: Name of the collection the clause belongs to
 *                  access: 
 *                      type: number
 *                      description: access permission number 
 *               
 */