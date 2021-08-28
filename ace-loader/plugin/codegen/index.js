/******/ (() => { // webpackBootstrap
/******/    "use strict";
/******/    var __webpack_modules__ = ({

/***/ 784:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorMap = void 0;
exports.errorMap = new Map([
    ["fileError", "Visual file is damaged"],
    ["versionError", "Version number of visual file does not match"],
    ["modelError", "Visual model in visual file is damaged"],
    ["codegenError", "Codegen hml and css failed"],
]);


/***/ }),

/***/ 243:
/***/ ((__unused_webpack_module, exports) => {


/*
 * @Copyright (c) Huawei Technologies Co., Ltd. 2020-2020. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Style = exports.Tag = void 0;
class Tag {
  /**
   * @description: constructor for Tag
   * @param tagName is name of component
   * @param attributes is attributes of component
   * @param content is child elements or innerHtml of component
   */
  constructor(tagName, attributes, content) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.content = content;
  }
  accept(v) {
    return v.genTag(this);
  }
}
exports.Tag = Tag;
class Style {
  /**
   * @description: constructor for Style
   * @param kind distinguishes id and class
   * @param name is name of id or class
   * @param content is style name and value of component
   */
  constructor(kind, name, content) {
    this.kind = kind;
    this.name = name;
    this.content = content;
  }
  accept(v) {
    return v.genStyle(this);
  }
}
exports.Style = Style;


/***/ }),

/***/ 245:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
 * @Copyright (c) Huawei Technologies Co., Ltd. 2020-2020. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StringWriter = void 0;
const ASTNodeVisitor_1 = __webpack_require__(573);
const Cache_1 = __webpack_require__(695);
class StringWriter {
  constructor() {
    this.generator = ASTNodeVisitor_1.ASTNodeGenerator.getMethodGen(new Cache_1.Cache(""));
  }
  /**
   * @description: generate HML
   * @param t is Tag in AST
   * @return HML code
   */
  genHML(t) {
    t.accept(this.generator);
    return this.generator.cache.toString();
  }
  /**
   * @description: generate CSS
   * @param t is Style in AST
   * @return CSS code
   */
  genCSS(t) {
    t.forEach((value) => {
      value.accept(this.generator);
    });
    return this.generator.cache.toString();
  }
}
exports.StringWriter = StringWriter;


/***/ }),

/***/ 573:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
 * @Copyright (c) Huawei Technologies Co., Ltd. 2020-2021. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ASTNodeGenerator = void 0;
