const sql = require('mssql/msnodesqlv8');

var config = {
    server: '.',
    database: 'student_task_manager',
    driver:"msnodesqlv8",
    options: {
        trustedConnection: true
    } 
}

sql.connect(config,function(err){
    if(err)console.log(err);
    var request = new sql.Request();

})