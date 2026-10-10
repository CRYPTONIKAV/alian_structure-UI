import { NextRequest, NextResponse } from 'next/server';
import { aggregateAnalytics } from '@/lib/analytics/aggregation';
import { AnalyticsDataset, AnalyticsRange } from '@/lib/analytics/types';
import { StellarNetwork } from '@/lib/types';
import { isValidStellarAddress } from '@/lib/stellar';

const ALLOWED_RANGES: AnalyticsRange[] = ['7d', '30d', '90d', '1y'];
const ALLOWED_NETWORKS: StellarNetwork[] = ['mainnet', 'testnet', 'futurenet'];
const MAX_OWNED_AGENTS = 50;
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
  expiresAt: number;
  data: AnalyticsDataset;
}

const analyticsCache = new Map<string, CacheEntry>();

export function clearAnalyticsCache(): void {
  analyticsCache.clear();
}

function parseOwnedAgents(raw: string | null): {
  agents?: Array<{ agentId: string; agentName: string }>;
  error?: string;
} {
  if (!raw) {
    return { agents: [] };
  }

  const rawIds = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (rawIds.length > MAX_OWNED_AGENTS) {
    return {
      error: `Too many ownedAgentIds provided (maximum ${MAX_OWNED_AGENTS}, received ${rawIds.length})`,
    };
  }

  for (const agentId of rawIds) {
    if (!isValidStellarAddress(agentId)) {
      return {
        error: `Invalid Stellar address in ownedAgentIds: "${agentId}"`,
      };
    }
  }

  const agents = rawIds.map((agentId, index) => ({
    agentId,
    agentName: `Owned Agent ${index + 1}`,
  }));

  return { agents };
}

function parseMarketplaceAgents(raw: string | null) {
  if (!raw) {
    return [] as Array<{ agentId: string; agentName: string }>;
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((agentId, index) => ({
      agentId,
      agentName: `Marketplace Agent ${index + 1}`,
    }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') as AnalyticsRange | null;
    const networkParam = searchParams.get('network') as StellarNetwork | null;
    const ownedAgentsParam = searchParams.get('ownedAgentIds');
    const marketplaceAgentsParam = searchParams.get('marketplaceAgentIds');

    const range = ALLOWED_RANGES.includes(rangeParam || '7d') ? (rangeParam as AnalyticsRange) : '7d';
    const network = ALLOWED_NETWORKS.includes(networkParam || 'mainnet')
      ? (networkParam as StellarNetwork)
      : 'mainnet';

    const parsedOwned = parseOwnedAgents(ownedAgentsParam);
    if (parsedOwned.error) {
      return NextResponse.json(
        {
          message: 'Invalid ownedAgentIds parameter',
          error: parsedOwned.error,
        },
        { status: 400 }
      );
    }

    const ownedAgents = parsedOwned.agents || [];
    const marketplaceAgents = parseMarketplaceAgents(marketplaceAgentsParam);

    const cacheKey = `${network}:${range}:${ownedAgents.map((a) => a.agentId).sort().join(',')}:${marketplaceAgents.map((a) => a.agentId).sort().join(',')}`;
    const now = Date.now();
    const cached = analyticsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data);
    }

    const dataset = await aggregateAnalytics({
      network,
      range,
      ownedAgents,
      marketplaceAgents: marketplaceAgents.length > 0 ? marketplaceAgents : ownedAgents,
    });

    analyticsCache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      data: dataset,
    });

    return NextResponse.json(dataset);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Failed to aggregate analytics',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

