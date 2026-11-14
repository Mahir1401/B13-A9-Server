import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import dns from 'dns';
import console from 'console';

dns.setDefaultResultOrder("ipv4first");

const app = express();
const port = process.env.PORT;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());

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

    app.get('/pets/:id', async (req, res) => {
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

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  // await client.close();
}
connectToMongoDB(); 

export default app;
