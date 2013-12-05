var common = require('../common');
var formidable = common.formidable;
var http = require('http');
var assert = require('assert');
var fixtures = require('../fixture/multipart');

var server = http.createServer(function(req, res) {
    var form = new formidable.IncomingForm();

    var events_expected = ['fileBegin-pic1', 'file-pic1', 'fileBegin-pic2', 'file-pic2'];
    var events_received = [];

    form.parse(req);
    form.on('end', function() {
        assert.deepEqual(events_received, events_expected);
        res.end();
        server.close();
    });
    form.on('fileBegin', function(name, file) {
        events_received.push('fileBegin-' + name);
    });
    form.on('file', function(name, file) {
        events_received.push('file-' + name);
    });
});

var port = common.port;

server.listen(port, function(err){
    assert.equal(err, null);

    var request = http.request({
        port: port,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data; boundary=' + fixtures.rfc1867_2_files.boundary,
            'Content-Length': fixtures.rfc1867_2_files.raw.length
        }
    });

    request.write(fixtures.rfc1867_2_files.raw);
    request.end();
});

