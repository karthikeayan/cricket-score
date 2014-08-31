var express = require('express');
var router = express.Router();
var rest = require('restler');
var async = require('async');

/* GET home page. */
router.get('/', function(req, res) {
	var country = 'India';
	var allMatches = '';
	async.waterfall([
	              function(callback){
	            	rest.get('http://cricscore-api.appspot.com/csa').on('complete', function(result) {
					  if (result instanceof Error) {
					    console.log('Error:', result.message);
					    this.retry(5000); // try again after 5 sec
					  } else {
					    allMatches = result;
					    var allMatchesLength = allMatches.length;
					    var idMatch = '';
					    var foundIndiaMatch = true;
					    var result = [];
					    for (var i = 0; i < allMatchesLength; i++) {
					    	console.log(allMatches[i].t2);
					        if ( allMatches[i].t2 === country ){
					          console.log(country + ' matching in iteration ' + i);
					          idMatch = allMatches[i].id;
					          break;
					        } else if ( allMatches[i].t2 === country ) {
						      console.log(country + ' matching in iteration ' + i);
						      idMatch = allMatches[i].id;
						      break;
					        } else {
					          console.log('Iteration ' + i + ', not matching!')
					        }
					        if ( i == ( allMatchesLength - 1 ) ) {
					          console.log('setting foundIndiaMatch as false ' + foundIndiaMatch);
					          foundIndiaMatch = false;
					        }
					    }

					    if (!foundIndiaMatch){
					      var tmpResult = 'No ' + country + ' Matches has been found';
					      result[0] = { 'finalResult': tmpResult };
					      console.log(result[0]);
					    } else {
					      url =  'http://cricscore-api.appspot.com/csa?id=' + idMatch;
					      rest.get(url).on('complete', function(data) {
					    	result[0] = { 'finalResult': 'found' };
					        result[1] = data;
				            callback(null, result);
					      });
					    }
                      }
					});
	              },
	              
	              function(result, callback){
					console.log('Printing status for country ' + country + ': ' + result[0].finalResult);
					console.log('Printing Score: ' + JSON.stringify(result[1][0]["de"]));
					var teamNameScore = result[1][0]["de"].split('(')[0];
					var teamDetails = result[1][0]["de"].split('(')[1].split(')')[0];
					var topBowler = teamDetails.split(',')[3];
					
					if ( topBowler === undefined ){
						topBowler = '-';
					}
					
					//console.log(teamName + ', ' + teamScore + ', ' + teamDetails);
	                res.render('index', { title: 'Live Cricket Score',
	                                      teamName: teamNameScore.split(' ')[0],
	                                      teamScore: teamNameScore.split(' ')[1],
	                                      overs: teamDetails.split(',')[0],
	                                      oneBatsmen: teamDetails.split(',')[1],
	                                      twoBatsmen: teamDetails.split(',')[2],
	                                      topBowler: topBowler
	                	                });
	                callback(null);
	              }
	          ],
	          // optional callback
	          function(err){
	              // noting to be done here
	          });
});

module.exports = router;