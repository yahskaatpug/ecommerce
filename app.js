var express              =require("express");
var mongoose             =require("mongoose");
var User                 =require("./models/user");

var Product              =require("./models/products");
var engine               =require("ejs-mate");
var passport             =require("passport");
var ejs                  =require('ejs');
var bodyparser           =require("body-parser");
var LocalStrategy        =require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride=require("method-override");
var keyPublishable = 'pk_test_6Xk9GBajHY600NStQFyKrZTm';
var keySecret = 'sk_test_2rFnQh2NXLqZ7X7QpfB4PbET';
var stripe = require("stripe")(keySecret);

mongoose.connect("mongodb://localhost/auth_demo_app");

/*Product.create(
	{
	product:"book",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk5-YgVVImD2bPnMnaMx5MKhBVbGNWVUYuRBMaSKpc3UO5fj3W",cost:"25 $"	
	},function(err,allProduct){
		if(err)
			console.log(err);
		else
			console.log(allProduct);
});*/

var app=express();
app.use(methodOverride('_method'));
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(require("express-session")({
		secret:"whats up",
		resave:false,
		saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.engine('ejs',engine);

//giving req.user ie currentUser to each template
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Auth Routes

app.get("/",function(req,res){ 
		res.render("home");
});

app.get("/register",function(req,res){//show signUp page 
		res.render("register");
});
app.post("/register",function(req,res){//handling user sign up 
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
			if(err)
				res.render("register");
			else
			{
			passport.authenticate("local")(req,res,function(){
			res.redirect("/profile");})
			}
				
});
});

app.get("/profile",isLoggedIn,function(req,res){
		res.render("profile");
});
//login routes
app.get("/login",function(req,res){//render login form
		res.render("login");
});

//login logic
//middleware
app.post("/login",passport.authenticate("local",{
			successRedirect:"/profile",
			failureRedirect:"/login"
}),function(req,res){
	
		
	var username  =req.body.username;
	var password   =req.body.password;
	var newUser ={username:username,password:password};
	User.push(newUser);-
   res.redirect("/profile");
	

});

app.get("/logout",function(req,res){
		req.logout();
		res.redirect("/");
});

function isLoggedIn(req,res,next){
		if(req.isAuthenticated()){
			return next();
		}
	res.redirect("/login");	
}
	/*var products=[{product:"book",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk5-YgVVImD2bPnMnaMx5MKhBVbGNWVUYuRBMaSKpc3UO5fj3W",cost:"25 $"}];*/

app.get("/products",function(req,res){
	if(req.query.search){
	var regex=new RegExp(escapeRegex(req.query.search),'gi');


	
	Product.find({product:regex},function(err,x){
		if(err)
			console.log(err);
		else
			{res.render("products",{products:x});
			console.log(req.user);}

	//res.render("products",{products:products});
});
}else{
	Product.find({name:regex},function(err,x){
		if(err)
			console.log(err);
		else
			{res.render("products",{products:x});
			console.log(req.user);}


});
}
});

app.post("/products",function(req,res){
	var product=req.body.product;
	var image  =req.body.image;
	var cost   =req.body.cost;
	var features=req.body.features;
	var author ={id:req.user._id,
			username:req.user.username}
	var newProducts ={product:product,image:image,cost:cost,features:features,author:author};
	Product.create(newProducts,function(err,newly){
		if(err) console.log(err);
		else{ res.redirect("/products");
			}
});
   
});

app.get("/products/new",isLoggedIn,function(req,res){
	res.render("new.ejs");
});

app.get("/products/:id",function(req,res){
	Product.findById(req.params.id,function(err,productFound){
	//function given by mongoose
		if(err)
			console.log(err);
		else
			res.render("show",{products:productFound});
});
	//res.send("hi");
});
//edit route
app.get("/products/:id/edit",checkProductOwnership,function(req,res){
	
		Product.findById(req.params.id,function(err,x){//edit route
		res.render("edit",{products:x});
	});
	
});

app.put("/products/:id",checkProductOwnership,function(req,res){
	var product=req.body.product;
	var image  =req.body.image;
	var cost   =req.body.cost;
	var features=req.body.features;
	var author ={id:req.user.id,
			username:req.user.username}
	var updateProduct={product:product,image:image,cost:cost,features:features,author:author};
	Product.findByIdAndUpdate(req.params.id,updateProduct,function(err,productUpdate){
		if(err)
			console.log(err);
		else
			res.redirect("/products/"+req.params.id);
});
});

app.delete("/products/:id",checkProductOwnership,function(req,res){//4. show route:to show info about one campground
	Product.findByIdAndRemove(req.params.id,function(err){
	//function given by mongoose
		if(err)
			console.log(err);
		else
			res.redirect("/products");
});
});

function checkProductOwnership(req,res,next){
	if(req.isAuthenticated()){
		Product.findById(req.params.id,function(err,x){//edit route
	//function given by mongoose
		console.log(req.user,x.author.id);
		if(err) console.log(err);
			//res.redirect("back");
		else{
			var one = " "+x.author.id;
			var two = " "+req.user._id;	
			
			if(one===two){
			next();}
			else res.redirect("back");	
		}
	
});}else {res.redirect("back");}
}

app.get("/products/:id/index",isLoggedIn,function(req,res){
	res.render('index',{

	});
});


app.get("/products/:id/index/paysuccess",function(req,res){
	res.render('paysuccess',{
		
	});
});

app.post("/charge",function(req,res){

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
	res.redirect("/products/:id/index/paysuccess");
});

});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


app.listen(3000,function(){
		console.log("server is running");
});











