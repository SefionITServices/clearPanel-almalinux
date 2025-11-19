"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerModule = void 0;
const common_1 = require("@nestjs/common");
const server_settings_service_1 = require("./server-settings.service");
const server_controller_1 = require("./server.controller");
const dns_module_1 = require("../dns/dns.module");
const dns_server_module_1 = require("../dns-server/dns-server.module");
let ServerModule = class ServerModule {
};
exports.ServerModule = ServerModule;
exports.ServerModule = ServerModule = __decorate([
    (0, common_1.Module)({
        imports: [dns_module_1.DnsModule, dns_server_module_1.DnsServerModule],
        providers: [server_settings_service_1.ServerSettingsService],
        controllers: [server_controller_1.ServerController],
        exports: [server_settings_service_1.ServerSettingsService],
    })
], ServerModule);
//# sourceMappingURL=server.module.js.map