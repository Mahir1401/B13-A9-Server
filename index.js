import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient } from 'mongodb';
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

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
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