const Token_1 = __webpack_require__(334);
class ASTNodeGenerator {
  /**
   * @description: constructor for BridgeVisitor
   * @param reference is cache for Harmony FA code
   */
  constructor(reference) {
    this.cache = reference;
  }
  /**
   * @description: code generator
   * @param ref is cache for code
   * @return ast node generator
   */
  static getMethodGen(ref) {
    if (ASTNodeGenerator.instance === undefined) {
      ASTNodeGenerator.instance = new ASTNodeGenerator(ref);
    }
    else {
      ASTNodeGenerator.instance.setCache(ref);
    }
    return ASTNodeGenerator.instance;
  }
  /**
   * @description: cache for code
   * @param ref is cache for code
   * @return void
   */
  setCache(ref) {
    this.cache = ref;
  }
  /**
   * @description: parse Tag in AST and generate code for Tag in cache
   * @param Tag in AST
   * @return void
   */
  genTag(t) {
    this.cache.concat(Token_1.TokenClass.TAG_START, t.tagName);
    this.cache.indentOff();
    t.attributes.forEach((value, key) => {
      let valueBK = "";
      for (const char of value) {
        valueBK += (char === "\"" ? "&quot;" : (char === "\n" ? "&#10;" : char));
      }
      this.cache.concat(Token_1.TokenClass.SPACE, key, Token_1.TokenClass.ASSIGN, Token_1.TokenClass.LQUOTE, valueBK, Token_1.TokenClass.RQUOTE);
    });
    if (t.content === null) {
      this.cache.concat(Token_1.TokenClass.EMPTY_TAG_END);
    }
    else {
      this.cache.concat(Token_1.TokenClass.TAG_END);
      if (typeof t.content === "string") {
        let contentBK = "";
        for (const char of t.content) {
          contentBK += (char === "<" ? "&#60;" : (char === "\n" ? "&#10;" : char));
        }
        this.cache.concat(contentBK);
      }
      else if (t.content.length !== 0) {
        this.cache.concat(Token_1.TokenClass.NEW_LINE);
        this.cache.indentOn();
        this.cache.incIndent();
        t.content.forEach((tag) => {
          tag.accept(this);
          this.cache.indentOff();
          this.cache.concat(Token_1.TokenClass.NEW_LINE);
          this.cache.indentOn();
        });
        this.cache.decIndent();
        this.cache.indentOn();
      }
      this.cache.concat(Token_1.TokenClass.END_TAG_START, t.tagName, Token_1.TokenClass.TAG_END);
    }
  }
  /**
   * @description: parse Style in AST and generate code for Style in cache
   * @param Style in AST
   * @return void
   */
  genStyle(s) {
    if (s.kind === "IDStyle") {
      this.cache.concat(Token_1.TokenClass.ID_STYLE_START);
      this.cache.indentOff();
    }
    this.cache.concat(s.name, Token_1.TokenClass.SPACE, Token_1.TokenClass.LBRA, Token_1.TokenClass.NEW_LINE);
    this.cache.indentOn();
    this.cache.incIndent();
    s.content.forEach((value, key) => {
      this.cache.concat(key, Token_1.TokenClass.COLON, Token_1.TokenClass.SPACE, value, Token_1.TokenClass.SEMICOLON, Token_1.TokenClass.NEW_LINE);
    });
    this.cache.decIndent();
    this.cache.concat(Token_1.TokenClass.RBRA, Token_1.TokenClass.NEW_LINE, Token_1.TokenClass.NEW_LINE);
  }
}
exports.ASTNodeGenerator = ASTNodeGenerator;
ASTNodeGenerator.instance = undefined;


/***/ }),

/***/ 844:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
 * @Copyright (c) Huawei Technologies Co., Ltd. 2020-2021. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CSSBridge = exports.HMLBridge = void 0;
