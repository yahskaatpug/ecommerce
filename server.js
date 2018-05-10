var keyPublishable = 'pk_test_ukIemC8olXrl2fwiDmbmuinI';
var keySecret = 'sk_test_hEaEgnZzBjNiHrcFfisRrNpe';

var express = require("express");
var stripe = require("stripe")(keySecret);
var ejs = require("ejs");
var bodyParser = require("body-parser");
var app = express();

//var port = process.env.port || 3000;
//app.set('port', (port));
app.set("view engine","ejs");
app.set("views",__dirname+'/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));


app.get("/products/:id/",function(req,res){
	res.render('index',{

	});
});

app.get("/products/:id/paysuccess",function(req,res){
	res.render('paysuccess',{
		
	});
});

app.post("/products/:id/charge",function(req,res){

	var token = req.body.stripeToken;
	var chargeAmount = req.body.AmountCharged;
	//console.log(req);
	stripe.customers.create({
        email: req.body.stripeEmail, // customer email, which user need to enter while making payment
         // token for the given card 
    }).then(function(customer){
	var charge = stripe.charges.create({
		amount:chargeAmount,
		currency:"usd",
		source:token
	},function(err,charge){
		if(err){
			console.log("your card was declined: "+err);
		}
			
	});
	console.log('your payment was successful');
	console.log(req.body);
	res.redirect("/paysuccess");
});

});


//var port = process.env.port || 3000;


