const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const bnFilingsRouter = express.Router();

bnFilingsRouter.get('/:id', async (req, res) => {
  const entity = parseInt(req.params.id)

  try {
    const data = await pool.query('SELECT * FROM business_name_filings WHERE entity = $1 ORDER BY id ASC', [entity]); 

    if (data.rows.length === 0) {
      return res.status(404).json({message: 'Business Name Filings Not Found'});
    };

    const rawBusinessNameFilings = data.rows;
    const businessNameFilings = rawBusinessNameFilings.map( 
      BNF => {
        return (
          {
            id: BNF.id,
            entity: BNF.entity,
            businessName: BNF.business_name,
            jurisdiction: BNF.jurisdiction,
            subName: BNF.submitter_name,
            dueDate: BNF.due_date,
            confirmation: BNF.confirmation
          }
        )
      }            
    )
    res.status(200).send(businessNameFilings);
      
  } catch (error) {
    console.error(error);
    res.status(403).send({message: error.detail});
  }
});

bnFilingsRouter.put('/', async (req, res) => {
  const { entity, businessName, jurisdiction, subName, dueDate, confirmation, id } = req.body;

  try {
    const data = await pool.query(
      'UPDATE business_name_filings SET entity = $1, business_name = $2, jurisdiction = $3, submitter_name= $4, due_date = $5, confirmation = $6 WHERE id = $7 RETURNING *', [ entity, businessName, jurisdiction, subName, dueDate, confirmation, id  ]
    );

    if (data.rows.length === 0) {
      return res.sendStatus(404);
    };

    const BNF = data.rows[0];

    console.log(BNF);

    const updatedBusinessNameFiling = {
      id: BNF.id,
      entity: BNF.entity,
      businessName: BNF.business_name,
      jurisdiction: BNF.jurisdiction,
      subName: BNF.submitter_name,
      dueDate: BNF.due_date,
      confirmation: BNF.confirmation
    }

    console.log(updatedBusinessNameFiling);

    res.status(200).send(updatedBusinessNameFiling);
      
  } catch (error) {
    console.error(error);
    res.status(403).send({message: error.detail});
  }
});

bnFilingsRouter.post('/', async (req, res) => {
  const { entity, businessName, jurisdiction, subName, dueDate, confirmation} = req.body;

  try {
    const data = await pool.query(
      'INSERT INTO business_name_filings (entity, business_name, jurisdiction, submitter_name, due_date, confirmation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [entity, businessName, jurisdiction, subName, dueDate, confirmation]
    );

    if (data.rows.length === 0) {
      return res.sendStatus(400);
    };

    const BNF = data.rows[0];

    console.log(BNF);

    const newBusinessNameFiling = {
      id: BNF.id,
      entity: BNF.entity,
      businessName: BNF.business_name,
      jurisdiction: BNF.jurisdiction,
      subName: BNF.submitter_name,
      dueDate: BNF.due_date,
      confirmation: BNF.confirmation
    }

    console.log(newBusinessNameFiling);

    res.status(200).send(newBusinessNameFiling);
      
  } catch (error) {
    console.error(error);
    res.status(403).send({message: error.detail});
  }
});


module.exports = bnFilingsRouter;
