"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerController = void 0;
const common_1 = require("@nestjs/common");
const node_net_1 = require("node:net");
const server_settings_service_1 = require("./server-settings.service");
const dns_service_1 = require("../dns/dns.service");
const dns_server_service_1 = require("../dns-server/dns-server.service");
let ServerController = class ServerController {
    constructor(serverSettingsService, dnsService, dnsServerService) {
        this.serverSettingsService = serverSettingsService;
        this.dnsService = dnsService;
        this.dnsServerService = dnsServerService;
    }
    async getNameservers() {
        const settings = await this.serverSettingsService.getSettings();
        const info = settings.primaryDomain
            ? await this.dnsServerService.getNameserverInstructions(settings.primaryDomain, settings.nameservers)
            : null;
        const zone = settings.primaryDomain ? await this.dnsService.getZone(settings.primaryDomain) : null;
        return { settings, nameserverInfo: info, zone };
    }
    async configureNameservers(body) {
        const logs = [];
        const domain = this.normalizeDomain(body.primaryDomain);
        if (!domain) {
            throw new common_1.BadRequestException('primaryDomain is required');
        }
        if (!this.isValidDomain(domain)) {
            throw new common_1.BadRequestException('primaryDomain is not a valid domain');
        }
        const providedIp = this.normalizeIp(body.serverIp);
        if (body.serverIp && !providedIp) {
            throw new common_1.BadRequestException('serverIp is not a valid IPv4 or IPv6 address');
        }
        const serverIp = providedIp || (await this.serverSettingsService.getServerIp());
        if (!serverIp || serverIp === '0.0.0.0') {
            throw new common_1.BadRequestException('Unable to determine server IP. Provide a valid serverIp value.');
        }
        const nameservers = this.normalizeNameservers(body.nameservers && body.nameservers.length > 0
            ? body.nameservers
            : [
                `ns1.${domain}`,
                `ns2.${domain}`,
            ]);
        if (nameservers.length === 0) {
            throw new common_1.BadRequestException('At least one nameserver is required');
        }
        if (nameservers.some((ns) => !ns.includes('.'))) {
            throw new common_1.BadRequestException('Nameserver hostnames must be fully qualified');
        }
        const updatedSettings = await this.serverSettingsService.updateSettings({
            primaryDomain: domain,
            serverIp,
            nameservers,
        });
        logs.push({ task: 'Persist server settings', success: true, message: 'Server settings updated' });
        try {
            const zone = await this.dnsService.ensureDefaultZone(domain, {
                nameservers,
                serverIp,
            });
            logs.push({ task: 'Ensure dns.json zone', success: true, message: `Zone contains ${zone.records.length} record(s)` });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logs.push({
                task: 'Ensure dns.json zone',
                success: false,
                message: 'Failed to persist dns.json zone',
                detail: message,
            });
        }
        try {
            const result = await this.dnsServerService.createZone(domain, serverIp, nameservers);
            logs.push({ task: 'Create BIND9 zone', success: result.success, message: result.message });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logs.push({
                task: 'Create BIND9 zone',
                success: false,
                message: 'Failed to update BIND9 zone',
                detail: message,
            });
        }
        const nameserverInfo = await this.dnsServerService.getNameserverInstructions(domain, nameservers);
        const zone = await this.dnsService.getZone(domain);
        return {
            success: true,
            settings: updatedSettings,
            nameserverInfo,
            zone,
            automationLogs: logs,
        };
    }
    normalizeDomain(domain) {
        if (!domain)
            return undefined;
        return domain.trim().toLowerCase().replace(/\.$/, '');
    }
    normalizeIp(ip) {
        if (!ip)
            return undefined;
        const trimmed = ip.trim();
        if (!trimmed)
            return undefined;
        return (0, node_net_1.isIP)(trimmed) ? trimmed : undefined;
    }
    normalizeNameservers(values) {
        return Array.from(new Set(values
            .map((ns) => ns.trim().toLowerCase())
            .filter((ns) => ns.length > 0)
            .map((ns) => (ns.endsWith('.') ? ns.slice(0, -1) : ns))));
    }
    isValidDomain(value) {
        const domainRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)(?:\.[a-z0-9-]{1,63})+$/;
        return domainRegex.test(value);
    }
};
exports.ServerController = ServerController;
__decorate([
    (0, common_1.Get)('nameservers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerController.prototype, "getNameservers", null);
__decorate([
    (0, common_1.Post)('nameservers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServerController.prototype, "configureNameservers", null);
exports.ServerController = ServerController = __decorate([
    (0, common_1.Controller)('server'),
    __metadata("design:paramtypes", [server_settings_service_1.ServerSettingsService,
        dns_service_1.DnsService,
        dns_server_service_1.DnsServerService])
], ServerController);
//# sourceMappingURL=server.controller.js.map