const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
const MongoClient = require('mongodb').MongoClient;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-debasish:Debasish123@cluster0.koi59g9.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todoList!"
});
const item2 = new Item({
    name: "Click the + button to add a new item."
});
const item3 = new Item({
    name: "Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema ={
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res){
    
    // let today = new Date();

    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };
    // let day = today.toLocaleDateString("en-us", options);

    // Item.find({}, function(err, foundItems){
    //     console.log(foundItems);
    // })

    Item.find({}).then(function(FoundItems){

        if(FoundItems.length === 0){
            Item.insertMany(defaultItems);
            res.redirect("/");
        }
        
        else{
            res.render("list", {listTitle: "Today", newListItems: FoundItems});
        }  
    });  
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
  
    List.findOne({name: customListName}, function(err, foundList){
      if (!err){
        if (!foundList){
          
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          
  
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });
    });


app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

    

    // if(req.body.list === "Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }else{
    //     items.push(item);
    //     res.redirect("/");
    // }
    
} );
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(err){
            if(!err)
            // {
            //     console.log(err);
            // }else
            {
                console.log("success deleted");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }

    
});


app.get("/about", function(req, res){
    res.render("about");
})

app.listen(4000, function(){
    console.log("app is listening to server 4000");
});