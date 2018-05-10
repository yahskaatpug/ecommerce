var mongoose      =require("mongoose");
var Schema        =mongoose.Schema;
var productSchema = new Schema({
		product:String,
		image:String,
		cost:String,
		features:String,
		//author:{id:String,username:String}
author:{id:{type:mongoose.Schema.Types.ObjectId,ref:"User"},username:String}
});
module.exports =mongoose.model("Product",productSchema);
