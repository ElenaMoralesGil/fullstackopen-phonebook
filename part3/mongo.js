const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://elenamg111333:${password}@cluster0.aibze.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const PersonSchema = new mongoose.Schema({
    id: String,
    name: String,
    number:String ,
})

const Person = mongoose.model('Person', PersonSchema)

const person = new Person({
    id: String(Math.floor(Math.random() * 1000000)),
    name: process.argv[3],
    number: process.argv[4],
})

if(process.argv.length === 5){
    person.save().then(result => {
        console.log('added ' + person.name + ' number ' + person.number + ' to phonebook')
        mongoose.connection.close()
    })
} else if(process.argv.length === 3){
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(person.name + ' ' + person.number)
        })
        mongoose.connection.close()
    })
}
