'use client';

import Dexie, { type Table } from 'dexie';

export interface LocalHolding {
  id: string;
  serverId?: string;
  name: string;
  market: 'TH' | 'AE' | 'IN' | 'US';
  purity: number;
  grams: number;
  costMinor: number;
  currency: string;
  assetType: 'bar' | 'jewelry';
  createdAt: string;
}

export interface LocalAlert {
  id: string;
  serverId?: string;
  metric: string;
  comparator: 'below' | 'above';
  threshold: number;
  channel: 'web' | 'email' | 'line';
  status: 'active' | 'triggered';
  createdAt: string;
}

class GoldLensDB extends Dexie {
  holdings!: Table<LocalHolding, string>;
  alerts!: Table<LocalAlert, string>;
  outbox!: Table<{ id: string; method: string; url: string; body: string; createdAt: string; status: string }, string>;

  constructor() {
    super('goldlens');
    this.version(1).stores({
      holdings: 'id, createdAt, market',
      alerts: 'id, createdAt, status',
      outbox: 'id, createdAt, status'
    });
  }
}

export const localDb = new GoldLensDB();
