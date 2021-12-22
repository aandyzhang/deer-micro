(window["webpackJsonp_react15"] = window["webpackJsonp_react15"] || []).push([[0],{

    /***/ "./dynamic.css":
    /*!*********************!*\
      !*** ./dynamic.css ***!
      \*********************/
    /*! no static exports found */
    /***/ (function(module, exports, __webpack_require__) {
    
    var api = __webpack_require__(/*! ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
                var content = __webpack_require__(/*! !./node_modules/css-loader/dist/cjs.js!./dynamic.css */ "./node_modules/css-loader/dist/cjs.js!./dynamic.css");
    
                content = content.__esModule ? content.default : content;
    
                if (typeof content === 'string') {
                  content = [[module.i, content, '']];
                }
    
    var options = {};
    
    options.insert = "head";
    options.singleton = false;
                
    var update = api(content, options);
    console.log(update)
    
    
    module.exports = content.locals || {};
    
    /***/ }),
    
    /***/ "./node_modules/css-loader/dist/cjs.js!./dynamic.css":
    /*!***********************************************************!*\
      !*** ./node_modules/css-loader/dist/cjs.js!./dynamic.css ***!
      \***********************************************************/
    /*! no static exports found */
    /***/ (function(module, exports, __webpack_require__) {
    
    // Imports
    var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
    exports = ___CSS_LOADER_API_IMPORT___(false);
    // Module
    exports.push([module.i, "/* 动态加载的样式 */\n\n.react15-lib {\n  color: #818ff7;\n  background: red;\n}\n", ""]);
    // Exports
    module.exports = exports;
    
    
    /***/ })
    
    }]);
    //# sourceMappingURL=0.js.map