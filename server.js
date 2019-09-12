const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var ids = require('short-id');
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/exercise-track' )
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


/*app.get("/api/wtf", function(req, res){
  //console.log(req.body.username)
  res.json({whats: "up bitches"});
});*/

var Schema = mongoose.Schema;
var userSchema = new Schema({
    _id: String,
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


/*route_path: '/library'
actual_request_URL: '/library?userId=546&bookId=6754'
req.query: {userId: '546', bookId: '6754'}*/
 

app.get("/api/exercise/log", async function (req, res) {

try{
  let user = await userModel.findById(req.query.userId);
  console.log(req.query.userId+" "+req.query.from+" "+req.query.to+" "+req.query.limit)
  
  if(req.query.from){
    let from = new Date(req.query.from)
    console.log("query not empty")
    user.log = user.log.filter(function(x){
      return x.date.getTime() > from.getTime()
      //console.log()
    })
  }
  if(req.query.to){
    let to = new Date(req.query.to)
    console.log("query not empty")
    user.log = user.log.filter(function(x){
      return x.date.getTime() < to.getTime()
      //console.log()
    })
  }
  if(req.query.limit){

    console.log("query not empty")
    user.log.splice(req.query.limit)
  }
  console.log(user)
  res.send(user)
}
catch (err) {
  console.log('err' + err);
  res.status(500).send(err);
  
}

});


app.post("/api/exercise/add",async function(req,res){
console.log(typeof req.body.date)
console.log(req.body.date)
try {
  if(req.body.userId == ""){
    res.send("User ID field can not be empty")
  }
  else if(req.body.description == ""){
    res.send("Description field can not be empty")
  }
  else if(isNaN(req.body.duration)){
    res.send("Duration field must be a number")
  }
  else if(req.body.duration == ""){
    res.send("Duration field can not be empty")
  }
  const doesUserExit = await userModel.exists({ _id: req.body.userId });

  if(doesUserExit){
    //req.body.date
    let thingToPush = {}
    if(req.body.date==""){
      console.log("req.body.date is an empty String")
      thingToPush = {log: {description:req.body.description ,duration: req.body.duration }};
    } 
    else {
      console.log(req.body.date)
        var date = 0;
        if(req.body.date == undefined){
          date = new Date()
        }
        else if(isNaN(req.body.date)){
          date = new Date( Date.parse(req.body.date));
        }
        else if (!isNaN(req.body.date)){
          date = new Date(Number(req.body.date))
        }
        console.log(date.getTime())
      thingToPush = {log: {description:req.body.description ,duration: req.body.duration, date:date }};
    } 
    let update = await userModel.findOneAndUpdate({_id:req.body.userId},{$push: thingToPush},{new: true, useFindAndModify:false }) 
    //console.log(update)
    res.send(update);
  }
  else{
    res.send("User does not exist")
  }  
} catch (err) {
  console.log('err' + err);
  res.status(500).send(err);
  
}
});
app.post("/api/exercise/new-user",async function(req,res){
try {
  const newUser = new userModel({
    _id: ids.generate(),
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

    return  {_id : x._id , username : x.username}

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
