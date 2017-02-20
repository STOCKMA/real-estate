//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

app.set( 'view engine', 'ejs' );
app.use( '/assets', express.static( 'assets' ) );
function callLeboncoin() {
    //creating a var for the url
    var url = 'https://www.leboncoin.fr/ventes_immobilieres/1087625160.htm?ca=12_s'

    request( url, function ( error, response, html ) {
        if ( !error && response.statusCode == 200 ) {
            var $ = cheerio.load( html )
var lbcDataArray = $( 'section.properties span.value' )

            var lbcData = {
                price: parseInt( $( lbcDataArray.get( 0 ) ).text().replace( /\s/g, '' ), 10 ), //récupérer les prix sans euro et sans espaces
                city: $( lbcDataArray.get( 1 ) ).text().trim().toLowerCase().replace( /\s/g, '-' ),
                type: $( lbcDataArray.get( 2 ) ).text().trim().toLowerCase(),
 surface: parseInt( $( lbcDataArray.get( 4 ) ).text().replace( /\s/g, '' ), 10 )
            }
            console.log( 'data', lbcData )

        }
        else {
            console.log( error )
        }
    })
}
//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
var estimation = { 
         Title: "Estimation du bien", 
     Averageprice: 0, 
     Verdict: "", 
 } 
 
 
 app.get( '/', function ( req, res ) { 
         if ( req.query.lienLBC ) { 
                 request( req.query.lienLBC, function ( error, response, body ) { 
                         if ( !error && response.statusCode == 200 ) { //Si y'a pas d'erreur  
                                 var $ = cheerio.load( body ); 
                 
 
                                 //prix du bien immobilier 
                                 $( 'h2.item_price.clearfix span.value' ).each( function ( i, element ) { 
                                         var a = $( this ); 
                                         info.price = a.text().trim(); 
                                     }); 
                 
 
                                 //Surface du bien : 
                                 //On balaye les div qui contiennent un h2 de classe clearfix et un span de class property jusqu'à trouver celui qui contient la Surface : 
                                 $( 'h2.clearfix span.property' ).each( function ( i, element ) { 
                                         var a = $( this ); 
                                         if ( a.text() == "Surface" ) { 
                                                 info.surface = a.next().text() 
                                             } 
                                     }); 
                 
 
                                 //Ville et code postal du bien :  
                                 $( 'div.line.line_city span.value' ).each( function ( i, element ) { 
                                         var a = $( this ); 
                                         //On split le résultat qui contient la ville et le code postal dans le même string :  
                                         info.city = a.text().split( ' ' )[0]; 
                                         info.codePostal = a.text().split( ' ' )[1]; 
                                     }); 
                 
 
                                 //Type du bien :  
                               $( 'h2.clearfix span.property' ).each( function ( i, element ) { 
                                         var a = $( this ); 
                                         if ( a.text() == "Type de bien" ) { 
                                                 info.type = a.next().text() 
                                             } 
                                     }); 
                 
                                  //Nombre de pièces :  
                                 $( 'h2.clearfix span.property' ).each( function ( i, element ) { 
                                         var a = $( this ); 
                     
 
                                         //"Pièces ne passe pas, il ne reconnait pas le è" 
                                         if ( a.text() == "Pi�ces" ) { 
                                                 info.pieces = a.next().text() 
                                            } 
                                     }); 
                 
 
                                 //On retire € et les espaces de la chaine de caractères du prix pour ne garder que les chiffres et on converti ensuite en int             
                                 info.price = info.price.split( " " )[0] + info.price.split( " " )[1]; 
                                 info.price = parseInt( info.price ); 
                                 //On retire le "m2" de la chaine de caractère de surface :  
                                 info.surface = parseInt( info.surface ); 
                 
 
                                 //Calcul du prix du m2: 
                                 info.prixM2 = info.price / info.surface; 
                 
 
                                 //On va ensuite chercher le prix moyen d'un bien dans la même ville sur une autre site :  
                 
 
                 
 
                                 //On entre directement sur le résultat de la recherche avec la concaténation du site avec la ville - codePostal :  
                                 request( 'https://www.meilleursagents.com/prix-immobilier/' + info.city.toLowerCase() + '-' + info.codePostal, function ( error, response, body ) { 
                                         if ( !error && response.statusCode == 200 ) { 
                                                 var averagePrice = ""; 
                                                 //Il faut maintenant récupérer le prix moyen du mètre carré :  
                                                 var $ = cheerio.load( body ); 
                                                 $( 'div.small-12.medium-6.columns.prices-summary__cell--row-header ' ).each( function ( i, element ) { 
                                                         var a = $( this ); 
                                                         //Si on cherche le prix au m2 d'un appartement :  
                                                         if ( info.type == "Appartement" ) { 
                                 
 
                                                                 if ( a.children()[0].next.data == "Prix m2 appartement" ) { 
                                                                         averagePrice = a.next().next().text(); 
                                                                         //Très étrangement, les chiffres se situent de la position 14 à 19 sur le string... 
                                                                         averagePrice = averagePrice.substring( 14, 19 ); 
                                                                         averagePrice = averagePrice.split( " " ); 
                                                                         estimation.Averageprice = averagePrice[0] + averagePrice[1]; 
                                                                     } 
                                                             } 
                                                         //Si on cherche le prix au m2 d'une maison :  
                                                         if ( info.type == "Maison" ) { 
                                                                 if ( a.children()[0].next.data == " Prix m2 maison" ) { 
                                                                         averagePrice = a.next().next().text(); 
                                                                         //Très étrangement, les chiffres se situent de la position 14 à 19 sur le string... 
                                                                         averagePrice = averagePrice.substring( 14, 19 ); 
                                                                         averagePrice = averagePrice.split( " " ); 
                                                                         estimation.Averageprice = averagePrice[0] + averagePrice[1]; 
                                                                     } 
                                                             } 
                                                     }); 
                                             } 
                                         //Il ne reste plus qu'à comparer les deux valeurs et donner un verdict :  
                                         if ( estimation.Averageprice < info.prixM2 ) { 
                                                 estimation.Verdict = "Le prix au m2 de ce bien est au dessus de la moyenne pour cette ville."; 
                                             } 
                                         else if ( estimation.Averageprice == info.prixM2 ) { 
                                                 estimation.Verdict = "Le prix au m2 de ce bien est exactement celui de la moyenne pour cette ville" 
                                             } 
                                         else { 
                                                 estimation.Verdict = "Le prix au m2 de ce bien est inférieur à celui de la moyenne pour cette ville" 
                                             } 
                     
 
                     
 
                                         //Affichage des données dans la page Web : 
                                         res.render( 'home', { 
                         
 
                                                 message: info.price, 
                                                 message2: info.surface, 
                                                 message3: info.city, 
                                                 message4: info.codePostal, 
                                                 message5: info.type, 
                                                 message6: info.pieces, 
                                                 message7: info.prixM2, 
                                                 message8: estimation.Averageprice, 
                                                 message9: estimation.Verdict, 
                                             }); 
                                 }); 
             
 
                         } 
                     else { 
                     console.log( error ); 
                     } 
             }) 
     } 
     else { 
             res.render( 'home', { 
         
 
                     message: info.price, 
                     message2: info.surface, 
                     message3: info.city, 
                     message4: info.codePostal, 
                     message5: info.type, 
                     message6: info.pieces, 
                     message7: info.prixM2, 
                     message8: estimation.Averageprice, 
                     message9: estimation.Verdict, 
                 }); 
     } 
 }); 


//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});