var appRouter = function (app) {

    var __globals = require('./../js/globals');
    var multer = require('multer');
    var bodyParser = require("body-parser");

    var exphbs = require('express-handlebars');
    var mongoose = require('mongoose');
    var session = require('express-session');
    var each = require('foreach');
    var url = require('url');
    var MongoClient = require('mongodb').MongoClient;
    
   

    app.get("/", function (req, res, next) {
        console.log('get:/');
        res.redirect('/dashboard');
        sess = req.session;

        });

     

        app.get("/resto_details", function (req, res, next) {
       
            console.log('get:/resto_details');
            console.log(typeof(req.query.id))
            console.log(req.query.id)
            var search_item = req.query.id;
            console.log(search_item)

            console.log(typeof(search_item))

            MongoClient.connect(__globals.dbUrl, function(err, db) {
                if (err) throw err;
                var dbo = db.db("fortinet");
                console.log(search_item)
                dbo.collection("details").findOne({'Restaurant ID' : search_item}, function(err, data1){
                    dbo.collection("dashboard").update(
                        // find record with name "MyServer"
                        { 'Restaurant Name' :search_item },
                        // increment it's property called "ran" by 1
                        { $inc: { Count: 1 } }
                    );
                    
                    dbo.collection("location").findOne({ 'Restaurant ID' : search_item}, function(err, data2){
 
                    if(data1==undefined){
    
                        res.render(__globals.rootDir + '/views/NoResultFound.ejs');
                    }
    
                    else{
    
                            
                        res.render(__globals.rootDir + '/views/map.ejs', {data1: data1 ,data2: data2 });
                
                    }
    
            
            });

        })

        })
        })

        app.get("/analytics", function (req, res, next) {
          console.log("analytics")
            var data = [];
            MongoClient.connect(__globals.dbUrl, function(err, db) {
                if (err) throw err;
                var dbo = db.db("fortinet");
                var cursor = dbo.collection("dashboard").find();
                cursor.each(function(err, item) {
                    if(item != null) {
                    data.push(item)
                    // If the item is null then the cursor is exhausted/empty and closed
                    }
                    if(item == null) {
                       console.log(data)
                       
                       res.render(__globals.rootDir + '/views/analytics.ejs', {data: data});
                
                
                       db.close(); // you may not want to close the DB if you have more code....
                        return;
                    }
                    // otherwise, do something with the item
                });
                
            
            });
          

        })

        
    //main dashboard page with public data (coming from minio public bucket)//
    //*************************************************************************************************//
    app.get("/dashboard", function (req, res, next) {
        console.log('get:/dashboard');
        var data = [];
        console.log(req.query.id)
        count = req.query.id
        MongoClient.connect(__globals.dbUrl, function(err, db) {
            if (err) throw err;
            var dbo = db.db("fortinet");
            var cursor = dbo.collection("details").find({},{skip: 500*(count-1), limit: 500 });
            cursor.each(function(err, item) {
                if(item != null) {
                data.push(item)
                // If the item is null then the cursor is exhausted/empty and closed
                }
                if(item == null) {
                   console.log(data)
                   
                   res.render(__globals.rootDir + '/views/dashboard.ejs', {data: data});
            
            
                   db.close(); // you may not want to close the DB if you have more code....
                    return;
                }
                // otherwise, do something with the item
            });
            
        
        });
      


    });


    //main dashboard page with public data (coming from minio public bucket)//
    //*************************************************************************************************//
    app.post("/search", function (req, res, next) {
        console.log('get:/search');
        console.log(req.body.search);
        var search_item = req.body.search;
        console.log(typeof(req.body.search));
        console.log(req.body.search.length);

   



        MongoClient.connect(__globals.dbUrl, function(err, db) {
            if (err) throw err;
            var dbo = db.db("fortinet");
            var cursor = dbo.collection("details").findOne({ 'Restaurant Name' :search_item }, function(err, data1){

                dbo.collection("dashboard").update(
                    // find record with name "MyServer"
                    { 'Restaurant Name' :search_item },
                    // increment it's property called "ran" by 1
                    { $inc: { Count: 1 } }
                );

                dbo.collection("location").findOne({ 'Restaurant ID' : data1['Restaurant ID']}, function(err, data2){

                if(data1==undefined){

                    res.render(__globals.rootDir + '/views/NoResultFound.ejs');
                }

                else{

                        
                    res.render(__globals.rootDir + '/views/map.ejs', {data1: data1 ,data2: data2 });
            
                }

        
        });
    })

    })

    })


 

    
    //main dashboard page with public data (coming from minio public bucket)//
    //*************************************************************************************************//
    app.post("/filter", function (req, res, next) {
        console.log('get:/filter');
        var sess = req.session
        count = req.query.id
        sess.count=req.query.id;
        console.log(sess)

        if(req.query.id=='next'){
            count = sess.count+1;
            sess.count=count;
            console.log(sess.count)
        }
        if(req.query.id=='prev'){
            count = sess.count-1;
            sess.count=count;
            console.log(sess.count)
        }
        
        console.log(req.body.Cuisines);
        console.log(req.body.type);
        

        var browser_item = req.body.Cuisines;
        var type = req.body.type;
        MongoClient.connect(__globals.dbUrl, function(err, db) {
            var data = [];
            var count=0
            if (err) throw err;
            var dbo = db.db("fortinet");
            var cursor = dbo.collection("details").find();
            cursor.each(function(err, item) {
                console.log(count)
                count=count+1
                if(item != null) {
                    var words = item.Cuisines.split(',');
                    console.log(words)
                    
                    for(i=0;i<words.length;i++)
                    {
                        console.log(req.body.type.trim() ,words[i].trim()) ;
                        console.log(req.body.type.trim().length , words[i].trim().length );


                        if(words[i].trim()==req.body.type.trim())
                        {
                            console.log(".........................")
                        data.push(item)
                        }

                    }


                    if(count==100)
                    {
                        res.render(__globals.rootDir + '/views/dashboard.ejs', {data: data});

                    }



                // If the item is null then the cursor is exhausted/empty and closed
                }
                

               
                db.close();            
            
            });
   
         

        })
        

    });

    app.post("/sort", function (req, res, next) {
        console.log('get:/sort');
        var data = [];
        var sess = req.session
        count = req.query.id
        sess.count=req.query.id;
        console.log(sess)

        if(req.query.id=='next'){
            count = sess.count+1;
            sess.count=count;
            console.log(sess.count)
        }
        if(req.query.id=='prev'){
            count = sess.count-1;
            sess.count=count;
            console.log(sess.count)
        }
        
        

        var browser_item = req.body.browser;

        console.log("......................",browser_item);

        MongoClient.connect(__globals.dbUrl, function(err, db) {
            if (err) throw err;
            var dbo = db.db("fortinet");
            if(browser_item=='Aggregate rating')
                {
                    var mysort = { "Aggregate rating" : -1 };

                }
            if(browser_item=="Votes")
                {
                    var mysort = { 'Votes' : -1 };

                }
            if(browser_item=='Average Cost for two')
                {
                   
                    var mysort = { 'Average Cost for two' : 1 };

                }

            var cursor = dbo.collection("details").find().sort(mysort);
            cursor.each(function(err, item) {
                if(item != null) {
                 data.push(item)
    
                console.log(item)
                // If the item is null then the cursor is exhausted/empty and closed
                }
                if(item == null) {
                    console.log(data.length)
                    if(data.length!=0)
                   {
                    res.render(__globals.rootDir + '/views/dashboard.ejs', {data: data});
                }

                   else
                   {
                       
                   res.render(__globals.rootDir + '/views/NoResultFound.ejs');
                   }

            
                   db.close(); // you may not want to close the DB if you have more code....
                  
                }
                // otherwise, do something with the item
            });
    })


    });



        

        






}

module.exports = appRouter;