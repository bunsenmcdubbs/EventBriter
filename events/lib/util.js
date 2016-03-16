// fancy new es6 (javascript 6) syntax. It's just a normal function, don't worry
// call them with `dateToyyyyMMdd("2015-01-03")` etc.
dateToyyyyMMdd = date => date.toISOString().split("T")[0];
yyyyMMddToDate = yyyyMMdd => new Date(yyyyMMdd);
