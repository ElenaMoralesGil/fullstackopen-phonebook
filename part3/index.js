const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')
require('dotenv').config();
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
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
    })
});

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error))
});

app.delete('/api/persons/:id', (request, response, next) => {

    Person.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })
    newPerson.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})
app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    const {name, number} = request.body

    if (!name || !number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    Person.findByIdAndUpdate(id, {name, number}, {new: true, runValidators: true, context: 'query'})
        .then(updatedPerson => {
            if (!updatedPerson) {
                return response.status(404).json({
                    error: 'Person not found'
                })
            }
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}
app.use(errorHandler)



