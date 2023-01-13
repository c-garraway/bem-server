const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const cFilingsRouter = express.Router();

cFilingsRouter.get('/:id', async (req, res) => {
  const entity = parseInt(req.params.id)

  try {
    const data = await pool.query('SELECT * FROM corporate_filings WHERE entity = $1 ORDER BY id ASC', [entity]); 

    if (data.rows.length === 0) {
      return res.status(404).json({message: 'Corporate Filings Not Found'});
    };

    const rawCorporateFilings = data.rows;
    const corporateFilings = rawCorporateFilings.map( 
      CF => {
        return (
          {
            id: CF.id,
            entity: CF.entity,
            jurisdiction: CF.jurisdiction,
            subName: CF.submitter_name,
            dueDate: CF.due_date,
            confirmation: CF.confirmation
          }
        )
      }            
    )
    res.status(200).send(corporateFilings);
      
  } catch (error) {
    console.error(error);
    res.status(403).send({message: error.detail});
  }
});

cFilingsRouter.put('/', async (req, res) => {
  const { entity, jurisdiction, subName, dueDate, confirmation, id } = req.body;

  try {
    const data = await pool.query(
      'UPDATE corporate_filings SET entity = $1, jurisdiction = $2, submitter_name= $3, due_date = $4, confirmation = $5 WHERE id = $6 RETURNING *', [ entity, jurisdiction, subName, dueDate, confirmation, id  ]
    );

    if (data.rows.length === 0) {
        return res.status(404).json({message: 'Corporate Filings Not Found'});
    };

    const CF = data.rows[0];

    console.log(CF);

    const updatedCorporateFiling = {
        id: CF.id,
        entity: CF.entity,
        jurisdiction: CF.jurisdiction,
        subName: CF.submitter_name,
        dueDate: CF.due_date,
        confirmation: CF.confirmation
    }

    console.log(updatedCorporateFiling);

    res.status(200).send(updatedCorporateFiling);
      
  } catch (error) {
    console.error(error);
    res.status(403).send({message: error.detail});
  }
});

cFilingsRouter.post('/', async (req, res) => {
  const { entity, jurisdiction, subName, dueDate, confirmation} = req.body;

  try {
    const data = await pool.query(
      'INSERT INTO corporate_filings (entity, jurisdiction, submitter_name, due_date, confirmation) VALUES ($1, $2, $3, $4, $5) RETURNING *', [entity, jurisdiction, subName, dueDate, confirmation]
    );

    if (data.rows.length === 0) {
        return res.status(400).json({message: 'Bad Request'});
    };

    const CF = data.rows[0];

    console.log(CF);

    const newCorporateFiling = {
        id: CF.id,
        entity: CF.entity,
        jurisdiction: CF.jurisdiction,
        subName: CF.submitter_name,
        dueDate: CF.due_date,
        confirmation: CF.confirmation
    }

    console.log(newCorporateFiling);

    res.status(200).send(newCorporateFiling);
      
  } catch (error) {
    console.error(error);
    res.status(403).send({message: error.detail});
  }
});


module.exports = cFilingsRouter;
