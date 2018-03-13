var express = require('express');
var router = express.Router();
var sql = require("mssql");


var config = {
    user:     'FACT_User',
    password: 'fact_userpw',
    server:   'steve-lenovo\\sqlexpress', 
    database: 'FACTDB' 
  };

  
function makeSpeakable(strRating){

  if(strRating === "BBB-"){
    return "triple b minus";
  }
  if(strRating === "BB-"){
    return "double b minus";
  }

  if(strRating === "BB"){
    return "double b";
  }

  if(strRating === "B-"){
    return "b minus";
  }

  if(strRating === "C+"){
    return "c plus";
  }


}

var strVoiceCode=`
<html>
<script>
  const msg 	= new SpeechSynthesisUtterance();
  msg.voice   = "Microsoft Hazel Desktop - English (Great Britain)"

  function toggle(startOver = true) {

	  msg.text 	= document.getElementById('text').value;
	  speechSynthesis.cancel();
    
    if (startOver) {
      		speechSynthesis.speak(msg);
    }
  }

</script>
</head>
<body onload='toggle();'>
`
  
router.get('/', function(req, res, next) {
  // connect to your database
sql.connect(config, function (err) {
    
    if (err) console.log(err);
  
    // create Request object
    var request = new sql.Request();
       
    // query to the database and get the records
       request.query( `select TOP 3 [arch_company_legal_name],
        (select TOP 1 trans_text FROM dbo.tbl_translations WHERE trans_token LIKE [arch_final_pd_rating]+'%' )  as [rating],
        [arch_final_pd_effective_date] ,
        [arch_statement_date] 
        from [tbl_arc_reports] where arch_islast = 1 and arch_final_pd_effective_date > '2012-3-16'
        ORDER BY 1`, function (err, recordsets) {


        if (err) console.log(err)
        else{
        
        var strVoiceMessage = 'I have the found ' + recordsets.recordset.length + ' records as follows:';

         var strTable = '<table border=1>';
         strTable +='<tr><td>Company</td> <td>Rating</td> <td>Effective Date </td> <td>Statement Date</td></tr>' 
          for(var i = 0; i < recordsets.recordset.length; i++) {
            strTable += '<tr>'
            strTable += '<td>' + recordsets.recordset[i].arch_company_legal_name      + '</td>';
            strTable += '<td>' + recordsets.recordset[i].rating                       + '</td>';
            strTable += '<td>' + recordsets.recordset[i].arch_final_pd_effective_date + '</td>';
            strTable += '<td>' + recordsets.recordset[i].arch_statement_date          + '</td>';
            strTable += '</tr>'

            strVoiceMessage += recordsets.recordset[i].arch_company_legal_name  + ' rated: ' +  makeSpeakable(recordsets.recordset[i].rating) + ', .'; 
          }
          strVoiceMessage += '. Would you like to search for any other PD ratings ?'
          strTable += "</table> <input name='text' Id='text' type='hidden' value='" + strVoiceMessage + "'>";
          strTable += '</body></html>';

          res.send(strVoiceCode + strTable);
         
          // res.send(recordsets);

          sql.close();
        }

         
        
    });
  });

});

  module.exports = router;