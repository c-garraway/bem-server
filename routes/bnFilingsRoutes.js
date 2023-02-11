const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const bnFilingsRouter = express.Router();

bnFilingsRouter.get('/:id', checkNotAuthenticated, async (req, res) => {
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
    res.status(200).json(businessNameFilings);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

bnFilingsRouter.put('/', checkNotAuthenticated, async (req, res) => {
  const { entity, businessName, jurisdiction, subName, dueDate, confirmation, id } = req.body;

  try {
    const data = await pool.query(
      'UPDATE business_name_filings SET entity = $1, business_name = $2, jurisdiction = $3, submitter_name= $4, due_date = $5, confirmation = $6 WHERE id = $7 RETURNING *', [ entity, businessName, jurisdiction, subName, dueDate, confirmation, id  ]
    );

    if (data.rows.length === 0) {
      return res.status(404).json({message: 'Business Name Filing Not Found'});
    };

    const BNF = data.rows[0];

    //console.log(BNF);

    const updatedBusinessNameFiling = {
      id: BNF.id,
      entity: BNF.entity,
      businessName: BNF.business_name,
      jurisdiction: BNF.jurisdiction,
      subName: BNF.submitter_name,
      dueDate: BNF.due_date,
      confirmation: BNF.confirmation
    }

    //console.log(updatedBusinessNameFiling);

    res.status(200).json(updatedBusinessNameFiling);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

bnFilingsRouter.post('/', checkNotAuthenticated, async (req, res) => {
  const { entity, businessName, jurisdiction, subName, dueDate, confirmation} = req.body;

  try {
    const data = await pool.query(
      'INSERT INTO business_name_filings (entity, business_name, jurisdiction, submitter_name, due_date, confirmation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [entity, businessName, jurisdiction, subName, dueDate, confirmation]
    );

    if (data.rows.length === 0) {
      return res.status(400).json({message: 'Bad Request'});
    };

    const BNF = data.rows[0];

    //console.log(BNF);

    const newBusinessNameFiling = {
      id: BNF.id,
      entity: BNF.entity,
      businessName: BNF.business_name,
      jurisdiction: BNF.jurisdiction,
      subName: BNF.submitter_name,
      dueDate: BNF.due_date,
      confirmation: BNF.confirmation
    }

    //console.log(newBusinessNameFiling);

    res.status(200).json(newBusinessNameFiling);
      
  } catch (error) {
    console.error(error);
    res.status(500).json({message: error});
  }
});

module.exports = bnFilingsRouter;