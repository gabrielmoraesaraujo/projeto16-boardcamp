import connection from '../dbStrategy/postgres.js';
import joi from 'joi';

  const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().required(),
    stockTotal: joi.number().positive().greater(0).required(),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().positive().greater(0).required(),
  })

export async function getGames(req, res) {

    
    try{
      const { rows: games } = await connection.query('SELECT * FROM games');
      res.send(games);
    }catch(error){
      res.sendStatus(500);
    }
  }


  export async function insertGame(req, res){
    const newGame = req.body;
    const { error } = gameSchema.validate(newGame);
    if (error) {
        return res.sendStatus(400);
      }
    

    const { name : nameGame, image, stockTotal, categoryId, pricePerDay  } = newGame;


    try{
      const gameExists = await connection.query(
        `SELECT * FROM games where name = $1`, [nameGame]
      );

      if(gameExists.rowCount > 0){
        console.log("Jogo já existe");
        return res.status(409).send("Jogo já existe");
      }

      await connection.query(
        `INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") values ($1, $2, $3, $4, $5)`, [nameGame, image, stockTotal, categoryId, pricePerDay]
      )

      res.sendStatus(201);

    }catch(error){
      console.log(error);
      res.sendStatus(500);
    }

  }