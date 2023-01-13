const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const entityRouter = express.Router();

entityRouter.get('/:id', async (req, res) => {
    const userID = parseInt(req.params.id)

    try {
        const data = await pool.query('SELECT id, user_id, name, address, date_created, status, corp_id FROM entities WHERE user_id = $1 ORDER BY id ASC', [userID]); 
    
        if (data.rows.length === 0) {
          return res.status(404).json({message: 'Entities Not Found'});
        };

        const rawEntities = data.rows;
        const entities = rawEntities.map( 
          entity => {
            return (
              {
                id: entity.id,
                userID: entity.user_id,
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
        res.status(200).json(entities);
        
      } catch (error) {
        console.error(error);
        res.status(500).json({message: error});
    }
});

entityRouter.put('/', async (req, res) => {
    const { userID, name, address, dateCreated, status, corpID, id } = req.body;

    try {
        const data = await pool.query(
            'UPDATE entities SET user_id = $1, name = $2, address = $3, date_created = $4, status = $5, corp_id = $6 WHERE id = $7 RETURNING *', [userID, name, address, dateCreated, status, corpID, id]
            );
    
        if (data.rows.length === 0) {
          return res.status(404).json({message: 'Entity Not Found'});
        };

        const rawEntity = data.rows[0];

        const updatedEntity = {
          id: rawEntity.id,
          userID: rawEntity.user_id,
          name: rawEntity.name,
          address: rawEntity.address,
          dateCreated: rawEntity.date_created,
          status: rawEntity.status,
          corpID: rawEntity.corp_id,
        }
      
        res.status(200).json(updatedEntity);
        
      } catch (error) {
        console.error(error);
        res.status(500).json({message: error});
      }
});

entityRouter.post('/', async (req, res) => {
    const { userID, name, address, date_created, status, corpID } = req.body;

    try {
        const data = await pool.query(
            'INSERT INTO entities (user_id, name, address, date_created, status, corp_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [userID, name, address, date_created, status, corpID]
            );
    
        if (data.rows.length === 0) {
          return res.status(400).json({message: 'Bad Request'});
        };

        const rawEntity = data.rows[0];

        const addedEntity = {
          id: rawEntity.id,
          userID: rawEntity.user_id,
          name: rawEntity.name,
          address: rawEntity.address,
          dateCreated: rawEntity.date_created,
          status: rawEntity.status,
          corpID: rawEntity.corp_id,
        }
      
        res.status(200).json(addedEntity);
              
      } catch (error) {
        console.error(error);
        res.status(500).json({message: error});
      }
});

module.exports = entityRouter;