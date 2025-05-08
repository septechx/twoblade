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
    const cacheKey = `srv:${domain}`;
    const cached = getCachedEntries(cacheKey);
    if (cached) return cached;

    const records = await dns.resolveSrv(`_sharp._tcp.${domain}`);
    if (!records?.length) {
        throw new Error(`No SHARP SRV records found for ${domain}`);
    }

    // Sort by priority then weight
    records.sort((a, b) => a.priority - b.priority || b.weight - a.weight);

    // Resolve IPs for each SRV record
    const resolvedRecords = await Promise.all(records.map(async (srv) => {
        const [ips4, ips6] = await Promise.all([
            dns.resolve4(srv.name).catch(() => []),
            dns.resolve6(srv.name).catch(() => [])
        ]);
        return {
            name: srv.name,
            port: srv.port,
            ips: [...ips4, ...ips6]
        };
    }));

    setCachedEntries(cacheKey, resolvedRecords);
    return resolvedRecords;
}

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
