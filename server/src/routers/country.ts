import { Router } from 'express';
import { connect } from '../db/db';
import axios from 'axios'

const countriesRouter = Router();
const KEY = '4440647771967a162cccb5ac78241bfa';

// saveCountryNameAndCode
countriesRouter.post('/', async (req, res) => {
    const { countryName } = req.body;
    axios.get(`http://battuta.medunes.net/api/country/search/?country=${countryName}&key=${KEY}`)
        .then(async response => {
            const { name } = response.data[0];
            const { code } = response.data[0];
            const db = await connect();
            const { insertedId } = await db.collection('countries').insertOne({ name, code });
            res.send({ sucess: true, countryId: insertedId });
        })
        .catch(error => {
            console.log(error.message, 'im here')
            res.send({ sucess: false, error });
        });
});

countriesRouter.put('/region', async (req, res) => {
    try {
        const { countryName } = req.body;
        const db = await connect();
        const country = await db.collection('countries').findOne({ name: countryName });
        axios.get(`http://battuta.medunes.net/api/region/${country.code}/all/?key=${KEY}`)
            .then(async response => {
                const regions = Object.values(response.data);
                const { value } = await db.collection('countries').findOneAndUpdate({ name: countryName }, { $set: { regions } });
                res.send({ sucess: true, country: value });
            })
            .catch(error => {
                res.send({ sucess: false, error: error.message });
            });
    } catch (err) {
        res.send({ text: 'im in region', sucess: false, error: err.message });
    }
});

countriesRouter.put('/city', async (req, res) => {
    const { countryName } = req.body;
    try {
        const result = await findCities(countryName);
        const cities = result.filter(value => Object.keys(value).length !== 0);
        const db = await connect();
        const { value } = await db.collection('countries').findOneAndUpdate({ name: countryName }, { $set: { cities } });
        console.log(value)
        res.send({ country: value, sucess: true })
    } catch (error) {
        res.send({ sucess: false, error: error.message });
    }
});


async function findCities(countryName: string) {
    const db = await connect();
    const country = await db.collection('countries').findOne({ name: countryName });
    let result = [];
    for (let i = 0; i < country.regions.length; i++) {
        let r = country.regions[i];
        const res = await axios.get(`http://battuta.medunes.net/api/city/${r.country}/search/?region=${r.region}&key=${KEY}`)
        result.push(res.data);
    }
    return result;
}

export { countriesRouter };