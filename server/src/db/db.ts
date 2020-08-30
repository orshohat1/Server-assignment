import { MongoClient, Db } from 'mongodb';

let client: MongoClient;

export async function connect(): Promise<Db> {
    if (!client) {
        client = await MongoClient.connect('mongodb://localhost:27017');
    }
    return client.db('devOps');
}

export async function closeDb() {
    if (!client) {
        return;
    }

    client.close();
}