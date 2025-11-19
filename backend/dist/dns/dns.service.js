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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const DNS_FILE = path.join(process.cwd(), 'dns.json');
let DnsService = class DnsService {
    async readZones() {
        try {
            const data = await fs.readFile(DNS_FILE, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return [];
        }
    }
    async writeZones(zones) {
        await fs.writeFile(DNS_FILE, JSON.stringify(zones, null, 2));
    }
    async ensureDefaultZone(domain, options) {
        const zones = await this.readZones();
        let zone = zones.find(z => z.domain === domain);
        const serverIp = options?.serverIp || process.env.SERVER_IP || '127.0.0.1';
        const nameservers = (options?.nameservers?.length ? options.nameservers : [`ns1.${domain}`, `ns2.${domain}`])
            .map(ns => (ns.endsWith('.') ? ns.slice(0, -1) : ns));
        const nameserverFqdns = nameservers.map(ns => (ns.endsWith('.') ? ns : `${ns}.`));
        if (!zone) {
            const records = [
                { id: (0, crypto_1.randomUUID)(), type: 'A', name: '@', value: serverIp, ttl: 3600 },
                { id: (0, crypto_1.randomUUID)(), type: 'CNAME', name: 'www', value: domain, ttl: 3600 },
            ];
            nameservers.forEach(ns => {
                const fqdn = ns.endsWith('.') ? ns : `${ns}.`;
                records.push({
                    id: (0, crypto_1.randomUUID)(),
                    type: 'NS',
                    name: '@',
                    value: fqdn,
                    ttl: 3600,
                });
                const suffix = `.${domain}`;
                const plain = ns.endsWith('.') ? ns.slice(0, -1) : ns;
                if (plain.toLowerCase().endsWith(suffix.toLowerCase())) {
                    const label = plain.slice(0, -suffix.length) || '@';
                    if (label !== '@') {
                        records.push({
                            id: (0, crypto_1.randomUUID)(),
                            type: 'A',
                            name: label,
                            value: serverIp,
                            ttl: 3600,
                        });
                    }
                }
            });
            const newZone = {
                domain,
                records,
            };
            zones.push(newZone);
            await this.writeZones(zones);
            zone = newZone;
        }
        else {
            let mutated = false;
            const ensureARecord = (label, value) => {
                const record = zone.records.find(r => r.type === 'A' && r.name === label);
                if (!record) {
                    zone.records.push({ id: (0, crypto_1.randomUUID)(), type: 'A', name: label, value, ttl: 3600 });
                    mutated = true;
                    return;
                }
                if (record.value !== value) {
                    record.value = value;
                    mutated = true;
                }
            };
            if (serverIp) {
                ensureARecord('@', serverIp);
            }
            const wwwRecord = zone.records.find(r => r.name === 'www');
            if (!wwwRecord) {
                zone.records.push({ id: (0, crypto_1.randomUUID)(), type: 'CNAME', name: 'www', value: domain, ttl: 3600 });
                mutated = true;
            }
            const suffix = `.${domain}`;
            nameservers.forEach(ns => {
                const plain = ns.endsWith('.') ? ns.slice(0, -1) : ns;
                const fqdn = plain.endsWith('.') ? plain : `${plain}.`;
                const nsRecordExists = zone.records.some(r => r.type === 'NS' && r.name === '@' && r.value.toLowerCase() === fqdn.toLowerCase());
                if (!nsRecordExists) {
                    zone.records.push({ id: (0, crypto_1.randomUUID)(), type: 'NS', name: '@', value: fqdn, ttl: 3600 });
                    mutated = true;
                }
                if (plain.toLowerCase().endsWith(suffix.toLowerCase())) {
                    const label = plain.slice(0, -suffix.length) || '@';
                    if (label !== '@' && serverIp) {
                        ensureARecord(label, serverIp);
                    }
                }
            });
            // Remove stale NS records that match previous defaults (ns1/ns2 within domain) but are no longer desired.
            const desiredSet = new Set(nameserverFqdns.map(ns => (ns.endsWith('.') ? ns : `${ns}.`).toLowerCase()));
            const domainSuffixWithDot = `${domain}.`.toLowerCase();
            const nsBefore = zone.records.length;
            zone.records = zone.records.filter(record => {
                if (record.type !== 'NS' || record.name !== '@') {
                    return true;
                }
                if (desiredSet.size === 0) {
                    return true;
                }
                const valueLower = record.value.toLowerCase();
                if (desiredSet.has(valueLower)) {
                    return true;
                }
                if (valueLower.endsWith(domainSuffixWithDot)) {
                    return false;
                }
                return true;
            });
            if (zone.records.length !== nsBefore) {
                mutated = true;
            }
            if (mutated) {
                await this.writeZones(zones);
            }
        }
        return zone;
    }
    async listZones() {
        return this.readZones();
    }
    async getZone(domain) {
        const zones = await this.readZones();
        return zones.find(z => z.domain === domain) || null;
    }
    async addRecord(domain, record) {
        const zones = await this.readZones();
        const zone = zones.find(z => z.domain === domain);
        if (!zone)
            return null;
        const newRecord = { id: (0, crypto_1.randomUUID)(), ...record };
        zone.records.push(newRecord);
        await this.writeZones(zones);
        return newRecord;
    }
    async updateRecord(domain, id, patch) {
        const zones = await this.readZones();
        const zone = zones.find(z => z.domain === domain);
        if (!zone)
            return null;
        const rec = zone.records.find(r => r.id === id);
        if (!rec)
            return null;
        Object.assign(rec, patch);
        await this.writeZones(zones);
        return rec;
    }
    async deleteRecord(domain, id) {
        const zones = await this.readZones();
        const zone = zones.find(z => z.domain === domain);
        if (!zone)
            return false;
        const before = zone.records.length;
        zone.records = zone.records.filter(r => r.id !== id);
        await this.writeZones(zones);
        return zone.records.length !== before;
    }
    async deleteZone(domain) {
        const zones = await this.readZones();
        const before = zones.length;
        const filtered = zones.filter(z => z.domain !== domain);
        await this.writeZones(filtered);
        return filtered.length !== before;
    }
};
exports.DnsService = DnsService;
exports.DnsService = DnsService = __decorate([
    (0, common_1.Injectable)()
], DnsService);
//# sourceMappingURL=dns.service.js.map