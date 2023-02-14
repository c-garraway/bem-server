const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const bnRouter = express.Router();

bnRouter.get('/:id', checkNotAuthenticated, async (req, res) => {
  const entity = parseInt(req.params.id)

  try {
    const data = await pool.query('SELECT * FROM business_names WHERE entity = $1 ORDER BY id ASC', [entity]); 

    if (data.rows.length === 0) {
      return res.status(200).json({message: 'Business Names Not Found'});
    };

    const rawBusinessNames = data.rows;
    const businessNames = rawBusinessNames.map( 
      BN => {
        return (
          {
            id: BN.id,
            entity: BN.entity,
            businessName: BN.business_name,
            jurisdiction: BN.jurisdiction,
            address: BN.address,
            creationDate: BN.creation_date,
            status: BN.status,
            closeDate: BN.close_date
          }
        )
      }            
    )
    res.status(200).json(businessNames);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

bnRouter.put('/', checkNotAuthenticated, async (req, res) => {
  const { entity, businessName, jurisdiction, address, creationDate, status, closeDate, id } = req.body;

  try {
    const data = await pool.query(
      'UPDATE business_names SET entity = $1, business_name = $2, jurisdiction = $3, address= $4, creation_date = $5, status = $6, close_date = $7 WHERE id = $8 RETURNING *', [ entity, businessName, jurisdiction, address, creationDate, status, closeDate, id  ]
    );

    if (data.rows.length === 0) {
      return res.status(404).json({message: 'Business Name Not Found'});

    };

    const BN = data.rows[0];

    //console.log(BN);

    const updatedBusinessName = {
      id: BN.id,
      entity: BN.entity,
      businessName: BN.business_name,
      jurisdiction: BN.jurisdiction,
      address: BN.address,
      creationDate: BN.creation_date,
      status: BN.status,
      closeDate: BN.close_date
    }

    //console.log(updatedBusinessName);

    res.status(200).json(updatedBusinessName);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

bnRouter.post('/', checkNotAuthenticated, async (req, res) => {
  const { entity, businessName, jurisdiction, address, creationDate, status, closeDate} = req.body;

  try {
    const data = await pool.query(
      'INSERT INTO business_names (entity, business_name, jurisdiction, address, creation_date, status, close_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [entity, businessName, jurisdiction, address, creationDate, status, closeDate]
    );

    if (data.rows.length === 0) {
      return res.status(400).json({message: 'Bad Request'});
    };

    const BN = data.rows[0];

    //console.log(BN);

    const newBusinessName = {
      id: BN.id,
      entity: BN.entity,
      businessName: BN.business_name,
      jurisdiction: BN.jurisdiction,
      address: BN.address,
      creationDate: BN.creation_date,
      status: BN.status,
      closeDate: BN.close_date
    }

    //console.log(newBusinessName);

    res.status(200).json(newBusinessName);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

module.exports = bnRouter;