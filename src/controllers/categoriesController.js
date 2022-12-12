import connection from '../dbStrategy/postgres.js';
import joi from 'joi';

  const categorySchema = joi.object({
    name: joi.string().required()
  })

export async function getCategories(req, res) {

    
    try{
      const { rows: categories } = await connection.query('SELECT * FROM categories');
      res.send(categories);
    }catch(error){
      res.sendStatus(500);
    }
  }


  export async function getCategorieById(req, res) {
    const { id } = req.params;
    const { rows: category } = await connection.query('SELECT * FROM categories WHERE id = $1', [
      id
    ]);
    res.send(category);
  }
  


  export async function createCategory(req, res){
    const newCategory = req.body;
    const { error } = categorySchema.validate(newCategory);

    if (error) {
      return res.sendStatus(400);
    }

    const { name : nameCategory } = newCategory;

    try{
      const categoryExists = await connection.query(
        `SELECT * FROM categories where name = $1`, [nameCategory]
      );

      if(categoryExists.rowCount > 0){
        console.log("Categoria já existe");
        return res.status(409).send("Categoria já existe!");
      }

      await connection.query(
        `INSERT INTO categories (name) values ($1)`, [nameCategory]
      )

      res.send("Categoria criada com sucesso").status(201);

    }catch(error){
      console.log(error);
      res.sendStatus(500);
    }

  }