const express = require('express')
const app = express()
const morgan = require('morgan');

app.use(express.json())
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
        body = ` ${JSON.stringify(req.body)}`;
        return `${method} ${url} ${status} ${contentLength} - ${responseTime}ms${body}`;
    } else{
        return `${method} ${url} ${status} ${contentLength} - ${responseTime}ms`;
    }
}));

let phonebook = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]
app.get('/', (request, response) => {
    response.send('<h1>Go to /api/phonebook to get tje list of phonebook entries</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})


app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${phonebook.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = phonebook.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    phonebook = phonebook.filter(person => person.id !== id)
    response.status(204).end()
})




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

    const phone = {
        id: String(Math.floor(Math.random() * 1000000)),
        name: body.name,
        number: body.number,
    }

    phonebook = phonebook.concat(phone)

    response.json(phone)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})