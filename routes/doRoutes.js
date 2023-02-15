const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const dORouter = express.Router();

dORouter.get('/:id', checkNotAuthenticated, async (req, res) => {
  const entity = parseInt(req.params.id)

  try {
    const data = await pool.query('SELECT * FROM directors_officers WHERE entity = $1 ORDER BY id ASC', [entity]); 

    if (data.rows.length === 0) {
      return res.status(200).json({message: 'D&O\'s Not Found'});
    };

    const rawDO = data.rows;
    const dOs = rawDO.map( 
      dO => {
        return (
          {
            id: dO.id,
            entity: dO.entity,
            name: dO.name,
            position: dO.position,
            status: dO.status,
            startDate: dO.start_date,
            address: dO.address,
            phone: dO.phone,
            email: dO.email,
            endDate: dO.end_date
          }
        )
      }            
    )
    res.status(200).json(dOs);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

dORouter.put('/', checkNotAuthenticated, async (req, res) => {
  const { entity, name, position, status, startDate, address, phone, email, endDate, id } = req.body;

  try {
    const data = await pool.query(
      'UPDATE directors_officers SET entity = $1, name = $2, position = $3, status= $4, start_date = $5, address = $6, phone = $7, email = $8, end_date = $9 WHERE id = $10 RETURNING *', [ entity, name, position, status, startDate, address, phone, email, endDate, id ]
    );

    if (data.rows.length === 0) {
      return res.status(404).json({message: 'D&O Not Found'});
    };

    const rawDO = data.rows[0];

    //console.log(rawDO);

    const updatedDO = {
      id: rawDO.id,
      entity: rawDO.entity,
      name: rawDO.name,
      position: rawDO.position,
      status: rawDO.status,
      startDate: rawDO.start_date,
      address: rawDO.address,
      phone: rawDO.phone,
      email: rawDO.email,
      endDate: rawDO.end_date
    }

    //console.log(updatedDO);

    res.status(200).json(updatedDO);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

dORouter.post('/', checkNotAuthenticated, async (req, res) => {
  const { entity, name, position, status, startDate, address, phone, email, endDate } = req.body;

  try {
    const data = await pool.query(
      'INSERT INTO directors_officers (entity, name, position, status, start_date, address, phone, email, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [entity, name, position, status, startDate, address, phone, email, endDate]
    );

    if (data.rows.length === 0) {
      return res.status(400).json({message: 'Bad Request'});
    };

    const rawDO = data.rows[0];

    const addedDO = {
      id: rawDO.id,
      entity: rawDO.entity,
      name: rawDO.name,
      position: rawDO.position,
      status: rawDO.status,
      startDate: rawDO.start_date,
      address: rawDO.address,
      phone: rawDO.phone,
      email: rawDO.email,
      endDate: rawDO.end_date
    }

    res.status(200).json(addedDO);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

module.exports = dORouter;