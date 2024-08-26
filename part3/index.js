const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')
require('dotenv').config();
const Person = require('./models/person')
const {ObjectId} = require("mongodb");


app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens['response-time'](req, res);
    let contentLength = tokens.res(req, res, 'content-length');
    if (contentLength === undefined) {
        contentLength = '-';
    }
    if (req.method === 'POST') {
        let body = ` ${JSON.stringify(req.body)}`;
        return `${method} ${url} ${status} ${contentLength} - ${responseTime}ms${body}`;
    } else {
        return `${method} ${url} ${status} ${contentLength} - ${responseTime}ms`;
    }
}));

let phonebook = []
app.get('/', (request, response) => {
    response.send('<h1>Go to /api/persons to get the list of phonebook entries</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments().then(count => {
        response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
    }).catch(error => {
        console.log('error counting people:', error.message);
        response.status(500).send({error: 'Error counting people'});
    });
});

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
    })
        .catch(error => {
            console.error(error);
            response.status(500).end();
        });
});

app.delete('/api/persons/:id', (request, response) => {

    Person.deleteOne({id: request.params.id})
        .then(result => {
            response.status(204).end();
        })
        .catch(error => {
            console.error(error);
            response.status(500).end();
        });
});


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    if (phonebook.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
        phonebook = phonebook.concat(savedPerson)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
