'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var PathNotFoundErr = /** @class */ (function (_super) {
    __extends(PathNotFoundErr, _super);
    function PathNotFoundErr(pathName) {
        if (pathName === void 0) { pathName = ''; }
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, params) || this;
        // eslint-disable-next-line
        // @ts-ignore
        if (Error.captureStackTrace)
            Error.captureStackTrace(_this, PathNotFoundErr);
        _this.name = 'PathNotFoundError';
        _this.message = pathName ? "Path not found from the given path name: " + pathName : "Path name is not provided";
        return _this;
    }
    return PathNotFoundErr;
}(Error));
var ParamRequiredErr = /** @class */ (function (_super) {
    __extends(ParamRequiredErr, _super);
    function ParamRequiredErr(_a) {
        var paramName = _a.paramName, pathParams = _a.pathParams;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, params) || this;
        // eslint-disable-next-line
        // @ts-ignore
        if (Error.captureStackTrace)
            Error.captureStackTrace(_this, ParamRequiredErr);
        _this.name = 'ParamRequiredError';
        _this.message = "\n      Param [" + paramName + "] is required. And you are passing " + JSON.stringify(pathParams) + "\n    ";
        return _this;
    }
    return ParamRequiredErr;
}(Error));

var PARAM_PATTERN = /:[_0-9a-zA-Z]*/g;
var Request = /** @class */ (function () {
    function Request(options) {
        var _this = this;
        this.onError = null;
        this.headers = null;
        /**
         * Get a random number from 0 to 1m
         */
        this._newXSelectorHeaderVal = function () { return Math.round(Math.random() * 1000000); };
        /**
         * _handleErr: will regenerate the x-selector header value if x-selector is required
         *             and the request fails.
         */
        this._handleErr = function (err) {
            if (_this.onError)
                return _this.onError(err);
            return Promise.reject(err);
        };
        this.setHeaders = function (headers) { return (_this.headers = headers); };
        if (!options.pathMap)
            throw new Error('pathMap option is required');
        if (!options.baseURL)
            throw new Error('baseURL option is required');
        this.pathMap = options.pathMap;
        this.request = axios.create({
            baseURL: options.baseURL,
            withCredentials: options.withCredentials || false,
        });
    }
    /**
     * Get the raw path from path map with given object key
     *
     * @params {string} pathName - The object key in path map
     */
    Request.prototype._getPath = function (pathName) {
        var path = this.pathMap[pathName];
        if (!path)
            throw new PathNotFoundErr(pathName);
        return path;
    };
    /**
     * Transform /caliber/:caliberId to /caliber/1 with the given params
     *
     * @params {string} path - The raw path. eg: /caliber/:caliberId
     * @params {Object} params - URL parameters map. eg: {caliberId}
     */
    Request._transformParams = function (path, params) {
        if (params === void 0) { params = {}; }
        var replaceParam = function (accPath, paramWithColon) {
            // :caliberId -> caliberId
            var key = paramWithColon.substring(1);
            if (!params[key]) {
                throw new ParamRequiredErr({ paramName: key, pathParams: params });
            }
            return accPath.replace(paramWithColon, params[key].toString());
        };
        var matchedParams = path.match(PARAM_PATTERN);
        if (matchedParams === null || matchedParams === void 0 ? void 0 : matchedParams.length) {
            return matchedParams.reduce(replaceParam, path);
        }
        return path;
    };
    /**
     * @params {string} pathName - The object key in path map
     * @params {Object} params - URL parameters map
     */
    Request.prototype._parsePath = function (pathName, params) {
        if (params === void 0) { params = {}; }
        var path = this._getPath(pathName);
        var encodedParams = Object.entries(params).reduce(function (acc, _a) {
            var _b;
            var key = _a[0], value = _a[1];
            return (__assign(__assign({}, acc), (_b = {}, _b[key] = encodeURIComponent(value), _b)));
        }, {});
        return Request._transformParams(path, encodedParams);
    };
    /**
     * Equivalent to REST get
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'queries'
     */
    Request.prototype.get = function (pathName, opts) {
        if (opts === void 0) { opts = {}; }
        var path = this._parsePath(pathName, opts.params);
        return this.request.get(path, { headers: this.headers, params: opts.queries }).catch(this._handleErr);
    };
    /**
     * Equivalent to REST post
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'body'
     */
    Request.prototype.post = function (pathName, opts) {
        if (opts === void 0) { opts = {}; }
        var path = this._parsePath(pathName, opts && opts.params);
        return this.request
            .post(path, opts && opts.body, { headers: this.headers, params: opts.queries })
            .catch(this._handleErr);
    };
    /**
     * Equivalent to REST put
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'body'
     */
    Request.prototype.put = function (pathName, opts) {
        if (opts === void 0) { opts = {}; }
        var path = this._parsePath(pathName, opts.params);
        return this.request.put(path, opts.body, { headers: this.headers, params: opts.queries }).catch(this._handleErr);
    };
    /**
     * Equivalent to REST delete
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'body'
     */
    Request.prototype.delete = function (pathName, opts) {
        if (opts === void 0) { opts = {}; }
        var path = this._parsePath(pathName, opts.params);
        return this.request
            .delete(path, {
            data: opts.body,
            params: opts.queries,
            headers: this.headers,
        })
            .catch(this._handleErr);
    };
    return Request;
}());

module.exports = Request;
