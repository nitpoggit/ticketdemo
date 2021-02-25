const Hapi = require ("@hapi/hapi");

var MongoClient = require('mongodb').MongoClient;

var mongodb = require('mongodb');

const AuthBearer = require('hapi-auth-bearer-token');

const server  = new Hapi.Server({host : "localhost" , port : "4000"});

const start = async() => {

    await server.register(AuthBearer);

    server.auth.strategy('simple', 'bearer-access-token', {        
        allowQueryToken: false,              
        validate: async (request, token, h) => {
 
            // verify token (using simple string for Demo)
            const isValid = token === 'KRISH';
 
            const credentials = { token };
            const artifacts = { test: 'info' };
            return { isValid, credentials, artifacts };
        }});

        server.auth.default('simple');

        server.route({
            method: 'GET',
            path: '/',
            handler: async function (request, h) {
    
                return { info: 'success!' };
            }
        });

        await server.start();

        return server;

    }

    server.route({
        method : "GET",
        path : "/tickets",
        handler : async (request , resp) => { 

            const uri = "mongodb+srv://sa:sa@mongocluster.l6xsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

            const client = new MongoClient(uri);
            
            await client.connect();
    
            var db = client.db('ticketsdb');
    
            var collection = db.collection('tickets');

            return await collection.find().toArray();
        }
    });
    
    server.route({
        method : "GET",
        path : "/tickets/{id}",
        handler : async(request , res) => { 
        
            const uri = "mongodb+srv://sa:sa@mongocluster.l6xsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

            const client = new MongoClient(uri);
            
            await client.connect();
    
            var db = client.db('ticketsdb');
    
            var collection = db.collection('tickets');

            var get_id = request.params.id;
            console.log(get_id);
            var myquery = {_id: new mongodb.ObjectID(get_id)};

            return await collection.findOne(myquery);
        }
    });
    
    
    server.route({
        method: "POST",
        path : "/tickets/",

        handler : async(request , h) => { 
            
            MongoClient.connect("mongodb+srv://sa:sa@mongocluster.l6xsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", function (err, client) {
            
                if(err) {
                    console.log(err);
                    throw err;
                }

                var db = client.db('ticketsdb');

                var collection = db.collection('tickets');

                collection.insertOne(
                    request.payload
                 )
            });

            return "Added Tickets" 
        }
    });
    
    server.route({
        method: "PUT",
        path : "/tickets/{id}",
        handler : async(request , h) => { 
            
            
            MongoClient.connect("mongodb+srv://sa:sa@mongocluster.l6xsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", function (err, client) {
            
                if(err) {
                    console.log(err);
                    throw err;
                }

                var db = client.db('ticketsdb');

                var collection = db.collection('tickets');

                var update_id = request.params.id;
                console.log(update_id);
                
                var myquery = {_id: new mongodb.ObjectID(update_id)};
                var newvalues = { $set: { CustomerName : request.payload.CustomerName , PerformanceTitle : request.payload.PerformanceTitle, 
                    PerformanceTime : request.payload.PerformanceTime , TicketPrice : request.payload.TicketPrice
                } };

                collection.updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                  });

            });
            
            return "Updated Ticket" 
        
        }
    });
    
    server.route({
        method: "DELETE",
        path : "/tickets/{id}",
        handler : async(request , h) => { 
            
            MongoClient.connect("mongodb+srv://sa:sa@mongocluster.l6xsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", function (err, client) {
            
                if(err) {
                    console.log(err);
                    throw err;
                }

                var db = client.db('ticketsdb');

                var collection = db.collection('tickets');

                var delete_id = request.params.id;
                console.log(delete_id);
                collection.deleteOne({_id: new mongodb.ObjectID(delete_id)});

            });
            
            return "Ticket Deleted" 
        }
    });


    // Analytics
    server.route({
        method : "GET",
        path : "/analytics/visited",
        handler : async(request , res) => { 
        
            const uri = "mongodb+srv://sa:sa@mongocluster.l6xsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

            const client = new MongoClient(uri);
            
            await client.connect();
    
            var db = client.db('ticketsdb');
    
            var collection = db.collection('tickets');

            var methd = request.query.method;
            var theaterID = request.query.TheaterID;

            // TODO : take values of Date Range from Query parameter

            if(methd == 'aggre')
            {
                var test = collection.aggregate([
                    { 
                        $match: { TheaterID: theaterID , CreatedDate: { $gte: new Date("2014-01-01"), $lt: new Date("2021-07-01") } }
                    },
                   {
                  $group :
                    {
                      _id : null,
                      PeopleVisited: { $sum: 1 } 
                    }
                }
                ]);
                
                return await test.toArray(); 
            }
            
            return "Get a Ticket"
        }
    });

    server.route({
        method : "GET",
        path : "/analytics/profit",
        handler : async(request , res) => { 
        
            const uri = "mongodb+srv://sa:sa@mongocluster.l6xsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

            const client = new MongoClient(uri);
            
            await client.connect();
    
            var db = client.db('ticketsdb');
    
            var collection = db.collection('tickets');

            var methd = request.query.method;
            var theaterID = request.query.TheaterID;

            // TODO : take values of Date Range from Query parameter

            if(methd == 'aggre')
            {
                var test = collection.aggregate([
                    { 
                        $match: { TheaterID: theaterID , CreatedDate: { $gte: new Date("2014-01-01"), $lt: new Date("2021-07-01") }} 
                    },
                   {
                  $group :
                    {
                      _id : null,
                      TheaterProft: { $sum: "$TicketPrice" } 
                    }
                }
                ]);
                

                return await test.toArray(); 
            }
            
            return "Get a Ticket"
        }
    });
    

start()
    .then((server) => console.log(`Server listening on ${server.info.uri}`))
    .catch(err => {
 
        console.error(err);
        process.exit(1);
    })