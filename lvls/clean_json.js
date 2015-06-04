process.stdin.setEncoding('utf8');


var all = "";
process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        all += chunk+"\n";
    }
});


process.stdin.on('end', function() {
    eval("o="+all);
    console.log(JSON.stringify(o,null,2)); 
});
