"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var ServerSettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSettingsService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
let ServerSettingsService = ServerSettingsService_1 = class ServerSettingsService {
    constructor() {
        this.logger = new common_1.Logger(ServerSettingsService_1.name);
        this.settingsPath = path.join(process.cwd(), 'server-settings.json');
        this.cache = null;
    }
    async onModuleInit() {
        try {
            const settings = await this.readSettings();
            if (settings.serverIp) {
                process.env.SERVER_IP = settings.serverIp;
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Unable to initialize server settings: ${message}`);
        }
    }
    async getSettings() {
        const settings = await this.readSettings();
        return this.clone(settings);
    }
    async updateSettings(update) {
        const current = await this.readSettings();
        const nameservers = update.nameservers
            ? this.normalizeNameservers(update.nameservers)
            : current.nameservers;
        const next = {
            primaryDomain: update.primaryDomain ?? current.primaryDomain,
            serverIp: this.resolveServerIp(update.serverIp ?? current.serverIp),
            nameservers,
            updatedAt: new Date().toISOString(),
        };
        await this.writeSettings(next);
        return this.clone(next);
    }
    async getServerIp() {
        const settings = await this.readSettings();
        const ip = this.resolveServerIp(settings.serverIp);
        if (ip) {
            return ip;
        }
        return '0.0.0.0';
    }
    async readSettings() {
        if (this.cache) {
            return this.cache;
        }
        try {
            const data = await fs.readFile(this.settingsPath, 'utf-8');
            const parsed = JSON.parse(data);
            const normalized = {
                primaryDomain: parsed.primaryDomain?.toLowerCase(),
                serverIp: this.resolveServerIp(parsed.serverIp),
                nameservers: this.normalizeNameservers(parsed.nameservers ?? []),
                updatedAt: parsed.updatedAt,
            };
            this.cache = normalized;
            return normalized;
        }
        catch (error) {
            const defaultSettings = {
                primaryDomain: undefined,
                serverIp: this.resolveServerIp(undefined),
                nameservers: [],
                updatedAt: new Date().toISOString(),
            };
            await this.writeSettings(defaultSettings);
            return defaultSettings;
        }
    }
    async writeSettings(settings) {
        const payload = JSON.stringify(settings, null, 2);
        await fs.writeFile(this.settingsPath, payload, 'utf-8');
        this.cache = this.clone(settings);
        if (settings.serverIp) {
            process.env.SERVER_IP = settings.serverIp;
        }
    }
    resolveServerIp(explicit) {
        const trimmed = explicit?.trim();
        if (trimmed) {
            return trimmed;
        }
        if (process.env.SERVER_IP && process.env.SERVER_IP.trim().length > 0) {
            return process.env.SERVER_IP.trim();
        }
        return this.detectPrimaryInterface();
    }
    detectPrimaryInterface() {
        const interfaces = os.networkInterfaces();
        for (const value of Object.values(interfaces)) {
            if (!value)
                continue;
            for (const details of value) {
                if (details.family === 'IPv4' && !details.internal && details.address) {
                    return details.address;
                }
            }
        }
        return undefined;
    }
    normalizeNameservers(values) {
        const normalized = values
            .map((ns) => ns.trim().toLowerCase())
            .filter((ns) => ns.length > 0)
            .map((ns) => (ns.endsWith('.') ? ns.slice(0, -1) : ns));
        return Array.from(new Set(normalized));
    }
    clone(settings) {
        return {
            primaryDomain: settings.primaryDomain,
            serverIp: settings.serverIp,
            nameservers: [...settings.nameservers],
            updatedAt: settings.updatedAt,
        };
    }
};
exports.ServerSettingsService = ServerSettingsService;
exports.ServerSettingsService = ServerSettingsService = ServerSettingsService_1 = __decorate([
    (0, common_1.Injectable)()
], ServerSettingsService);
//# sourceMappingURL=server-settings.service.js.map