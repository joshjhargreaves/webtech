// Run a minimal node.js web server for local development of a web site.
// Put this program in the site folder and start it with "node server.js".
// Then visit the site at the address printed on the console.

// Configure the server to match a particular publishing location.  The prefix
// is either the actual path where the site will be published, or a 'random'
// prefix which makes sure that the site will work wherever it is published, or
// the empty string.  Requester is 'localhost' or a specific host name, so that
// requests are only accepted from one particular computer for security, or
// undefined to go public.  The protocol and port are usually http 80 or https
// 443, or port numbers above 1024 can be used to avoid the need for privileged
// running.  Key and certificate files are needed for https.  The checks
// appropriate to the publishing site should be switched on, and the set of
// supported types should be set to those which are acceptable on the
// publishing site.
var prefix = '/anywhere';
var requester = 'localhost';
var port = process.env.PORT;
var protocol = 'http'; //https
var key = './server.key';
var cert = './server.cert';
var checkXhtml = true;
var checkCase = true;
var checkSite = true;
var checkSpaces = true;
var checkLower = true;
var types = {
  '.html' : 'text/html',
  '.css'  : 'text/css',
  '.js'   : 'application/javascript',
  '.png'  : 'image/png',
  '.svg'  : 'image/svg+xml',
}

// Load the web-server, file-system and file-path modules.
var web = require(protocol);
var fs = require('fs');
var path = require('path');

// Response codes: see http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
var OK = 200, Redirect = 307, NotFound = 404, BadType = 415, Error = 500;

// Succeed, sending back the content and its type.
function succeed(response, type, content) {
  var typeHeader = { 'Content-Type': type };
  response.writeHead(OK, typeHeader);
  response.write(content);
  response.end();
}

// Tell the browser to try again at a different URL.
function redirect(response, url) {
  var locationHeader = { 'Location': url };
  response.writeHead(Redirect, locationHeader);
  response.end();
}

// Give a failure response with a given code.
function fail(response, code) {
  response.writeHead(code);
  response.end();
}

// Create and start a server which only listens to requests from a given host.
var server;
if (protocol == 'https') {
  var options = { key: fs.readFileSync(key), cert: fs.readFileSync(cert) };
  server = web.createServer(options, serve);
}
else if (protocol == 'http') server = web.createServer(serve);
server.listen(port);

// Serve a single request.  Redirect / to add the prefix, but otherwise
// insist that every URL should start with the prefix.  With the exception of
// "/", a folder URL does not have a default index page added.
function serve(request, response) {
    var file = request.url;
    if (file == '/' && prefix != '') return redirect(response, prefix + "/");
    if (! starts(file,prefix)) return fail(response, NotFound);
    file = file.substring(prefix.length);
    if (file == "/") file = '/index.html';
    file = "." + file;
    var type = findType(request, path.extname(file));
    if (! type) return fail(response, BadType);
    if (checkCase && ! matchCase(file)) return fail(response, NotFound);
    if (checkSite && ! inSite(file)) return fail(response, NotFound);
    if (checkSpaces && ! noSpaces(file)) return fail(response, NotFound);
    if (checkLower && ! isLower(file)) return fail(response, NotFound);
    try { fs.readFile(file, ready); }
    catch (err) { return fail(response, Error); }

    function ready(error, content) {
        if (error) return fail(response, NotFound);
        succeed(response, type, content);
    }
}

// Find the type to respond with, using content negotiation for xhtml.
function findType(request, extension) {
    var type = types[extension];
    if (! type) return type;
    if (extension != ".html") return type;
    if (! checkXhtml) return type;
    var accepts = request.headers['accept'].split(",");
    if (accepts.indexOf(type) < 0) return type;
    return 'application/xhtml+xml';
}

// Check whether a string starts with a prefix
function starts(s, prefix) { return s.indexOf(prefix) == 0; }

// Check that the case of a path matches the actual case of the files.
// This is needed if the target publishing site is case-sensitive, and you are
// running this server on a case-insensitive file system such as Windows or
// (usually) OS X on a Mac.  If it gets too expensive, consider caching the
// results.
function matchCase(file) {
  var parts = file.split('/');
  var dir = '.';
  for (var i=1; i<parts.length; i++) {
    var names = fs.readdirSync(dir);
    if (names.indexOf(parts[i]) < 0) return false;
    dir = dir + '/' + parts[i];
  }
  return true;
}

// Check that a file is inside the site.
var site = fs.realpathSync('.') + path.sep;
function inSite(file) {
  var real;
  try { real = fs.realpathSync(file); }
  catch (err) { return false; }
  return starts(real, site);
}

// Check that a name contains no spaces.
function noSpaces(name) {
  return (name.indexOf(' ') < 0);
}

// Check that a name is lower case.  This is not essential, it is just a
// convention to avoid confusion among non-experts.
function isLower(name) {
  return (name == name.toLowerCase());
}

// Do a quick test of the URL check functions.
function test() {
  if (! inSite('./index.html')) console.log('inSite failure 1');
  if (inSite('./../site')) console.log('inSite failure 2');
  if (! matchCase('./index.html')) console.log('matchCase failure');
  if (matchCase('./Index.html')) console.log('matchCase failure');
  if (! noSpaces('./index.html')) console.log('noSpaces failure');
  if (noSpaces('./my index.html')) console.log('noSpaces failure');
  if (! isLower('.index.html')) console.log('isLower failure');
  if (isLower('./Index.html')) console.log('isLower failure');
}

// Do testing, and print out the server address.
test();
var suffix;
if (protocol == 'http' && port == '80') suffix = '';
else if (protocol == 'https' && port == '443') suffix = '';
else suffix = ':' + port;
console.log('Server running at ' + protocol + '://localhost' + suffix + '/');
