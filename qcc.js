var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var context = [];

function make_string_id_ready(str)
{
	str = str.replace(/[ ->]/g, '');
	str = str.toLowerCase();
	return str;
}

function create_html_from_filepaths(filepath)
{
	var out = filepath.map(function(x) {return x + '<br><br>'});
	return out.reduce(function(p, q) {return p + q});
}

function create_html_from_category(cat)
{
	var header = '<h1 id="' + make_string_id_ready(cat) + '">'+cat+'</h1>';
	var out = cat.map(function(x) {return create_html_from_filepaths(x) + '<h2>' + filepath + '</h2>'});
	return out.reduce(function(p, q) {return p + q}, header);
}

function create_html_from_context()
{
	out = context.map(function(x) {create_html_from_category(x)});
	return out.reduce(function(p, q) {return p + q}, '');
}

function set_inline_background_color() {
	self.css('background-color', colorcode); 
}

function add_file_path_if_not_yet_in_category()
{
	if (typeof(context[category][filepath]) == 'undefined') {
		context[category][filepath] = [];
	}
}

function add_quote_if_not_yet_in_category()
{
	quoteblock = self.parent();
	quote_text = quoteblock.text();
	highlighted = $('span[class^=c]', quoteblock);
	highlighted.each(function(){
		self = $(this);
		colorcode = self.css('background-color');
		if (cat = categories[colorcode]) {
			if (cat != category) {
				self.html(self.html().link('#' + make_string_id_ready(cat)));
			}
		}
	});
	quote_html = quoteblock.html();


	context[category][filepath][quote_text] = quote_html;
}

function add_category_if_not_yet_in_context()
{
	if (typeof(context[category]) == 'undefined') {
		context[category] = [];
	}
}

function add_quote_to_context()
{
	add_category_if_not_yet_in_context();
	add_file_path_if_not_yet_in_category();
	add_quote_if_not_yet_in_category();
}


function collect_highlighted()
{
	categories = this.categories;
	highlighted = $('span[class^=c]');
	highlighted.each(function(){
		self = $(this);
		colorcode = self.css('background-color');
		set_inline_background_color();
	});
	highlighted.each(function(){
		self = $(this);
		colorcode = self.css('background-color');
		if (colorcode.length) {
			if (category = categories[colorcode]) {
				add_quote_to_context();
			}
		}
	});
	html = create_html_from_context();
	write_output(html);
}

function generate_categories() 
{
	var categories = [];
	colors = $('span[class^=c]');
	colors.each(function(){
		self = $(this);
		colorcode = self.css('background-color');
		if (colorcode.length > 0) {
			category = self.text();
			categories[colorcode] = category;
		}
	});
	collect_highlighted = collect_highlighted.bind({'categories': categories});
	this.files_to_highlight.map(function(file){run_in_dom(file, collect_highlighted)});
}

function run_in_dom(file, func) 
{
	func = func || function(){};
	func_wrapper = function(errors, window) {
		filepath = path.basename(window.location._url.path);
		$ = window.jQuery;
		func()
	}
	scripts = (typeof(scripts) === 'undefined') ? 'jquery.js' : scripts;
	jsdom.env({
		file: file,
		scripts: jquery,
		done: func_wrapper
	});
}

function get_files_paths_from_dir(dir) {
	files = fs.readdirSync(dir);
	files = files.filter(function(path){return path != jquery}, files);
	files = files.filter(function(path){return path != 'guide.html'}, files);
	return files.map(function(path){return dir + '/' + path}, files);
}


function write_output(out) {
	html = '<!DOCTYPE html><html lang="en"><head><title>qualitative coding collector</title></head><body>';
	html += out;
	html += '</body></html>';
	fs.writeFile('out.html', html);
}

function write_collected_list_of_quotes(guide, filesdir) {
	files = get_files_paths_from_dir(filesdir); 
	generate_categories = generate_categories.bind({'files_to_highlight': files});	
	run_in_dom(guide, generate_categories);
}

var jquery = 'jquery.js';
filesdir = 'files_to_highlight';
guide = filesdir + '/guide.html';

write_collected_list_of_quotes(guide, filesdir);