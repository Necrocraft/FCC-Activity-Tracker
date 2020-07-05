const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require("dotenv/config");
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

const NewUser = require("./models/username");
const Activity = require("./models/activity");

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true },  () => {
    console.log("Connected to DB");
});

app.post('/api/exercise/new-user/', (req, res) => {
    let newUser = req.body.username;

    NewUser.findOne({ $or : [{'username': newUser}, {'_id': newUser}] }, async (err, data) => {
        console.log(data);
        if(data === null) {
            const user = new NewUser({
                username: newUser,
                _id: newUser + Math.floor(Math.random()* 1000).toString()
            })
            try {
                const savedValue = await user.save();
                return res.json(savedValue);
            }
            catch(err) {
                return res.json({message: err});
            }
        }
        else {
            res.json({error: "Already exists"});
        }
    })
});

app.post('/api/exercise/add/', (req, res) => {
    let id = req.body.userId;
    NewUser.findOne({$or : [{ 'username': id}, {'_id': id}]}, async (err, data) => {
        if(data != null) {
            const activity = new Activity({
                user_id: id,
                description: req.body.description,
                duration: req.body.duration,
                date: !!req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
            })
            try {
                const savedValue = await activity.save();
                return res.json(savedValue);
            }
            catch(err) {
                return res.json({message: err});
            }
        }
        else {
            res.json({error: "userId does not exists"});
        }
    })
})

app.get("/api/exercise/users/", (req, res) => {
    NewUser.find({}, (err, data) => {
        console.log(data);
        if(err) {
            return res.send('Error reading Database');
        }
        else {
            res.send(data);
        }
    })
})

app.get("/api/exercise/log?", (req, res) => {
    let id = req.query.userId;
    let regex = /^[\d]{4}[-]{1}([0]?[1-9]{1}|[1]{1}[0-2]{1})[-]{1}([0]?[1-9]{1}|[1]{1}[\d]{1}|[2]{1}[\d]{1}|[3]{1}[0-1]{1})$/; //To test the date format entered
    let testFromDate = regex.test(req.query.from);
    let testToDate = regex.test(req.query.to);
    let fromDate = req.query.from===undefined?undefined:req.query.from;
    let toDate = req.query.to===undefined?undefined:req.query.to;  
    let limit = req.query.limit===undefined?undefined:req.query.limit;

    NewUser.findById(id, (err, data) => {
        if(err) {
            return res.send('Error reading database')
        }
        else {
            if(data != null) {
                console.log(data._id);
                Activity.find({'user_id': data._id}, (err, docs) => {
                    if(err) {
                        return res.send('Error reading database')
                    }
                    else{
                        if(docs != null) {
                            console.log(docs);
                            if(fromDate !== undefined && toDate !== undefined) {
                                if(testFromDate && testToDate) {
                                    let activityData = [];
                                    docs.map((obj, i) => {
                                        if(new Date(obj.date).getTime() >= new Date(fromDate).getTime() && new Date(obj.date).getTime() <= new Date(toDate).getTime()) {
                                            activityData.push(obj);
                                        }
                                    })
                                    if(limit > 0) {
                                        activityData = activityData.slice(0, limit);
                                        let result = {"_id": id, "username": data.username, "from": new Date(fromDate).toDateString(), "to": new Date(toDate).toDateString(), "count": limit, "log": activityData}
                                        res.json(result);
                                    }
                                    else {
                                        let result = {"_id": id, "username": data.username, "from": new Date(fromDate).toDateString(), "to": new Date(toDate).toDateString(), "count": activityData.length, "log": activityData}
                                        res.json(result);
                                    }
                                }
                                else {
                                    res.send("The dates are in wrong format -- Please Enter date in yyyy-mm-dd Format")
                                }
                            }
                            else if(fromDate === undefined && toDate !== undefined) {
                                if(testToDate) {
                                    let activityData = [];
                                    docs.map((obj, i) => {
                                        if(new Date(obj.date).getTime() <= new Date(toDate).getTime()) {
                                            activityData.push(obj);
                                        }
                                    })
                                    if(limit > 0) {
                                        activityData = activityData.slice(0, limit);
                                        let result = {"_id": id, "username": data.username, "to": new Date(toDate).toDateString(), "count": limit, "log": activityData}
                                        res.json(result);
                                    }
                                    else {
                                        let result = {"_id": id, "username": data.username, "to": new Date(toDate).toDateString(), "count": activityData.length, "log": activityData}
                                        res.json(result);
                                    }
                                }
                                else {
                                    res.send("The date is in wrong format -- Please Enter date in yyyy-mm-dd Format")
                                }
                            }
                            else if(fromDate !== undefined && toDate === undefined) {
                                if(fromDate) {
                                    let activityData = [];
                                    docs.map((obj, i) => {
                                        if(new Date(obj.date).getTime() >= new Date(fromDate).getTime()) {
                                            activityData.push(obj);
                                        }
                                    })
                                    if(limit > 0) {
                                        activityData = activityData.slice(0, limit);
                                        let result = {"_id": id, "username": data.username, "from": new Date(fromDate).toDateString(), "count": limit, "log": activityData}
                                        res.json(result);
                                    }
                                    else {
                                        let result = {"_id": id, "username": data.username, "from": new Date(fromDate).toDateString(), "count": activityData.length, "log": activityData}
                                        res.json(result);
                                    }
                                }
                                else {
                                    res.send("The date is in wrong format -- Please Enter date in yyyy-mm-dd Format")
                                }
                            }
                            else if(fromDate === undefined && toDate === undefined) {
                                let result = {"_id": id, "username": data.username, "count": docs.length, "log": docs}
                                res.json(result);
                            }
                        }
                    }
                })
            }
            else {
                res.json({error: "userId does not exists"});
            }
        }
    })
})

app.listen(process.env.PORT || 3000, () => console.log("Server Running"));