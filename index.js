import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import dns from 'dns';
import console from 'console';
import { createRemoteJWKSet, jwtVerify } from 'jose'


dns.setDefaultResultOrder("ipv4first");

const app = express();
const port = process.env.PORT;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());

const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
    )
    console.log(JWKS,"jwks");

const logger = ( req, res, next )=>{
  console.log(`${req.method} and ${req.url}`)
  next()
}

const verifyToken = async (req, res, next)=>{
  const {authorization} = req.headers
  const token = authorization?.split(' ')[1]
  if(!token){
    return res.status(401).json({message:"nigga"})
  }
  try {
    const JWKS = createRemoteJWKSet(
      new URL('http://localhost:3000/api/auth/jwks')
    )
    const { payload } = await jwtVerify(token, JWKS)
    console.log(payload); 
    req.user = payload
    next();
  } catch (error) {
    console.error('Token validation failed:', error)
    return res.status(401).json({message:"nigga"})
  }
}

export async function connectToMongoDB() {
  try {
    await client.connect();
    const db = client.db('pet_adoption');
    const petCollection = db.collection('pets');


    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });

    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.get('/pets', async (req, res) => {
      const cursor = await petCollection.find();
      const pets = await cursor.toArray();
      res.send(pets);
    });

    app.get('/pets/:id', logger, verifyToken, async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const pet = await petCollection.findOne(query);
      res.send(pet);
    });
    console.log("You successfully connected to MongoDB!!!!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}


await connectToMongoDB(); 

export default app;
