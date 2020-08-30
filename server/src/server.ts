import express from 'express';
import cors from 'cors';
import { closeDb } from './db/db';
import { countriesRouter } from './routers/country';

const PORT = 3200;
const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hi there!');
});

app.use('/country', countriesRouter);


app.listen(PORT, () => console.log(`Server is up at ${PORT}`));


process.on('SIGINT', function () {
    console.log('closing mongo connection');
    closeDb();
});



