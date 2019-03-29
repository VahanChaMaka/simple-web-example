'use strict';

var rest = require('rest');
var defaultRequest = require('rest/interceptor/defaultRequest');
var mime = require('rest/interceptor/mime');
var uriTemplateInterceptor = require('./api/uriTemplateInterceptor');
var errorCode = require('rest/interceptor/errorCode');
var baseRegistry = require('rest/mime/registry');

var registry = baseRegistry.child();

registry.register('text/uri-list', require('./api/uriListConverter'));
registry.register('application/hal+json', require('rest/mime/type/application/hal'));

module.exports.sendRequest = function sendRequest(action, params, data, callback, failCallback) {
    var xhr = new XMLHttpRequest();

    var json = JSON.stringify(data);

    var uri = '/spring/' + action + '?';
    for(var param in params){
        uri += param + '=' + params[param] + '&';
    }

    xhr.open("POST", uri, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xhr.onreadystatechange = function(){
        if(this.readyState == 4) {
            if (this.status == 200) {
                callback(this);
            } else {
                failCallback(this);
            }
        }
    };

    xhr.send(json);
}