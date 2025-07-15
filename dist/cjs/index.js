"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteLoader = void 0;
var class_transformer_1 = require("@geckoai/class-transformer");
var react_router_dom_1 = require("react-router-dom");
var qs_1 = __importDefault(require("qs"));
var Preloaded = (function () {
    function Preloaded(target, data, params, originParams) {
        this.target = target;
        this.data = data;
        this.params = params;
        this.originParams = originParams;
        this.useState = this.useState.bind(this);
    }
    Object.defineProperty(Preloaded.prototype, "query", {
        get: function () {
            return this.params;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Preloaded.prototype, "type", {
        get: function () {
            return this.target;
        },
        enumerable: false,
        configurable: true
    });
    Preloaded.prototype.useState = function () {
        var _this = this;
        var navigate = (0, react_router_dom_1.useNavigate)();
        return [this.data, function (value) {
                if (typeof value === 'function') {
                    navigate('?' + qs_1.default.stringify(__assign(__assign({}, _this.originParams), value(_this.params)), {
                        serializeDate: function (d) { return String(d.getTime()); }
                    }));
                }
                else {
                    navigate('?' + qs_1.default.stringify(__assign(__assign({}, _this.originParams), value), {
                        serializeDate: function (d) { return String(d.getTime()); }
                    }));
                }
            }];
    };
    return Preloaded;
}());
var PreloadBuilder = (function () {
    function PreloadBuilder(target, provide) {
        this.target = target;
        this.provide = provide;
        this.fetch = this.fetch.bind(this);
    }
    Object.defineProperty(PreloadBuilder.prototype, "type", {
        get: function () {
            return this.target;
        },
        enumerable: false,
        configurable: true
    });
    PreloadBuilder.for = function (target, provide) {
        return new PreloadBuilder(target, provide);
    };
    PreloadBuilder.prototype.fetch = function (container, transformer, origin) {
        return __awaiter(this, void 0, void 0, function () {
            var body, httpClient, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = transformer.transform(this.target, origin);
                        httpClient = container.get(this.provide.provide);
                        return [4, httpClient.fetch(body)];
                    case 1:
                        result = _a.sent();
                        return [2, [body, result.data]];
                }
            });
        });
    };
    return PreloadBuilder;
}());
var RouteLoader = (function () {
    function RouteLoader() {
        var loads = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            loads[_i] = arguments[_i];
        }
        this.__loads = loads;
        this.loader = this.loader.bind(this);
        this.usePreloadData = this.usePreloadData.bind(this);
    }
    RouteLoader.prototype.loader = function (_a, container) {
        var request = _a.request, params = _a.params;
        return __awaiter(this, void 0, void 0, function () {
            var url, query, transformer, origin;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = new URL(request.url);
                        query = qs_1.default.parse(url.search.replace(/^\?/, ''));
                        transformer = container.get(class_transformer_1.ClassTransformer);
                        origin = Object.assign({}, params, query);
                        return [4, Promise.all(this.__loads.map(function (prod) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, params, data;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4, prod.fetch(container, transformer, origin)];
                                        case 1:
                                            _a = _b.sent(), params = _a[0], data = _a[1];
                                            return [2, new Preloaded(prod.type, data, params, origin)];
                                    }
                                });
                            }); }))];
                    case 1: return [2, _b.sent()];
                }
            });
        });
    };
    RouteLoader.prototype.usePreloading = function () {
        var navigation = (0, react_router_dom_1.useNavigation)();
        return Boolean(navigation.location);
    };
    RouteLoader.prototype.usePreloadData = function () {
        return (0, react_router_dom_1.useLoaderData)();
    };
    RouteLoader.for = function () {
        var builders = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            builders[_i] = arguments[_i];
        }
        return new (RouteLoader.bind.apply(RouteLoader, __spreadArray([void 0], builders, false)))();
    };
    RouteLoader.PreloadBuilder = PreloadBuilder;
    RouteLoader.Preloaded = Preloaded;
    return RouteLoader;
}());
exports.RouteLoader = RouteLoader;
