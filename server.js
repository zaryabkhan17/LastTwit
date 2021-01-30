var SERVER_SECRET = process.env.SECRET || "1234";
// var SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_ACCOUNT)
const PORT = process.env.PORT || 5000;

var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var path = require("path")
var jwt = require('jsonwebtoken')
var { userModel, tweetModel } = require('./dbconn/modules');
var app = express();
var authRoutes = require('./routes/auth')
var http = require("http");
var socketIO = require("socket.io");
var server = http.createServer(app);
var io = socketIO(server);
const fs = require('fs')
const multer = require('multer')

io.on("connection", () => {
    console.log("runned");
})

const storage = multer.diskStorage({ // https://www.npmjs.com/package/multer#diskstorage
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

const admin = require("firebase-admin");
// https://firebase.google.com/docs/storage/admin/start
var SERVICE_ACCOUNT = JSON.parse({
    "type": "service_account",
    "project_id": "twitterapp-20ea6",
    "private_key_id": "8e5e9a823728dac7cfc77f8698c54ed7a708cd55",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDq1YmV+jQx1pCh\n4p6irBgc6Be+dQlTLKhuaX1dlSUkts9E4FxuDykFb28x5ONxl1NXm48AkHxWa58Y\nFzXXmF+bAVe/aL6i2EYE+CN92MMZyMIaLtB4WJL8QYeykBmjFySvQ3U7MK+Rz0Fx\n8cTas7Su4B2H8dSbyAj7Q/XCKMDzN+KFOpsUlTUmHm9ePJdF0a7sgx6q928h/eX0\nbKlKD992hBOLYzlTAHOKokgMrkSQuUoRzX3BX5np8/Sg0pn/vb+IkNlCvIDEy+h3\ntUyu0owUJgp15Zn0v0TIb1qoGR5XQSWPH094lsvd1wqCHsv7VdoRGvjzNs8JhLFQ\nATbfO+O/AgMBAAECggEAA4335y1CXP7CcbDcddnlA4r/0QI0ge3LHuC55RC83zFl\nMcWzoHbaSBrHtBmi17VSraDNKVUGjMhUQCkZx4mm6NG8YklTmWNsq+aVovIFAf7n\n8T2EKk4s62SSiUFlIfLXu09qFttFzQ82DmN6d1UBBySdTdF7RmBgwmzk62tygDvw\n5HUtLFd00hkDyTBSWmmUVCU0CvbN0fBF88huWUbUpJ9TsELpibbfEQCS5eVIip6h\nafiY0MfrfI3Gqro0bC3BOE06ZhUSB89P3Aq4IiCFoaLlVPqvIu1T0ntH3ylQ+1GW\nRZ2+x6tHEErSZOCEpcXVkQNrbRjy7Yf2llLwsSZjAQKBgQD94zY5wdUhwUUZwCAl\nvKMRroAbVZHv6O9BpIJ2qKix+MdJPiSjao1Q/RUUih90pPcfDIWL7mF7NDsvlaqp\nZzGgRHt36jY0uzI+FCnzl3dT/KtNPH2ENoPSr69Ffk729kR1QZrDLJ4RNkKA3ago\nPL6HZerH4nMEiXH9zOzmth59tQKBgQDsyb3EBzulktOv4z6gUGzf5NecEIhkMUqK\nfcBbeue27DJjLqNIU7Lu+P/OvmHL0SIozQUpNeZPGo6l8igowUaZku+Fpxz6Qw9t\npwIDMgai47sBYrFYbJBp403tTqT0omOBBkmbamiKP94qwJ141KkKtUGganl2P1Oz\n9DvK+d5kIwKBgCNifXZDS58uvqC+JDzeM6QNPBGTNYnIX0A4224KR6i2UaAlpxmX\niiaVf1Cjh4rMSxzqs9oy2SdAulcBdw2xMjtyD/tAi1mCFZiNWuN2Ys0z0/Qp0ByT\nNIAyuCzpU7wbyqLFB/rXxxgDBfXL7tnczXk1fSlqqDkjpt2GqCXnkAxZAoGAREht\nG+GGFto/h2I9xhdLPkmMz6mI23PHbiaTWQ4ZUgvNAAML/Sh92iIeCq2mIBOACUoO\nKfMsJjWfW0V4xT/vLwxLXDxzw8ug4Fsf3nIHreOEIwMl5zzvbEmrSDq8oPtPPH7m\nrRXDbdK7K5L+FkElOjxI34y02B+s8KEGuSLTOgcCgYEAmYA9e590Alc4GV2c3mvF\nVJvd8O1fxemdfUnvoW/OrNkxTux1p7cG439/yecqiWfF4VfgxJP7IYVtetDXbtZ1\n4L2F18UXtuZ63OXuUDZTgcwAvZsu5fyVP6AbnXUfH2JE/qTfEJLghnK030Tt/I0n\nIVptSNwSzcxiEyqMzxGjhts=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-rfvs3@twitterapp-20ea6.iam.gserviceaccount.com",
    "client_id": "111801977628283419040",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-rfvs3%40twitterapp-20ea6.iam.gserviceaccount.com"
})

admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT),
    databaseURL: "https://twitterapp-20ea6-default-rtdb.firebaseio.com"
});
const bucket = admin.storage().bucket("gs://twitterapp-20ea6.appspot.com");

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));
app.use("/", express.static(path.resolve(path.join(__dirname, "public"))))

