const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const {pw} = require("./dbData");

const db = knex(
    {
        client: 'pg',
        connection: {
          host : pw.host,
          user : pw.user,
          password : pw.password,
          database : pw.database
        },
        pool: { min: 0, max: 7 }
    });

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 34,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res) =>{
    res.send(database.users);
})

app.post('/signin', (req, res) =>{
    if(req.body.email == database.users[0].email &&
        req.body.password == database.users[0].password){
            res.json(database.users[0]);
        } else {
            res.status(400).json('error logging in');
        }
});

app.post('/register', (req, res)=> {
    const { email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail,
                name: name,
                joined: new Date()
            }).then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'));
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id}).then(user => {
        if (user.length){
            res.json(user[0]);
        }else {
           res.status(404).json('No such user');
        }        
    }).catch(err => res.status(400).json("Erro getting user"));
});

app.put('/image', (req, res)=>{
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get count'));
})



// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });


app.listen(3000, () => {
    console.log('app is running on port 3000');
});
