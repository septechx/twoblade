import dns from 'dns/promises';

const dnsCache = new Map();
const DNS_CACHE_TTL = 60000; // 60 seconds

function getCachedEntries(key) {
    const entry = dnsCache.get(key);
    if (entry && Date.now() - entry.timestamp < DNS_CACHE_TTL) {
        return entry.value;
    }
    dnsCache.delete(key);
    return null;
}

function setCachedEntries(key, value) {
    dnsCache.set(key, { value, timestamp: Date.now() });
}

async function fetchSrvRecords(domain) {
    const d = domain.trim().toLowerCase();
    const cacheKey = `srv:${d}`;
    const cached = getCachedEntries(cacheKey);
    if (cached) return cached;

    const srvName = `_sharp._tcp.${d}`;
    let records;

    try {
        records = await dns.resolveSrv(srvName);
    } catch (err) {
        // if no SRV, fall back to sharp.<domain> A/AAAA
        if (err.code === 'ENOTFOUND') {
            const host = `sharp.${d}`;
            const [v4, v6] = await Promise.all([
                dns.resolve4(host).catch(() => []),
                dns.resolve6(host).catch(() => [])
            ]);
            if (v4.length + v6.length === 0) throw err;
            const fb = [{ name: host, port: 5000, ips: [...v4, ...v6] }];
            setCachedEntries(cacheKey, fb);
            return fb;
        }
        throw err;
    }

    if (!records?.length) {
        throw new Error(`No SHARP SRV records found for ${domain}`);
    }

    // Sort by priority / weight
    records.sort((a, b) => a.priority - b.priority || b.weight - a.weight);

    // resolve each SRV target to A/AAAA
    const resolved = await Promise.all(records.map(async srv => {
        const [ips4, ips6] = await Promise.all([
            dns.resolve4(srv.name).catch(() => []),
            dns.resolve6(srv.name).catch(() => [])
        ]);
        return { name: srv.name, port: srv.port, ips: [...ips4, ...ips6] };
    }));

    setCachedEntries(cacheKey, resolved);
    return resolved;
} F

export async function resolveSrv(domain) {
    const records = await fetchSrvRecords(domain);

    // Find first record with valid IPs
    for (const record of records) {
        if (record.ips.length > 0) {
            return {
                srvTargetName: record.name,
                ip: record.ips[0],
                port: record.port,
                httpPort: record.port + 1
            };
        }
    }
    throw new Error(`Could not resolve any SHARP server address for ${domain}`);
}

export async function verifySharpDomain(claimedDomain, clientIP) {
    if (!clientIP) throw new Error('No client IP provided');

    // Normalize IPv4-mapped IPv6 addresses
    const normalizedIP = clientIP.startsWith('::ffff:') ?
        clientIP.substring(7) : clientIP;

    const records = await fetchSrvRecords(claimedDomain);

    // Check if client IP matches any resolved IPs
    for (const record of records) {
        const normalizedIPs = record.ips.map(ip =>
            ip.startsWith('::ffff:') ? ip.substring(7) : ip
        );
        if (normalizedIPs.includes(normalizedIP)) {
            return true;
        }
    }

    throw new Error(
        `IP ${normalizedIP} is not an authorized SHARP server for ${claimedDomain}`
    );
}