const FATypeChecker_1 = __webpack_require__(335);
const AST_1 = __webpack_require__(243);
class HMLBridge {
  constructor() {
    this.errors = 0;
  }
  /**
   * @description: generate error message
   * @param msg is error message to showup in console
   */
  error(msg) {
    console.error("Code generating error: " + msg);
    this.errors += 1;
  }
  /**
   * @description: get error number
   * @return error number
   */
  getErrorCount() {
    return this.errors;
  }
  /**
   * @description: code generator for Tag, which is HML type in AST in IR
   * @param tag is a object with HML type to be generated
   * @return a code tree representing Harmony FA HML code
   */
  genTag(tag) {
    let content = null;
    if (FATypeChecker_1.hasTextContent(tag)) {
      content = tag.content;
    }
    else if (FATypeChecker_1.hasArrayContent(tag)) {
      const subTags = [];
      tag.content.forEach((t) => {
        const tree = t.accept(this);
        if (tree instanceof AST_1.Tag) {
          subTags.push(tree);
        }
        else {
          throw new Error("WTF: what a trrrible failure");
        }
      });
      content = subTags;
    }
    return new AST_1.Tag(tag.tagName, tag.attributes, content);
  }
  /**
   * @description: visitor gurdance method for contents,
   * sort out incoming type and guide to matching code generator
   * @param obj is a object with Model or Container or CharUI primitive types to be generated
   * @return a code tree representing input object
   */
  visit(obj) {
    if (FATypeChecker_1.isHmlNode(obj)) {
      return this.genTag(obj);
    }
    throw new Error("no return");
  }
}
exports.HMLBridge = HMLBridge;
class CSSBridge {
  constructor() {
    this.errors = 0;
    this.styles = [];
  }
  /**
   * @description: generate error message
   * @param msg is error message to showup in console
   */
  error(msg) {
    console.error("Code generating error: " + msg);
    this.errors += 1;
  }
  /**
   * @description: get error number
   * @return error number
   */
  getErrorCount() {
    return this.errors;
  }
  /**
   * @description: code generator for ID Style, which is CSS type in AST in IR
   * @param tag is a object with CSS type to be generated
   * @return a code tree representing Harmony FA CSS code
   */
  genIDStyle(tag) {
    if (tag.idStyle.size > 0) {
      this.styles.push(new AST_1.Style("IDStyle", tag.id, tag.idStyle));
    }
    if (FATypeChecker_1.hasArrayContent(tag)) {
      for (const child of tag.content) {
        child.accept(this);
      }
    }
  }
  /**
   * @description: code generator for Class Style, which is CSS type in AST in IR
   * @param style is a object with CSS type to be generated
   * @return a code tree representing Harmony FA CSS code
   */
  genClassStyle(style) {
    this.styles.push(new AST_1.Style("ClassStyle", style.className, style.content));
  }
  /**
   * @description: visitor gurdance method for contents,
   * sort out incoming type and guide to matching code generator
   * @param obj is a object with Model or Container or CharUI primitive types to be generated
   * @return a code tree representing input object
   */
  visit(obj) {
    if (FATypeChecker_1.isHmlNode(obj)) {
      this.genIDStyle(obj);
      return this.styles;
    }
    else if (FATypeChecker_1.isClassStyle(obj)) {
      this.genClassStyle(obj);
      return this.styles;
    }
    throw new Error("no return");
  }
}
exports.CSSBridge = CSSBridge;


/***/ }),

/***/ 695:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Copyright (c) Huawei Technologies Co., Ltd. 2020-2020. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Cache = void 0;
const Token_1 = __webpack_require__(334);
// There is no way pass value by reference with JS and TS, but object
class Cache {
  /**
   * @description: constructor for Cache
   * @param value is HML/CSS code with no indents
   */
  constructor(value) {
    this.value = value;
    this.indent = 0;
    this.flag = true;
  }
  /**
   * @description: when flag is true, there should be some indents
   * @return void
   */
  indentOn() {
    this.flag = true;
  }
  /**
   * @description: when flag is false, there should be no indents
   * @return void
   */
  indentOff() {
    this.flag = false;
  }
  /**
   * @description: increase indent
   * @return void
   */
  incIndent() {
    this.indent++;
  }
  /**
   * @description: decrease indent
   * @return void
   */
  decIndent() {
    this.indent--;
  }
  /**
   * @description: check whether indent is LT 0
   * @return boolean value representing whether indent is LT 0
   */
  checkIndent() {
    return this.indent < 0;
  }
  /**
   * @description: get indent
   * @return indents
   */
  getIndents() {
    if (this.flag) {
      let indents = "";
      Array.from(Array(this.indent).keys()).forEach(element => {
        indents += Token_1.TokenClass.INDENT;
      });
      return indents;
    }
    else {
      return "";
    }
  }
  /**
   * @description: concat indents and HML/CSS code
   * @param strings means HML/CSS code
   * @return HML/CSS code after indents are set
   */
  concat(...strings) {
    this.value += this.getIndents();
    this.value = this.value.concat(...strings);
    return String(this.value);
  }
  /**
   * @description: concat indents and HML/CSS code
   * @return HML/CSS code
   */
  toString() {
    return this.value;
  }
}
exports.Cache = Cache;


/***/ }),

