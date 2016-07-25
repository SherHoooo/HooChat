
var mysql = require("mysql");
function useDb(database){
	var connection = mysql.createConnection({
		host:'localhost',
		user:'root',
		password:'xia123',
		database:database
	});
	connection.connect();
	return connection;
};
exports.useDb = useDb;
