const { Request, Response, Headers } = require('undici');
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

const { NextRequest } = require('next/server');
const { GET, clearAnalyticsCache } = require('@/app/api/analytics/route');
const aggregationModule = require('@/lib/analytics/aggregation');

jest.mock('@/lib/analytics/aggregation', () => ({
  aggregateAnalytics: jest.fn(),
}));

describe('GET /api/analytics Route Validation & Caching', () => {
  const validAddress1 = 'GAC67RRFZ7BL3K5OYUP4NO2YJEH7H4NMRMQ42V7IYCQD3PF4UOXQDMLT';
  const validAddress2 = 'GBLOKHDYLUKOWNBWKWL6MOX5IQJW7CJ5HXM3XFYSXWB6ZX5RMNSYEYNB';

  beforeEach(() => {
    jest.clearAllMocks();
    clearAnalyticsCache();
    aggregationModule.aggregateAnalytics.mockResolvedValue({
      totalTransactions: 10,
      totalOperations: 25,
      successfulTransactions: 10,
      failedTransactions: 0,
      totalFeesXlm: '0.001',
      dailyActivity: [],
      topAgentsByVolume: [],
      errorRate: 0,
      avgLatencyMs: 120,
    });
  });

  it('accepts valid Stellar addresses and aggregates analytics', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/analytics?ownedAgentIds=${validAddress1},${validAddress2}&network=testnet&range=30d`
    );

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalTransactions).toBe(10);
    expect(aggregationModule.aggregateAnalytics).toHaveBeenCalledTimes(1);
    expect(aggregationModule.aggregateAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        network: 'testnet',
        range: '30d',
        ownedAgents: [
          { agentId: validAddress1, agentName: 'Owned Agent 1' },
          { agentId: validAddress2, agentName: 'Owned Agent 2' },
        ],
      })
    );
  });

  it('rejects invalid Stellar address with 400', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/analytics?ownedAgentIds=invalidAddress123`
    );

    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Invalid ownedAgentIds parameter');
    expect(body.error).toContain('Invalid Stellar address');
    expect(aggregationModule.aggregateAnalytics).not.toHaveBeenCalled();
  });

  it('rejects path-traversal / URL-injection shaped id with 400', async () => {
    const maliciousId = `../../../accounts/${validAddress1}/transactions?x=`;
    const req = new NextRequest(
      `http://localhost:3000/api/analytics?ownedAgentIds=${encodeURIComponent(maliciousId)}`
    );

    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Invalid ownedAgentIds parameter');
    expect(body.error).toContain('Invalid Stellar address');
    expect(aggregationModule.aggregateAnalytics).not.toHaveBeenCalled();
  });

  it('rejects when ownedAgentIds exceeds the cap of 50 with 400', async () => {
    // Generate 51 valid Stellar addresses
    const manyAddresses = Array(51).fill(validAddress1).join(',');
    const req = new NextRequest(
      `http://localhost:3000/api/analytics?ownedAgentIds=${manyAddresses}`
    );

    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Invalid ownedAgentIds parameter');
    expect(body.error).toContain('Too many ownedAgentIds provided (maximum 50, received 51)');
    expect(aggregationModule.aggregateAnalytics).not.toHaveBeenCalled();
  });

  it('serves repeat requests within TTL from cache without re-fetching', async () => {
    const req1 = new NextRequest(
      `http://localhost:3000/api/analytics?ownedAgentIds=${validAddress1}&range=7d`
    );
    const res1 = await GET(req1);
    expect(res1.status).toBe(200);
    expect(aggregationModule.aggregateAnalytics).toHaveBeenCalledTimes(1);

    // Identical second request
    const req2 = new NextRequest(
      `http://localhost:3000/api/analytics?ownedAgentIds=${validAddress1}&range=7d`
    );
    const res2 = await GET(req2);
    expect(res2.status).toBe(200);
    // Should NOT call aggregateAnalytics again
    expect(aggregationModule.aggregateAnalytics).toHaveBeenCalledTimes(1);
  });
});
