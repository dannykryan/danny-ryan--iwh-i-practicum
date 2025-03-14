const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const PETS_API_URL = "https://api.hubapi.com/crm/v3/objects/2-140221726";

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

app.get("/", async (req, res) => {
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

app.get('/form', async (req, res) => {
    const petId = req.query.id;
    if (!petId) {
        return res.status(400).send('Pet ID is required');
    }

    const url = `https://api.hubapi.com/crm/v3/objects/2-140221726/${petId}?properties=name,species,favorite_toy`;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
                'Content-Type': 'application/json',
            },
        });

        const pet = response.data;

        console.log(pet);  // Check if the pet object has the expected structure
        const petData = {
            id: pet.id,
            name: pet.properties.name || '',
            species: pet.properties.species || '',
            favorite_toy: pet.properties.favorite_toy || ''
        };

        console.log(petData);  // Check if the data being passed to Pug is correct

        // Send the pet data to the pug template
        res.render('form', {
            title: 'Edit Pet',
            pet: petData, // Pass the pet data to the pug template
        });
    } catch (error) {
        console.error("Error fetching pet data:", error);
        res.status(500).send('Error fetching pet data');
    }
});



// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post('/form', async (req, res) => {
    const petId = req.query.id; // Get the petId from the query string
    const { name, species, favorite_toy } = req.body; // Get form data

    if (!name || !species || !favorite_toy) {
        return res.status(400).send('All fields are required');
    }

    const data = {
        properties: {
            name: name,
            species: species,
            favorite_toy: favorite_toy
        }
    };

    try {
        let response;
    
        if (petId) {
            // Update existing pet
            const url = `https://api.hubapi.com/crm/v3/objects/2-140221726/${petId}`;
            response = await axios.patch(url, data, {
                headers: {
                    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
                    'Content-Type': 'application/json',
                },
            });
        } else {
            // Create new pet
            const url = 'https://api.hubapi.com/crm/v3/objects/2-140221726';
            response = await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
                    'Content-Type': 'application/json',
                },
            });
        }
    
        // Add logging to confirm execution reaches here
        console.log("Pet data saved, redirecting to homepage");
    
        // Redirect to the homepage after successful submission
        res.redirect('/');
    
    } catch (error) {
        console.error("Error saving pet data:", error);
        res.status(500).send('Error saving pet data');
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));