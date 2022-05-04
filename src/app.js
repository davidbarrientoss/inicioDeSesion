const express = require("express")
const session = require("express-sessions")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const ejs = require("ejs")
const User = require("./models/users")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy

let PORT = process.env.PORT||8080

const app = express()
const server = app.listen(PORT,()=>{
    console.log(`listening on ${PORT}`)
})

app.set("views","./views")
app.set("view engine","ejs")

app.use(express.json())
app.use(express.urlencoded({extended:true}))

const URL = "mongodb+srv://davidbarrientos:Barcelona3@cluster0.he6yv.mongodb.net/passportDatabase?retryWrites=true&w=majority"

mongoose.connect(URL,{
    useNewUrlParser: true, useUnifiedTopology: true
},err=>{
    if(err) throw new Error("No se pudo conectar")
    console.log("db conectada")
})


//cerrar sesion

app.use(session({
    secret:"clave",
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user,done)=>{
    return done(null, user.id)
})

passport.deserializeUser((id,done)=>{
    User.find(id,(err,user)=>{
        return done (err,user)
    })
})

//

passport.use("registro", new LocalStrategy(
    {
        passReqToCallback:true
    },
    (req,username,password,done)=>{
        User.findOne({username:username},(err,user)=>{
            if(err)return done (err)
            if(user) return done(null,false,{message:"user already exist"})
            const newUser = {
                name :req.body.name,
                username:req.body.username,
                password:req.body.password
            }
            User.create(newUser,(err,userCreated)=>{
                if (err) return done (err)
                return done (null, userCreated)
            })
        })}
))

//routes

app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/perfil",(req,res)=>{
    res.render("perfil")
})

app.post("/signupForm",passport.authenticate("registro",{failureRedirect:"/signup"}),(req,res)=>{
    res.redirect("/perfil")
    console.log(req.body)

})