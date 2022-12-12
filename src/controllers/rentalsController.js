import connection from '../dbStrategy/postgres.js';
import joi from 'joi';
import dayjs from 'dayjs';

const customerSchema = joi.object({
    customerId: joi.number().required(),
    gameId: joi.number().required(),
    daysRented: joi.number().required()
  })

  export async function getRentals(req, res){
    try{
        const customerId = req.query.customerId;
        const gameId = req.query.gameId;
        let rentals;

        if(customerId){
            const { rows } = await connection.query('SELECT rentals.*, customers."id" as "customer_Id", customers."name" as "customerName", games."id" as "game_Id", games."name" as "gameName", categories."id" as "category_Id", categories."name" as "categoryName" from rentals \
            inner join games on games.id = rentals."gameId" \
            inner join customers on customers.id = rentals."customerId" \
            inner join categories on categories.id = games."categoryId" \
            WHERE "customerId" = $1', [customerId]); 
            rentals = [...rows];
        }
        
        else if(gameId){
            const { rows } = await connection.query('SELECT rentals.*, customers."id" as "customer_Id", customers."name" as "customerName", games."id" as "game_Id", games."name" as "gameName", categories."id" as "category_Id", categories."name" as "categoryName" from rentals \
            inner join games on games.id = rentals."gameId" \
            inner join customers on customers.id = rentals."customerId" \
            inner join categories on categories.id = games."categoryId" \
            WHERE "gameId" = $1', [gameId]);
            rentals = [...rows];
        }else{
            const { rows } = await connection.query('SELECT rentals.*, customers."id" as "customer_Id", customers."name" as "customerName", games."id" as "game_Id", games."name" as "gameName", categories."id" as "category_Id", categories."name" as "categoryName" from rentals \
            inner join games on games.id = rentals."gameId" \
            inner join customers on customers.id = rentals."customerId" \
            inner join categories on categories.id = games."categoryId"');
            rentals = [...rows];
        }

        let rentalsJoin = [...rentals];
        for(let i=0; i<rentalsJoin.length;i++){
            let customer;
            let game;

            customer = { id: rentalsJoin[i].customer_Id, name: rentalsJoin[i].customerName };
            game = { id: rentalsJoin[i].game_Id, name: rentalsJoin[i].gameName, categoryId: rentalsJoin[i].category_Id, categoryName: rentalsJoin[i].categoryName };

            delete rentalsJoin[i].customer_Id; delete rentalsJoin[i].customerName;
            delete rentalsJoin[i].game_Id; delete rentalsJoin[i].gameName; delete rentalsJoin[i].category_Id; delete rentalsJoin[i].categoryName;

            rentalsJoin[i] = { ...rentalsJoin[i], customer: {...customer}, game: {...game} };
        }

        return res.send(rentalsJoin);

    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }

  export async function insertRental(req, res){
    try{
        const newRental = req.body;
        const { error } = customerSchema.validate(newRental);
        if (error) return res.sendStatus(400);
        
        const { customerId, gameId, daysRented } = newRental;
        const rentDate = dayjs().format("YYYY-MM-DD");

        const customer = await connection.query(`SELECT * FROM customers where id = $1`, [customerId]);
        if(customer.rowCount === 0){
          return res.status(400).send("Cliente não existe");
        }

        const game = await connection.query(`SELECT * FROM games where id = $1`, [gameId]);
        if(game.rowCount === 0){
          return res.status(400).send("Jogo não existe");
        }
        
        const gamePricePerDay = game.rows[0].pricePerDay;
        const originalPrice = Number(gamePricePerDay) * Number(daysRented);
        
        const returnDate = '';
        const delayFee = 'null';

        const totalGameRented = await (await connection.query(`SELECT count(id) as "totalGameRented" FROM rentals where id = $1`, [gameId])).rows[0].totalGameRented;
        const gameStockTotal = game.rows[0].stockTotal;
        if(totalGameRented >= gameStockTotal){
            return res.status(400).send("Jogo não disponível no estoque");
        }

        await connection.query(
            `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") values ($1, $2, $3, $4, null, $5, null)`, [customerId, gameId, rentDate, daysRented,  originalPrice]
          )
    
        res.sendStatus(200);
        
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }

  export async function finishRental(req, res){
    try{
      const { id } = req.params;
      const { rows: rental } = await connection.query('select * from rentals join games on rentals."gameId" = games.id WHERE rentals.id = $1', [id]);
      const returnDate = dayjs().format("YYYY-MM-DD");
      let delayFee = 0;

      if(!rental[0]){
        return res.sendStatus(404);
      }

      if(rental[0].returnDate !== null){
        return res.sendStatus(400);
      }

      const rentalDate = dayjs(rental[0].rentDate).format('YYYY-MM-DD');
      const daysRented = rental[0].daysRented;
      const limitDate = dayjs(rentalDate).add(daysRented, 'day').format('YYYY-MM-DD');
      
    
      const diffDates = (dayjs(limitDate).unix() - dayjs(returnDate).unix()) / 60 / 60 / 24;
      const pricePerDay = rental[0].pricePerDay;
      if(diffDates < 0){
        delayFee = (pricePerDay * diffDates) * -1;
      }

      await connection.query(
        `UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 where id = $3`, [returnDate, delayFee, id]
      ) 

      res.sendStatus(200);

    }catch(error){
      console.log(error);
      res.sendStatus(500);
    }
  }

  export async function deleteRental(req, res){
    const { id } = req.params;
    const { rows: rental } = await connection.query('select * from rentals WHERE rentals.id = $1', [id]);
    if(!rental[0]){
      return res.sendStatus(404);
    }

    if(rental[0].returnDate === null){
      return res.sendStatus(400);
    }

    await connection.query(
      `delete from rentals where id = $1`, [id]
    );

    res.sendStatus(200);
  }