app.use('/', authRoutes);
app.use(function (req, res, next) {
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate;

            if (diff > 300000) {
                res.status(401).send("token expired")
            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86400000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                req.headers.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {

    console.log(req.body)

    userModel.findById(req.body.jToken.id, 'name email phone gender createdOn profilePic',
        function (err, doc) {
            if (!err) {
                res.send({
                    status: 200,
                    profile: doc
                })

            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})
app.post("/tweet", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0])
                        userModel.findById(req.headers.jToken.id, 'name profilePic email', (err, user) => {
                            console.log("user =======>", user.email)
                            if (!err) {
                                tweetModel.create({
                                    "name": user.name,
                                    "tweets": req.body.tweet,
                                    "profilePic": user.profilePic,
                                    "tweetImg": urlData[0],
                                    "email": user.email
                                }).then((data) => {
                                    console.log(data)
                                    res.send({
                                        status: 200,
                                        message: "Post created",
                                        data: data
                                    })
                                    console.log(data)
                                    io.emit("NEW_POST", data)

                                }).catch(() => {
                                    console.log(err);
                                    res.status(500).send({
                                        message: "user create error, " + err
                                    })
                                })
                            }
                            else {
                                res.send("err")
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})

app.post('/textTweet', (req, res, next) => {
    if (!req.body.tweet) {
        res.status(403).send({
            message: "please provide tweet"
        })
    }
    userModel.findOne({ email: req.body.jToken.email }, (err, user) => {
        console.log("user =======>", user.email)
        if (!err) {
            tweetModel.create({
                "name": user.name,
                "email": user.email,
                "tweets": req.body.tweet,
                "profilePic": user.profilePic,
            }).then((data) => {
                console.log(data)
                res.send({
                    status: 200,
                    message: "Post created",
                    data: data
                })
                io.emit("NEW_POST", data)
            }).catch(() => {
                console.log(err);
                res.status(500).send({
                    message: "user create error, " + err
                })
            })
        }
        else {
            console.log(err)
        }
    })
})

app.get('/getTweets', (req, res, next) => {

    tweetModel.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({ data: data });
        }
    })
})
app.get('/myTweets', (req, res, next) => {

    userModel.findOne({ email: req.body.jToken.email }, (err, user) => {
        if (!err) {
            tweetModel.find({ email: req.body.jToken.email }, (err, data) => {
                if (err) {
                    console.log(err)
                }
                else {
                    res.send({ data: data });
                }
            })
        }
        else {
            console.log(err)
        }
    })
})
app.post("/upload", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0])
                        userModel.findOne({ email: req.body.email }, (err, user) => {
                            console.log(user)
                            if (!err) {
                                tweetModel.updateMany({ name: req.headers.jToken.name }, { profilePic: urlData[0] }, (err, tweetModel) => {
                                    console.log(tweetModel)
                                    if (!err) {
                                        console.log("update");
                                    }
                                });
                                user.update({ profilePic: urlData[0] }, (err, updatedProfile) => {
                                    if (!err) {
                                        res.status(200).send({
                                            message: "succesfully uploaded",
                                            url: urlData[0],
                                        })
                                    }
                                    else {
                                        res.status(500).send({
                                            message: "an error occured" + err,
                                        })
                                    }

                                })
                            }
                            else {
                                res.send({
                                    message: "error"
                                });
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})

server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})