/***/ 334:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Copyright (c) Huawei Technologies Co., Ltd. 2020-2020. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TokenClass = void 0;
var TokenClass;
(function (TokenClass) {
  TokenClass[TokenClass["IDENTIFIER"] = 0] = "IDENTIFIER";
  // literals
  TokenClass[TokenClass["STRING_LITERAL"] = 1] = "STRING_LITERAL";
  TokenClass[TokenClass["NUMBER"] = 2] = "NUMBER";
  TokenClass[TokenClass["CHARACTER"] = 3] = "CHARACTER";
  // special tokens
  TokenClass[TokenClass["EOF"] = 4] = "EOF";
  TokenClass[TokenClass["INVALID"] = 5] = "INVALID";
  TokenClass["EMPTY_DATA"] = "empty";
  TokenClass["ASSIGN"] = "=";
  // Escape character
  TokenClass["NEW_LINE"] = "\n";
  TokenClass["CARRIAGE_RETURN"] = "\r";
  TokenClass["INDENT"] = "  ";
  // delimiters
  TokenClass["SPACE"] = " ";
  TokenClass["LQUOTE"] = "\"";
  TokenClass["RQUOTE"] = "\"";
  TokenClass["TAG_START"] = "<";
  TokenClass["TAG_END"] = ">";
  TokenClass["EMPTY_TAG_END"] = "/>";
  TokenClass["END_TAG_START"] = "</";
  TokenClass["ID_STYLE_START"] = "#";
  TokenClass["CLASS_STYLE_START"] = ".";
  TokenClass["LBRA"] = "{";
  TokenClass["RBRA"] = "}";
  TokenClass["SEMICOLON"] = ";";
  TokenClass["COLON"] = ":";
})(TokenClass = exports.TokenClass || (exports.TokenClass = {}));


/***/ }),

/***/ 704:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.emit = exports.emitCSS = exports.emitHml = void 0;
/**
 * Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
 */
const BridgeVisitor_1 = __webpack_require__(844);
const ASTFileVisitor_1 = __webpack_require__(245);
/**
 * @description: output the HML source code of the model
 */
function emitHml(rootModel) {
  const visitor = new BridgeVisitor_1.HMLBridge();
  const ast = rootModel.accept(visitor);
  const stringWriter = new ASTFileVisitor_1.StringWriter();
  const res = stringWriter.genHML(ast);
  if (visitor.getErrorCount() > 0) {
    console.error("Cannot generate code, error found: " + visitor.getErrorCount().toString());
    return "error";
  }
  else {
    return res;
  }
}
exports.emitHml = emitHml;
/**
 * @description: output the CSS source code of the model
 */
function emitCSS(rootModel) {
  const visitor = new BridgeVisitor_1.CSSBridge();
  const styles = rootModel.accept(visitor);
  const stringWriter = new ASTFileVisitor_1.StringWriter();
  const res = stringWriter.genCSS(styles);
  if (visitor.getErrorCount() > 0) {
    console.error("Cannot generate code, error found: " + visitor.getErrorCount().toString());
    return "error";
  }
  else {
    return res;
  }
}
exports.emitCSS = emitCSS;
/**
 * @description: output all source code of the model
 */
function emit(rootModel) {
  const obj = {
    hml: emitHml(rootModel),
    css: emitCSS(rootModel),
  };
  return obj;
}
exports.emit = emit;


/***/ }),

/***/ 335:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Copyright (c) Huawei Technologies Co., Ltd. 2020-2021. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hasJsonTextContent = exports.hasJsonArrayContent = exports.isClassStyle = exports.hasArrayContent = exports.hasTextContent = exports.isText = exports.isHmlNode = exports.isContainer = void 0;
function isContainer(obj) {
  return obj.type === "Container";
}
exports.isContainer = isContainer;
function isHmlNode(obj) {
  return obj.type === "Container" || obj.type === "TextContent" || obj.type === "Base" || obj.type === "Text";
}
exports.isHmlNode = isHmlNode;
function isText(obj) {
  return obj.type === "Text";
}
exports.isText = isText;
function hasTextContent(obj) {
  return obj.content !== undefined && typeof obj.content === "string";
}
exports.hasTextContent = hasTextContent;
function hasArrayContent(obj) {
  return obj.content !== undefined && obj.content instanceof Array;
}
exports.hasArrayContent = hasArrayContent;
function isClassStyle(obj) {
  return obj.kind === "ClassStyle";
}
exports.isClassStyle = isClassStyle;
/**
 * @description: judge whether jsonmodel is nested
 * @param obj is jsonModel
 * @return obj is JsonContainerModel
 */
