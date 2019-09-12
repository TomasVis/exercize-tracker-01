const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var ids = require('short-id');
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
app.post("/api/exercise/add",async function(req,res){
  //console.log("sadasdasd")
try {
  let query = await userModel.find({id:req.body.userId});
  console.log(query)
  let update = await userModel.findOneAndUpdate(req.body.userId,{$push: {log: {description:req.body.description ,duration: req.body.duration }}},{new: true }) 
  res.send(query);

} catch (err) {
  console.log('err' + err);
  res.status(500).send(err);
  
}
});
app.post("/api/exercise/new-user",async function(req,res){
try {
  const newUser = new userModel({
    id: ids.generate(),
    username: req.body.username,
  });
  let saveUser = await newUser.save(); 
  res.send(saveUser);

} catch (err) {
  if(err.code == 11000){
    res.send("User "+ req.body.username + " already exists")
  }
  else{
  console.log('err' + err);
  res.status(500).send(err);
  }
}

})

app.get("/api/exercise/users",async function(req,res){
  try{
    let query = await userModel.find();
    let shortQuery = query.map( (x)=> {

    return  {id : x.id , username : x.username}

    });
    console.log(shortQuery)
    res.send(shortQuery);

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
