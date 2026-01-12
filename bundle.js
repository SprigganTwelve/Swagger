// ValueObject/Parameter.js
var Parameter = class {
  constructor({ key, inputEventCallback }) {
    this.key = key;
    this.value = null;
    this.inputEventCallback = inputEventCallback;
  }
  getInputHTMLNode() {
    const input = document.createElement("input");
    input.placeholder = this.key;
    input.addEventListener("input", (even) => {
      this.value = even.target.value;
      if (this.inputEventCallback)
        this.inputEventCallback(this.value);
    });
    return input;
  }
};
var Parameter_default = Parameter;

// models/Endpoints.js
var Endpoint = class {
  constructor({
    path = "/",
    inputObjektraEntries = null,
    outputObjektraEntries = null,
    queries = []
    //An array of query  object
  }) {
    this.pathTemplate = path;
    this.path = path;
    this.pathHTMLNode = null;
    this.inputObjektraEntries = inputObjektraEntries;
    this.outputObjektraEntries = outputObjektraEntries;
    this.queries = queries;
    this.params = this.extractParams();
  }
  resolvePath() {
    let p = this.template;
    this.params.forEach((param) => {
      if (param.value) {
        p = p.replace(`{${param.key}}`, param.value);
      }
    });
    return p;
  }
  extractParams() {
    const regex = /\{([^}]+)\}/g;
    const matches = [...this.pathTemplate.matchAll(regex)];
    return matches.map((match) => {
      const paramName = match[1];
      return new Parameter_default({
        key: paramName,
        inputEventCallback: (value) => {
          this.updatePath();
        }
      });
    });
  }
  updatePath() {
    let newPath = this.pathTemplate;
    this.params.forEach((p) => {
      const replacement = p.value ? p.value : `{${p.key}}`;
      newPath = newPath.replace(`{${p.key}}`, replacement);
    });
    this.path = newPath;
    if (this.pathHTMLNode)
      this.pathHTMLNode.textContent = newPath;
  }
  getPathHTMLNode() {
    if (this.pathHTMLNode) {
      return this.pathHTMLNode;
    }
    this.pathHTMLNode = document.createElement("div");
    this.pathHTMLNode.className = "endpoint";
    this.pathHTMLNode.textContent = this.path;
    return this.pathHTMLNode;
  }
  getQueriesStringinfied() {
    if (!Array.isArray(this.queries) || this.queries.length === 0) {
      return "";
    }
    const params = this.queries.filter((q) => q.value !== null && q.value !== "").map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`);
    return params.length ? `?${params.join("&")}` : "";
  }
};
var Endpoints_default = Endpoint;

// core/global.js
var AUTH_KEY2 = "";
var BASE_URL2 = "http://localhost:3000";
var GlobalSetings = {
  AUTH_KEY: AUTH_KEY2,
  BASE_URL: BASE_URL2
};
var global_default = GlobalSetings;

// ValueObject/ThemeStyle.js
var ThemeStyle = class {
  static OTAKU = "otaku-theme.css";
  static DARKENOTAKU = "darken-otaku-theme.css";
  static OTAKUEYESFRIENDLY = "otaku-eyes-friendly-theme.css";
  static GAMERS = "gamers-theme.css";
  static HACKERS = "hackers-theme.css";
  static GALAXY = "galaxy-theme.css";
  static IDE = "ide-theme.css";
  static WAR = "war-theme.css";
  static WHITE = "white-theme.css";
  static DARK = "dark-theme.css";
  //.. create your own style if you want uwing the html structure
};
var ThemeStyle_default = ThemeStyle;

// models/LayoutBuilder.js
var LayoutBuilder = class {
  constructor() {
    this.documentBody = document.querySelector("body");
    this.documentMetaData = document.querySelector("head");
    this.HTMLMainContent = null;
  }
  init(theme = ThemeStyle_default.IDE) {
    if (this.documentMetaData && !this.documentMetaData.querySelector("#swagger-api-style")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `../styles/${theme}`;
      link.id = "swagger-api-style";
      this.documentMetaData.appendChild(link);
    }
    if (!this.HTMLMainContent) {
      this.HTMLMainContent = document.createElement("div");
      this.HTMLMainContent.setAttribute("id", "container");
      this.documentBody.insertBefore(
        this.HTMLMainContent,
        this.documentBody.firstChild
      );
      return this.HTMLMainContent;
    }
    return this.HTMLMainContent;
  }
  renderHeaderInputs() {
    const header = document.createElement("header");
    header.innerHTML = `
                    <h1>API Administrator</h1>
                    <input id="base-url" placeholder="http://localhost:3000"/>
                    <input id="authorization-Key" placeholder="Authorization API Key"/>
        `;
    this.documentBody.prepend(header);
    const inputUrl = document.getElementById("base-url");
    const inputKey = document.getElementById("authorization-Key");
    inputUrl.addEventListener("input", (e) => {
      global_default.BASE_URL = e.target.value;
    });
    inputKey.addEventListener("input", (e) => {
      global_default.AUTH_KEY = e.target.value;
    });
  }
};
var LayoutBuilder_default = LayoutBuilder;

// models/Resource.js
var Resource = class {
  constructor(name, routes = []) {
    this.name = name;
    this.routes = routes;
  }
  render(container) {
    const resourceEl = document.createElement("div");
    resourceEl.className = "resource";
    const title = document.createElement("h2");
    title.className = "resource-title";
    title.textContent = this.name;
    resourceEl.appendChild(title);
    this.routes.forEach((route) => {
      resourceEl.appendChild(this.renderRoute(route));
    });
    container.appendChild(resourceEl);
  }
  //* Render a single route block
  renderRoute(route) {
    route.paint();
    return route.rootContainer;
  }
};
var Resource_default = Resource;

// ValueObject/ValueType.js
var ValueType2 = class _ValueType {
  static String = /* @__PURE__ */ Symbol("String");
  static Number = /* @__PURE__ */ Symbol("Number");
  static Array = /* @__PURE__ */ Symbol("Array");
  static Boolean = /* @__PURE__ */ Symbol("Boolean");
  static Object = /* @__PURE__ */ Symbol("Object");
  static extractValueType(v2) {
    if (typeof v2 === "string") return _ValueType.String;
    if (typeof v2 === "boolean") return _ValueType.Boolean;
    if (typeof v2 === "number") return _ValueType.Number;
    if (Array.isArray(v2)) return _ValueType.Array;
    if (typeof v2 === "object" && v2 !== null) return _ValueType.Object && Object.getPrototypeOf(v2) === Object.prototype;
    return null;
  }
  static isPlainObject(v2) {
    return typeof v2 == "object" && v2 !== null && !Array.isArray(v2) && Object.getPrototypeOf(v2) === Object.prototype;
  }
  static isNonEmptyObject(v2) {
    return _ValueType.isPlainObject(v2) && Object.keys(v2).length > 0;
  }
};
var ValueType_default = ValueType2;

// ValueObject/ObjekraField.js
var ObjektraField = class _ObjektraField {
  constructor({ key, type, value = null, ext = [] }) {
    const validTypes = Object.values(ValueType_default);
    if (!validTypes.includes(type)) {
      throw new TypeError("[ObjektraField] Invalid ValueType");
    }
    this.key = key;
    this.type = type;
    this.value = value;
    this.ext = Array.isArray(ext) ? ext : [];
  }
  parseIntoObject() {
    if (this.type !== ValueType_default.Object) {
      if (this.type == ValueType_default.Array) {
        let tab = [];
        for (const item of this.ext) {
          if (item instanceof _ObjektraField)
            tab.push(item.parseIntoObject());
          else
            tab.push(this._createPrimitiveInstance());
        }
        return { [this.key]: tab };
      }
      return { [this.key]: this._createPrimitiveInstance() };
    }
    let source = {};
    for (const field of this.ext) {
      Object.assign(source, field.parseIntoObject());
    }
    return { [this.key]: source };
  }
  _createPrimitiveInstance() {
    if (this.type === ValueType_default.Number) v = Number(this.value);
    if (this.type === ValueType_default.String) v = String(this.value);
    if (this.type === ValueType_default.Boolean) v = Boolean(this.value);
    return v;
  }
};
var ObjekraField_default = ObjektraField;

// helpers/HTMLHelper.js
var HTMLHelper = class {
  static style(el) {
    return new Proxy({}, {
      get(_, prop) {
        return (value) => {
          el.style[prop] = value;
          return el;
        };
      }
    });
  }
};
var HTMLHelper_default = HTMLHelper;

// helpers/ObjektraInputHelper.js
var ObjektraInputHelper = class _ObjektraInputHelper {
  /*=====================
      Input Helpers
  =====================*/
  static _resolveFlexibilityMode(flexibility) {
    switch (flexibility) {
      case 1:
        return "editable-value";
      case 2:
        return "editable-key";
      case 3:
        return "editable";
      default:
        return "";
    }
  }
  static _computeArrayFieldValue(entry, isScannable, inputCallback) {
    let scanner;
    if (isScannable) {
      scanner = document.createElement("input");
      scanner.placeholder = entry;
      if (inputCallback)
        scanner.addEventListener("input", (event) => inputCallback(event));
    } else {
      scanner = document.createElement("span");
      scanner.textContent = entry;
    }
    return scanner;
  }
  static _materializeObjektra({ entry, editableMode, arrayFieldConfig, isArrayInput, inputCallback, Depth = 1, HShift }) {
    const container = document.createElement("div");
    container.className = isArrayInput ? "json-array-input-container" : "json-object-input-container";
    const isObjectInput = arrayFieldConfig ? !isArrayInput : isArrayInput;
    console.log(isObjectInput ? { entry, arrayFieldConfig } : "");
    if (isObjectInput) {
      container.append(
        HTMLHelper_default.style(ObjektraRenderer_default._createBracket(isArrayInput, true)).marginLeft("17px"),
        this._resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth, HShift })
      );
    }
    container.appendChild(
      this._resolveInputRenderer({ entry, editableMode, arrayFieldConfig, inputCallback })
    );
    if (isObjectInput) {
      container.appendChild(HTMLHelper_default.style(ObjektraRenderer_default._createBracket(isArrayInput, false)).marginLeft("17px"));
    }
    return container;
  }
  static _resolveKeyRenderer({ entry, editableMode, arrayFieldConfig, Depth, HShift }) {
    const hasArrayConfig = arrayFieldConfig !== void 0;
    const isEditable = hasArrayConfig ? arrayFieldConfig.editableKey || arrayFieldConfig.editable : editableMode === "editable-key" || editableMode === "editable";
    if (isEditable) {
      return HTMLHelper_default.style(_ObjektraInputHelper._createDynamicKey(entry)).marginLeft(`${Depth * HShift}px`);
    }
    return HTMLHelper_default.style(ObjektraRenderer_default._createStaticKey(entry)).marginLeft(`${Depth * HShift}px`);
  }
  static _resolveInputRenderer({ entry, editableMode, arrayFieldConfig, inputCallback }) {
    const hasArrayConfig = typeof arrayFieldConfig !== "undefined";
    const isEditable = hasArrayConfig ? arrayFieldConfig.editable || arrayFieldConfig.editableValue : editableMode && editableMode !== "editable-key";
    if (!isEditable) {
      console.log(hasArrayConfig ? { entry, edit: arrayFieldConfig.editable || arrayFieldConfig.editableValue } : "");
      return this._createReadOnlyValue(
        entry.value ?? "  null"
      );
    }
    const input = this._createEditableInput(
      this._getTypeLabel(entry),
      this._getInputType(entry),
      (e) => inputCallback ? inputCallback(e) : entry.value = e.target.value
    );
    input.style.marginLeft = "5px";
    input.style.display = "inline-block";
    return input;
  }
  static _getTypeLabel(entry) {
    return entry.type.toString().replace("Symbol(", "").replace(")", "");
  }
  static _getInputType(entry) {
    if (entry.type === ValueType_default.Number) return "number";
    if (entry.type === ValueType_default.Boolean) return "checkbox";
    return "text";
  }
  static _createDynamicKey(objectField) {
    const key = document.createElement("div");
    key.style.display = "inline-block";
    key.className = "key-container";
    const input = this._createEditableInput(objectField.key ?? "", "text", (e) => objectField.key = e.target.value);
    const span = document.createElement("span");
    span.textContent = " : ";
    key.append(input, span);
    return key;
  }
  static _createEditableInput(placeholder = "", type = "text", inputCallback) {
    const input = document.createElement("input");
    input.placeholder = placeholder;
    input.type = type;
    input.addEventListener("input", (e) => {
      if (inputCallback)
        inputCallback(e);
    });
    const container = document.createElement("div");
    container.appendChild(input);
    container.style.display = "inline-block";
    return container;
  }
  static _createReadOnlyValue(textContent) {
    console.log({ textContent });
    const span = document.createElement("span");
    span.textContent = textContent;
    return span;
  }
};
var ObjektraInputHelper_default = ObjektraInputHelper;

// helpers/ObjektraRenderer.js
var ObjektraRenderer = class {
  //---------Helpers
  static _resolveJSONLayout(entries) {
    if (Array.isArray(entries[0]) && entries[0].length > 1 && ValueType_default.isPlainObject(entries[1]))
      return [entries[0], entries[1].array ?? false, { ...entries[1] }];
    return [entries, entries.some((e) => !(e instanceof ObjekraField_default))];
  }
  static _createStaticKey(entry, index, isArrayInput, textClassName = "json-object-key") {
    const key = document.createElement("div");
    key.className = textClassName;
    key.style.display = "inline-block";
    key.textContent = isArrayInput ? `${index ?? "index"} : ` : `${entry.key ?? "key"} : `;
    return key;
  }
  static _createSubObject(entry, Depth, buildJSONObjectView) {
    const sub = document.createElement("div");
    sub.className = "json-object-container";
    buildJSONObjectView({
      rootElement: sub,
      entries: entry,
      Depth: Depth + 1
    });
    return sub;
  }
  static _isParametizedValue(entry) {
    return entry[0] && !Array.isArray(entry[0]) && !(entry[1] instanceof ObjekraField_default) && (ValueType_default.isPlainObject(entry[1]) || ValueType_default.extractValueType(entry[1]) === ValueType_default.Boolean);
  }
  static _createBracket(isArrayInput, isLeft) {
    const b = document.createElement("div");
    b.className = "bracket";
    b.textContent = isArrayInput ? isLeft ? "[" : "]" : isLeft ? "{" : "}";
    return b;
  }
  static _generateInput({ entry, isArrayInput, arrayFieldConfig, inputCallback, Depth = 1, flexibility, HShift }) {
    const isField = entry instanceof ObjekraField_default;
    const editableMode = ObjektraInputHelper_default._resolveFlexibilityMode(flexibility);
    if (!isField) {
      let scanner = ObjektraInputHelper_default._computeArrayFieldValue(
        entry,
        typeof arrayFieldConfig === "undefined" ? editableMode && editableMode !== "editable-key" : typeof arrayFieldConfig == "boolean" ? arrayFieldConfig : arrayFieldConfig.editable,
        inputCallback
      );
      return scanner;
    }
    const container = ObjektraInputHelper_default._materializeObjektra({
      entry,
      HShift,
      editableMode,
      arrayFieldConfig,
      isArrayInput,
      inputCallback,
      Depth
    });
    return container;
  }
};
var ObjektraRenderer_default = ObjektraRenderer;

// models/Objektra.js
var Objektra = class {
  constructor({ entries, HShift = 20, textClassName = "json-object-text", mode = "simple-json-object", flexibility = 1 }) {
    if (!Array.isArray(entries)) {
      console.log("[Objektra] Bad entries");
      return;
    }
    this.entries = entries;
    this.textClassName = textClassName;
    this.HShift = HShift;
    this.mode = mode;
    this.flexibility = flexibility;
    this.canvas = document.createElement("div");
    this.canvas.className = "json-canvas";
    if (mode == "simple-json-object") {
      this.buildJSONObjectView({ rootElement: this.canvas, entries: this.entries });
    }
  }
  getHTMLNode() {
    return this.canvas;
  }
  /*=========================
      Mounting
  =========================*/
  buildJSONObjectView({ rootElement, entries, Depth = 1 }) {
    if (!Array.isArray(entries) || entries.length === 0) return;
    const [formatedEntries, isArrayInput, groupFieldOptions] = ObjektraRenderer_default._resolveJSONLayout(entries);
    rootElement.appendChild(ObjektraRenderer_default._createBracket(isArrayInput, true));
    formatedEntries.forEach((entry, index) => {
      rootElement.appendChild(
        this._createRow({
          entry,
          index,
          isArrayInput,
          Depth
        })
      );
    });
    rootElement.appendChild(ObjektraRenderer_default._createBracket(isArrayInput, false));
  }
  _createRow({ entry, index, isArrayInput, Depth }) {
    const row = document.createElement("div");
    row.className = "key-input-card";
    row.style.marginLeft = `${Depth * this.HShift}px`;
    row.appendChild(ObjektraRenderer_default._createStaticKey(entry, index, isArrayInput));
    if (entry instanceof ObjekraField_default && (entry.type === ValueType_default.Object || entry.type === ValueType_default.Array)) {
      row.appendChild(ObjektraRenderer_default._createSubObject(entry.ext, Depth, this.buildJSONObjectView.bind(this)));
    } else if (Array.isArray(entry)) {
      const isParameterizedValue = ObjektraRenderer_default._isParametizedValue(entry);
      if (isParameterizedValue) {
        row.appendChild(ObjektraRenderer_default._generateInput({
          //Represent data using options (object)
          entry: entry[0],
          isArrayInput: false,
          HShift: this.HShift,
          flexibility: this.flexibility,
          arrayFieldConfig: entry[1],
          inputCallback: (event) => entry[0] = event.target.value,
          Depth
        }));
        return row;
      }
      row.appendChild(ObjektraRenderer_default._createSubObject(entry, Depth, this.buildJSONObjectView.bind(this)));
    } else {
      row.appendChild(ObjektraRenderer_default._generateInput({ entry, isArrayInput, Depth, flexibility: this.flexibility }));
    }
    return row;
  }
  __createKeySpliter(Depth) {
    const keySpliter = document.createElement("span");
    keySpliter.className = "key-spliters";
    keySpliter.textContent = ",";
    keySpliter.style.marginLeft = `${Depth * this.HShift}px`;
    return keySpliter;
  }
  /*==============================
      Convertor/Parser Helper
  ================================*/
  //Transforme entries object into real Javascript basics object ({key: value, ....})
  static parseObjektraEntriesIntoObject(entries) {
    if (!Array.isArray(entries)) return null;
    const [formatedEntries, isArrayInput] = ObjektraRenderer_default._resolveJSONLayout(entries);
    if (!isArrayInput) {
      let obj = {};
      for (const field of formatedEntries) {
        Object.assign(obj, field.parseIntoObject());
      }
      return obj;
    }
    let arr = [];
    for (const item of formatedEntries) {
      if (item instanceof ObjekraField_default) {
        arr.push(item.parseIntoObject());
      } else {
        arr.push(item);
      }
    }
    return arr;
  }
  static parseObjectIntoObjektraFields(obj) {
    const entries = [];
    if (Array.isArray(obj)) {
      entries.push([], { array: true });
      for (const item of obj) {
        const type = ValueType_default.extractValueType(item);
        if (type === ValueType_default.String || type === ValueType_default.Number || type === ValueType_default.Boolean) {
          entries[0].push(item);
        }
      }
    }
  }
};
var Objektra_default = Objektra;

// svg/index.js
var drawerSvg = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#000000" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.256 8.606c0-0.269 0.106-0.544 0.313-0.75 0.412-0.412 1.087-0.412 1.5 0l14.119 14.119 13.913-13.912c0.413-0.412 1.087-0.412 1.5 0s0.413 1.088 0 1.5l-14.663 14.669c-0.413 0.413-1.088 0.413-1.5 0l-14.869-14.869c-0.213-0.213-0.313-0.481-0.313-0.756z"></path>
</svg>`;
var reloadSvg = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --><svg fill="#000000" width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M15.977 0c-7.994 0-14.498 6.504-14.498 14.498 0 7.514 5.79 13.798 13.236 14.44l-2.87 1.455c-0.354 0.195-0.566 0.632-0.355 0.977l0.101 0.262c0.211 0.346 0.668 0.468 1.021 0.274l4.791-2.453c0.006-0.004 0.012-0.003 0.019-0.007l0.322-0.176c0.177-0.098 0.295-0.257 0.342-0.434 0.049-0.177 0.027-0.375-0.079-0.547l-0.191-0.313c-0.003-0.006-0.009-0.010-0.012-0.015l-2.959-4.624c-0.21-0.346-0.666-0.468-1.021-0.274l-0.232 0.162c-0.354 0.194-0.378 0.694-0.168 1.038l1.746 2.709c-0.009-0-0.018-0.004-0.027-0.005-6.54-0.429-11.662-5.907-11.662-12.47 0-6.891 5.607-12.498 12.498-12.498 6.892 0 12.53 5.606 12.53 12.498 0 3.968-1.823 7.613-5 9.999-0.442 0.332-0.53 0.959-0.199 1.401 0.332 0.442 0.959 0.531 1.401 0.199 3.686-2.768 5.799-6.996 5.799-11.598-0-7.994-6.536-14.498-14.53-14.498z"></path></svg>`;

// models/Route.js
var Route = class {
  constructor({ endpoint, method = "GET", description = "", badges = null, headers = { "Content-Type": "application/json" } }) {
    this.method = method;
    this.endpoint = endpoint;
    this.description = description;
    this.response = null;
    this.headers = headers;
    this.badges = badges;
    this.counter = 0;
    this.reloader = document.createElement("div");
    this.reloader.classList.add("visibility-hidden", "svg-box");
    this.reloader.innerHTML = reloadSvg;
    this.drawer = document.createElement("div");
    this.drawer.className = "svg-box";
    this.drawer.innerHTML = drawerSvg;
    this.content = null;
    this.responseContainer = null;
    this.rootContainer = document.createElement("div");
  }
  paint() {
    const methodEl = document.createElement("div");
    methodEl.className = `method ${this.method}`;
    methodEl.textContent = this.method;
    const endpointEl = this.endpoint.getPathHTMLNode();
    const leadingContent = document.createElement("div");
    leadingContent.className = "route-leading";
    if (Array.isArray(this.badges) && this.badges.length > 0) {
      this.badges.forEach((badge) => leadingContent.appendChild(badge.getHTMLNode()));
    }
    leadingContent.append(this.reloader, this.drawer);
    const routeEntry = document.createElement("div");
    routeEntry.className = "route";
    routeEntry.append(methodEl, endpointEl, leadingContent);
    this.rootContainer.appendChild(routeEntry);
    if (this.endpoint.inputObjektraEntries || this.endpoint.outputObjektraEntries || this.endpoint.queries.length > 0 || this.endpoint.params.length > 0) {
      const rootHandler = this.drawRootContentHandler();
      routeEntry.addEventListener("click", () => {
        if (this.content) {
          this.toggleContentVisibility();
        }
      });
      rootHandler.appendChild(this.getResponseSectionHTMLNode());
      this.rootContainer.appendChild(rootHandler);
    } else {
      this.content = this.getResponseSectionHTMLNode();
      this.rootContainer.appendChild(this.content);
    }
  }
  //---Handlers
  drawRootContentHandler() {
    this.content = document.createElement("div");
    this.content.classList.add("display-none", "visibility-hidden");
    if (this.endpoint.params.length > 0) {
      this.content.appendChild(this.getParamatersSectionHTMLNode());
    }
    if (this.endpoint.queries.length > 0) {
      this.content.appendChild(this.getQuerySectionHTMLNode());
    }
    if (this.endpoint.inputObjektraEntries) {
      const inputObjektra = new Objektra_default({ entries: this.endpoint.inputObjektraEntries, flexibility: 1 });
      const inputSection = document.createElement("div");
      inputSection.className = "input-schema-container";
      inputSection.append(this.getHeaderContentTypeHTMLNode(), inputObjektra.getHTMLNode());
      this.content.appendChild(inputSection);
    }
    if (this.endpoint.outputObjektraEntries) {
      const outputObjektra = new Objektra_default({ entries: this.endpoint.outputObjektraEntries });
      const outputSection = document.createElement("div");
      outputSection.className = "output-schema-container";
      outputSection.appendChild(outputObjektra.getHTMLNode());
      this.content.appendChild(outputSection);
    }
    this.content.appendChild(this.getCallerBtnSectionHTMLNode());
    return this.content;
  }
  toggleContentVisibility() {
    this.content.classList.toggle("display-none");
    this.content.classList.toggle("route-content");
    this.content.classList.toggle("visibility-hidden");
  }
  //HTML helpers
  //HTMLResponseNode    (the section in the content used to draw the response)
  getResponseSectionHTMLNode() {
    const wrapper = document.createElement("div");
    wrapper.className = "route-response-container";
    const responseHeaderSection = document.createElement("div");
    responseHeaderSection.className = "response-header-section";
    const title = document.createElement("span");
    title.className = "response-title";
    const status = document.createElement("div");
    status.className = "response-status";
    const bodyContainer = document.createElement("div");
    bodyContainer.className = "response-body-container";
    responseHeaderSection.append(title, status, bodyContainer);
    wrapper.appendChild(responseHeaderSection);
    this.responseContainer = wrapper;
    return this.responseContainer;
  }
  getHeaderContentTypeHTMLNode() {
    const httpContentTypeOption = document.createElement("select");
    httpContentTypeOption.className = "header-options";
    if (this.headers["Content-Type"] == "application/json") {
      const httpJsonContentOption = document.createElement("option");
      httpJsonContentOption.selected = true;
      httpJsonContentOption.textContent = "JSON";
      httpContentTypeOption.append(httpJsonContentOption);
    } else {
    }
    return httpContentTypeOption;
  }
  getParamatersSectionHTMLNode() {
    const paramsSection = document.createElement("div");
    paramsSection.className = "params-section";
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = "Parameters";
    const inputsRow = document.createElement("div");
    inputsRow.className = "inputs-row";
    this.endpoint.params.forEach((param) => {
      inputsRow.appendChild(param.getInputHTMLNode());
    });
    paramsSection.append(title, inputsRow);
    return paramsSection;
  }
  getQuerySectionHTMLNode() {
    const querySection = document.createElement("div");
    querySection.className = "query-section";
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = "Queries";
    const inputsRow = document.createElement("div");
    inputsRow.className = "inputs-row";
    this.endpoint.queries.forEach((query) => {
      inputsRow.appendChild(query.getInputHTMLNode());
    });
    querySection.append(title, inputsRow);
    return querySection;
  }
  getCallerBtnSectionHTMLNode() {
    const btnSection = document.createElement("div");
    btnSection.className = "fetcher-btn-section";
    const btn = document.createElement("button");
    btn.className = "route-btn-executer";
    btn.textContent = "Execute";
    btnSection.appendChild(btn);
    const spinner = document.createElement("div");
    spinner.className = "execution-spinner";
    btnSection.appendChild(spinner);
    btn.addEventListener("click", () => this.execute());
    return btnSection;
  }
  // Fetch Call
  async execute() {
    try {
      const body = Objektra_default.parseObjektraEntriesIntoObject(this.endpoint.inputObjektraEntries);
      console.log(BASE_URL + this.endpoint.path + this.endpoint.getQueriesStringinfied());
      console.log(body);
      this.response = await fetch(
        BASE_URL + this.endpoint.path + this.endpoint.getQueriesStringinfied(),
        this.buildFetchOptions({ body, headers: this.headers })
      );
      this.mountResponseViewComponents();
      this.incrementCounter();
    } catch (error) {
    }
  }
  // Builds a fetch configuration using the global auth key
  buildFetchOptions({ body = null, headers }) {
    return {
      method: this.method,
      headers: { ...headers, "Authorization": AUTH_KEY },
      body: body ? JSON.stringify(body) : null
    };
  }
  async mountResponseViewComponents() {
    if (!this.response)
      return;
    const data = await this.response.json();
    document.querySelector(".route-response-container .response-status").textContent = `${this.response.status} ${this.response.statusText}`;
    document.querySelector(".route-response-container .response-title").textContent = "Response";
    if (this.response.headers["Content-Type"] === "text/html") {
      const link = document.createElement("a");
      link.textContent = "link_toward_html_content!";
      link.addEventListener("click", () => {
        const html = new Blob([data], { type: "text/html" });
        window.open(html, "_blank");
      });
      return;
    }
    const dataType = ValueType.extractValueType(data);
    if (dataType == ValueType.String || dataType == ValueType.Number) {
      const span = document.createElement("span");
      span.textContent = data;
      document.querySelector(".route-response-container  .response-body-container").appendChild(span);
    }
    const objektra = new Objektra_default({ entries: Objektra_default.parseObjectIntoEntries(data), flexibility: 0 });
    document.querySelector(".route-response-container  .response-body-container").append(objektra.getHTMLNode());
  }
  incrementCounter() {
    this.counter++;
    if (this.counter != 0) {
      this.reloader.classList.remove("visibility-hidden");
    }
  }
};
var Route_default = Route;

// ValueObject/Query.js
var Query = class {
  constructor({ key, mandatory = false }) {
    this.key = key;
    this.value = null;
    this.mandatory = mandatory;
  }
  getInputHTMLNode() {
    const input = document.createElement("input");
    input.placeholder = this.key;
    input.addEventListener("input", (even) => this.value = even.target.value);
    return input;
  }
};
var Query_default = Query;

// ValueObject/RouteBadge.js
var RouteBadge = class {
  constructor(text) {
    this.text = text;
    this.rootContainer = document.createElement("div");
    this.rootContainer.className = "route-badge";
    this.rootContainer.textContent = this.text;
  }
  getHTMLNode() {
    return this.rootContainer;
  }
};
var RouteBadge_default = RouteBadge;
export {
  Endpoints_default as Endpoint,
  LayoutBuilder_default as LayoutBuilder,
  ObjekraField_default as ObjektraField,
  Query_default as Query,
  Resource_default as Resource,
  Route_default as Route,
  RouteBadge_default as RouteBadge,
  ThemeStyle_default as ThemeStyle,
  ValueType_default as ValueType
};