function hasJsonArrayContent(obj) {
  return obj.content !== undefined && obj.content instanceof Array;
}
exports.hasJsonArrayContent = hasJsonArrayContent;
/**
 * @description: judge whether type of jsonmodel's content is string
 * @param obj is jsonModel
 * @return obj is JsonTextContentModel
 */
function hasJsonTextContent(obj) {
  return obj.content !== undefined && typeof obj.content === "string";
}
exports.hasJsonTextContent = hasJsonTextContent;


/***/ })

/******/  });
/************************************************************************/
/******/  // The module cache
/******/  var __webpack_module_cache__ = {};
/******/
/******/  // The require function
/******/  function __webpack_require__(moduleId) {
/******/    // Check if module is in cache
/******/    var cachedModule = __webpack_module_cache__[moduleId];
/******/    if(cachedModule !== undefined) {
/******/      return cachedModule.exports;
/******/    }
/******/    // Create a new module (and put it into the cache)
/******/    var module = __webpack_module_cache__[moduleId] = {
/******/      // no module.id needed
/******/      // no module.loaded needed
/******/      exports: {}
/******/    };
/******/
/******/    // Execute the module function
/******/    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * Copyright (c) Huawei Technologies Co., Ltd. 2021-2021. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const FATypeChecker_1 = __webpack_require__(335);
const Emit_1 = __webpack_require__(704);
const errorMap_1 = __webpack_require__(784);
const visualVersion = 10;
/**
 * @description: codegen hml and css according to code in visual file
 * @param source is code in visual file
 * @return object of hmlCSS, errorType and errorMessage
 */
function genHmlAndCss(source) {
  const retObj = {
    hmlCss: {
      hml: "",
      css: "",
    },
    errorType: "",
    errorMessage: "",
  };
  try {
    // parse source code in visual file
    const visualSource = JSON.parse(source);
    const destVisualVersion = visualSource.VisualVersion;
    const regex = /^([1-9]+[0-9]*)$/;
    if (destVisualVersion === undefined) {
      retObj.errorType = "versionError";
    }
    else {
      const expression = destVisualVersion.match(regex);
      if (expression === null || parseInt(expression[1]) > visualVersion) {
        retObj.errorType = "versionError";
      }
    }
    try {
      const model = genHmlNode(JSON.parse(visualSource.content));
      const hmlCss = Emit_1.emit(model);
      if (hmlCss.hml === "error" || hmlCss.css === "error") {
        retObj.errorType = "codegenError";
      }
      retObj.hmlCss = hmlCss;
    }
    catch (e) {
      retObj.errorType = "modelError";
    }
  }
  catch (e) {
    retObj.errorType = "fileError";
  }
  if (retObj.errorType !== "") {
    retObj.errorMessage = errorMap_1.errorMap.get(retObj.errorType);
    retObj.hmlCss.hml = "";
    retObj.hmlCss.css = "";
  }
  return retObj;
}
/**
 * @description: generate HmlNode
 * @param model is json format of HmlNode
 * @return HmlNode after codegen
 */
function genHmlNode(model) {
  const res = {
    id: model.id,
    tagName: model.tagName,
    type: model.type,
    idStyle: new Map(model.idStyle),
    attributes: new Map(model.attributes),
    accept: (v) => {
      return v.visit(res);
    },
  };
  if (FATypeChecker_1.hasJsonTextContent(model)) {
    res.content = model.content;
  }
  else if (FATypeChecker_1.hasJsonArrayContent(model)) {
    const content = [];
    for (const child of model.content) {
      content.push(genHmlNode(child));
    }
    res.content = content;
  }
  return res;
}
exports.genHmlAndCss = genHmlAndCss;

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
