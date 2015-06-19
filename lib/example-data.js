/*global define: true*/
define(function() {
    var data = {};
    
    data.relational_01_neg = {
        "resultset": [
            ["London", "2011-06-05", -72],
            ["London", "2011-06-12", -50],
            ["London", "2011-06-19", -20],
            ["London", "2011-06-26", -23],
            ["London", "2011-07-03", -72],
            ["London", "2011-07-10", 50],
            ["London", "2011-07-17", 30],
            ["London", "2011-07-24", -23],
            ["London", "2011-07-31", -72],
            ["London", "2011-08-07", -50],
            ["London", "2011-08-14", 100],
            ["London", "2011-08-21", -23],
            ["London", "2011-08-28", -20],
            //
            ["Paris", "2011-06-05", 27],
            ["Paris", "2011-06-12", 5],
            ["Paris", "2011-06-19", 2],
            ["Paris", "2011-06-26", 32],
            ["Paris", "2011-07-03", 24],
            ["Paris", "2011-07-10", 4],
            ["Paris", "2011-07-17", 105],
            ["Paris", "2011-07-24", 53],
            ["Paris", "2011-07-31", 17],
            ["Paris", "2011-08-07", 20],
            ["Paris", "2011-08-14", -40],
            ["Paris", "2011-08-21", 43],
            ["Paris", "2011-08-28", 40],
            //
            ["Lisbon", "2011-07-03", 60],
            ["Lisbon", "2011-07-10", 40],
            ["Lisbon", "2011-07-17", 105],
            ["Lisbon", "2011-07-24", -30],
            ["Lisbon", "2011-08-07", 50]
        ],
        "metadata": [{
            "colIndex": 0,
            "colType": "String",
            "colName": "City"
        }, {
            "colIndex": 1,
            "colType": "String",
            "colName": "Date"
        }, {
            "colIndex": 2,
            "colType": "Numeric",
            "colName": "Profit"
        }]
    };
    
    return data;
});