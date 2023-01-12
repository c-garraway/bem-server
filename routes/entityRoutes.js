const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const entityRouter = express.Router();

entityRouter.get('/:id', async (req, res) => {
    const user_id = parseInt(req.params.id)

    try {
        const data = await pool.query('SELECT id, user_id, name, address, date_created, status, corp_id FROM entities WHERE user_id = $1 ORDER BY id ASC', [user_id]); 
    
        if (data.rows.length === 0) {
          return res.status(404).json({message: 'Entity Not Found'});
          //return res.sendStatus(404);
          //res.status(401).json({message: 'Invalid Credentials'});
        };

        const rawEntities = data.rows;
        const entities = rawEntities.map( 
            entity => {
                return (
                    {
                        id: entity.id,
                        user_id: entity.user_id,
                        name: entity.name,
                        address: entity.address,
                        dateCreated: entity.date_created,
                        status: entity.status,
                        corpID: entity.corp_id,
                        corporateJurisdictions: [],
                        corporateFilings: [],
                        dO: [],
                        businessNames: [],
                        businessNameFilings: []
                    }
                )
            }            
        )
        res.status(200).send(entities);
        
      } catch (error) {
        console.error(error);
        res.status(403).send({message: error.detail});
    }
});

entityRouter.put('/', async (req, res) => {
    const { user_id, name, address, date_created, status, corp_id, id } = req.body;

    try {
        const data = await pool.query(
            'UPDATE entities SET user_id = $1, name = $2, address = $3, date_created = $4, status = $5, corp_id = $6 WHERE id = $7 RETURNING *', [user_id, name, address, date_created, status, corp_id, id ]
            );
    
        if (data.rows.length === 0) {
          return res.sendStatus(404);
        };

        const entity = data.rows;
      
        res.status(200).send(entity);
        
      } catch (error) {
        console.error(error);
        res.status(403).send({message: error.detail});
      }
});

entityRouter.post('/', async (req, res) => {
    const { user_id, name, address, date_created, status, corp_id } = req.body;

    try {
        const data = await pool.query(
            'INSERT INTO entities (user_id, name, address, date_created, status, corp_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user_id, name, address, date_created, status, corp_id]
            );
    
        if (data.rows.length === 0) {
          return res.sendStatus(400);
        };

        const entity = data.rows;
      
        res.status(200).send(entity);
        
      } catch (error) {
        console.error(error);
        res.status(403).send({message: error.detail});
      }
});


module.exports = entityRouter;
