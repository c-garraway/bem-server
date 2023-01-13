const express = require('express');
const { checkAuthenticated, checkNotAuthenticated } = require('../utilities/utility')
const { pool } = require('../config/dbConfig')

const cjRouter = express.Router();

cjRouter.get('/:id', async (req, res) => {
  const entity = parseInt(req.params.id)

  try {
    const data = await pool.query('SELECT * FROM corporate_jurisdictions WHERE entity = $1 ORDER BY id ASC', [entity]); 

    if (data.rows.length === 0) {
      return res.status(404).json({message: 'Corporate Jurisdictions Not Found'});
    };

    const rawCorporateJurisdictions = data.rows;
    const corporateJurisdictions = rawCorporateJurisdictions.map( 
      CJ => {
        return (
          {
            id: CJ.id,
            entity: CJ.entity,
            jurisdiction: CJ.jurisdiction,
            status: CJ.status,
            startDate: CJ.start_date,
            endDate: CJ.end_date
          }
        )
      }            
    )
    res.status(200).json(corporateJurisdictions);
      
  } catch (error) {
    console.error(error);
    res.status(403).json({message: error.detail});
  }
});

cjRouter.put('/', async (req, res) => {
  const { entity, jurisdiction, status, startDate, endDate, id } = req.body;

  try {
    const data = await pool.query(
      'UPDATE corporate_jurisdictions SET entity = $1, jurisdiction = $2, status = $3, start_date = $4, end_date = $5 WHERE id = $6 RETURNING *', [ entity, jurisdiction, status, startDate, endDate, id ]
    );

    if (data.rows.length === 0) {
        return res.status(404).json({message: 'Corporate Jurisdictions Not Found'});
    };

    const CJ = data.rows[0];

    console.log(CJ);

    const updatedCorporateJurisdiction = {
        id: CJ.id,
        entity: CJ.entity,
        jurisdiction: CJ.jurisdiction,
        status: CJ.status,
        startDate: CJ.start_date,
        endDate: CJ.end_date
    }

    console.log(updatedCorporateJurisdiction);

    res.status(200).json(updatedCorporateJurisdiction);
      
  } catch (error) {
    console.error(error);
    res.status(403).json({message: error.detail});
  }
});

cjRouter.post('/', async (req, res) => {
  const { entity, jurisdiction, status, startDate, endDate} = req.body;

  try {
    const data = await pool.query(
      'INSERT INTO corporate_jurisdictions (entity, jurisdiction, status, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *', [entity, jurisdiction, status, startDate, endDate]
    );

    if (data.rows.length === 0) {
        return res.status(400).json({message: 'Bad Request'});
    };

    const CJ = data.rows[0];

    console.log(CJ);

    const newCorporateJurisdiction = {
        id: CJ.id,
        entity: CJ.entity,
        jurisdiction: CJ.jurisdiction,
        status: CJ.status,
        startDate: CJ.start_start,
        endDate: CJ.end_date
    }

    console.log(newCorporateJurisdiction);

    res.status(200).json(newCorporateJurisdiction);
      
  } catch (error) {
    console.error(error);
    res.status(403).json({message: error.detail});
  }
});


module.exports = cjRouter;
