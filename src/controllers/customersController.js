import connection from '../dbStrategy/postgres.js';
import joi from 'joi';

const customerSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().required().regex(/^[0-9]{10,11}$/),
    cpf: joi.string().required().regex(/^[0-9]{11}$/),
    birthday: joi.string().required().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
  })

  export async function getCustomers(req, res) { 
    try{
        const cpf = req.query.cpf;

        if(cpf){
            const { rows: customers } = await connection.query('SELECT * FROM customers WHERE cpf like $1', ['%' + cpf + '%']);
            return res.send(customers);
        }
        
        const { rows: customers } = await connection.query('SELECT * FROM customers');
        res.send(customers);
    }catch(error){
        res.sendStatus(500);
    }
  }

  export async function getCustomerById(req, res) {
    try{
        const { id } = req.params;
        const { rows: customer } = await connection.query('SELECT * FROM customers WHERE id = $1', [id]);
    
        if(!customer.length){
            return res.sendStatus(404);
        }
    
        res.status(200).send(customer);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }
  
  export async function insertCustomer(req, res){
    try{
        const newCustomer = req.body;
        const { error } = customerSchema.validate(newCustomer);
        if (error) return res.sendStatus(400);
        
        const { name, phone, cpf, birthday } = newCustomer;

        const cpfExists = await connection.query(`SELECT * FROM customers where cpf = $1`, [cpf]);
        
        if(cpfExists.rowCount > 0){
          console.log("CPF já existe");
          return res.status(409).send("CPF já existe");
        }

        await connection.query(
            `INSERT INTO customers (name, "phone", "cpf", "birthday") values ($1, $2, $3, $4)`, [name, phone, cpf, birthday]
          )
    
          res.sendStatus(201);
        
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }


  export async function updateCustomer(req, res){
    try{
        const { id } = req.params;

        const newCustomer = req.body;
        const { error } = customerSchema.validate(newCustomer);
        if (error) return res.sendStatus(400);
        
        const { name, phone, cpf, birthday } = newCustomer;

        const cpfExists = await connection.query(`SELECT * FROM customers where cpf = $1`, [cpf]);
        
        if(cpfExists.rowCount > 0){
          console.log("CPF já existe");
          return res.status(409).send("CPF já existe");
        }

        await connection.query(
            `UPDATE customers SET name=$1, "phone"=$2, "cpf"=$3, "birthday"=$4 where id = $5`, [name, phone, cpf, birthday, id]
          ) 
        
        res.sendStatus(200);
        
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }