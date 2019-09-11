const express = require('express')
const app = express()
const bodyParser = require('body-parser')
//const uniqueValidator = require('mongoose-unique-validator');
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("CONECTION TO DB HAS BEEN ESTABLISHED")
});


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.get("/api/wtf", function(req, res){
  //console.log(req.body.username)
  res.json({whats: "up bitches"});
});

var Schema = mongoose.Schema;
var userSchema = new Schema({
    id: String,
    username: { type : String , unique : true, required : true},
    count: Number,
    log:[{
      description:String,
      duration: Number,
      date: { type: Date, default: Date.now }
    }]

  });
//userSchema.plugin(uniqueValidator);
var userModel = mongoose.model('userModel', userSchema);

//--------------------------------------------------------
app.get("/api/wtf", function(req, res){
  //console.log(req.body.username)
  res.json({whats: "up bitches"});
});

//--------------------------------------------------------
app.put("/person/:id", async (request, response) => {
    try {
        var person = await PersonModel.findById(request.params.id).exec();
        person.set(request.body);
        var result = await person.save();
        response.send(result);
    } catch (error) {
        response.status(500).send(error);
    }
});


app.post("/api/exercise/new-user",async function(req,res){
  console.log("aaaaaaaaaa")
try {
  const newUser = new userModel({
    id: "Stringa",
    username: "Strasdasiangsgfdg",
  });
  console.log('before save');
  let saveUser = await newUser.save(); //when fail its goes to catch
  console.log(saveUser); //when success it print.
  console.log('after save');
  res.send(saveUser);

} catch (err) {
  console.log('err' + err);
  res.status(500).send(err);
}

})



















// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
