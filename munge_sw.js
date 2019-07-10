var fs = require('fs');
var args = process.argv.slice(2);
var SW_FILE = args[0];
var data = fs.readFileSync(SW_FILE, 'utf-8');
var newValue = data.replace(
    /blacklist: *\[/,
    'blacklist: [/^\\/(api|oauth2)\\//,');
fs.writeFileSync(SW_FILE, newValue, 'utf-8');