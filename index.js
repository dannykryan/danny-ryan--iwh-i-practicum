const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const PETS_API_URL = "https://api.hubapi.com/crm/v3/objects/p144357029_pet";

// POST endpoint to create a new custom object
app.post('/create-custom-object', async (req, res) => {
    const url = 'https://api.hubapi.com/crm/v3/schemas';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    const data = {
        name: "pet",
        labels: {
            singular: "Pet",
            plural: "Pets"
        },
        primaryDisplayProperty: "name",
        requiredProperties: ["name"],
        searchableProperties: ["name"],
        properties: [
            {
                name: "name",
                label: "Name",
                type: "string",
                fieldType: "text"
            },
            {
                name: "species",
                label: "Species",
                type: "string",
                fieldType: "text"
            },
            {
                name: "favorite_toy",
                label: "Favorite Toy",
                type: "string",
                fieldType: "text"
            }
        ],
        associatedObjects: ["contacts"]
    };

    try {
        const response = await axios.post(url, data, { headers });
        res.json(response.data);
    } catch (error) {
        console.error(error.response.data);
        res.status(500).json({ error: "Failed to create custom object" });
    }
});


// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get("/pets", async (req, res) => {
    try {
        const response = await axios.get(PETS_API_URL, {
            headers: {
                Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
                "Content-Type": "application/json",
            },
            params: {
                properties: "name,species,favorite_toy" // Explicitly request properties
            },
        });

        const pets = response.data.results || []; // Ensure results exist

        res.render("pets", {
            title: "Pets List",
            data: pets,
        });
    } catch (error) {
        console.error("Error fetching pets:", error.response?.data || error);
        res.status(500).send("Error fetching pet data");
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

// * Code for Route 2 goes here

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

// * Code for Route 3 goes here

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));