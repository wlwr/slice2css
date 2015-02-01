'use strict';
var async = require('async');
var glob = require('glob');
var sizeOf = require('image-size');
var path = require('path');
var fs = require('fs');
var doT = require('doT');


var slice2css = function(options) {

	var files, data = [];
	async.series([getFiles, getCssData, createCss]);

	function getFiles(cb) {
    files = glob.sync(options.srcImgs, {nodir : true});
    cb();
	}

	function getCssData(cb) {
    async.eachSeries(files, iterator, function() {
    	cb();
    });
	}

	function createCss(cb) {
		var content = cssTemplate(data);
		fs.writeFileSync(options.destCss, content);
	}

	function iterator(file, _cb) {
    sizeOf(file, function(err, size) {
      if (err) 
      	return _cb(err);
      data.push({
          filepath: file,
          imageurl: path.relative(path.dirname(options.destCss), file).split(path.sep).join('/'),
          classname: path.basename(file, path.extname(file)),
          width: size.width,
          height: size.height
      })
      _cb()
    })
  }

  function cssTemplate(data) {
  	var tmpl = "{{~it:item:index}}.{{= item.classname }}{width: {{= item.width }}px; height: {{= item.height }}px; background-image: url('{{= item.imageurl}}'); background-repeat: no-repeat; } {{~}}";
  	return doT.template(tmpl)(data);
  }

  function sassTemplate() {

  }

}

module.exports = slice2css;