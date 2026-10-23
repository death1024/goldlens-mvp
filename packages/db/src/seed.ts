import { randomUUID } from 'node:crypto';
import { dealers, dealerBranches, dealerQuotes, markets } from './schema';

const DAY = 24 * 60 * 60 * 1000;

export async function seed(db: any) {
  const existing = await db.select().from(dealers).limit(1);
  if (existing.length > 0) return;

  await db.insert(markets).values([
    { code: 'TH', name: '泰国', currency: 'THB', taxBps: 0, active: true },
    { code: 'AE', name: '阿联酋', currency: 'AED', taxBps: 500, active: true },
    { code: 'IN', name: '印度', currency: 'INR', taxBps: 300, active: true },
    { code: 'US', name: '美国', currency: 'USD', taxBps: 0, active: true }
  ]).onConflictDoNothing();

  const dealerRows = [
    { id: 'd-siam', name: 'Siam Gold House', city: 'Bangkok', country: 'TH', rating: 4.8 },
    { id: 'd-charoen', name: 'Charoen Gold', city: 'Bangkok', country: 'TH', rating: 4.6 },
    { id: 'd-chiang', name: 'Lanna Gold', city: 'Chiang Mai', country: 'TH', rating: 4.7 },
    { id: 'd-dubai', name: 'Dune Bullion', city: 'Dubai', country: 'AE', rating: 4.5 },
    { id: 'd-mumbai', name: 'Mumbai Bullion Co.', city: 'Mumbai', country: 'IN', rating: 4.4 },
    { id: 'd-ny', name: 'Hudson Gold', city: 'New York', country: 'US', rating: 4.3 }
  ];
  await db.insert(dealers).values(dealerRows.map((d) => ({
    ...d,
    status: 'verified',
    verifiedAt: new Date(),
    createdAt: new Date()
  }))).onConflictDoNothing();

  await db.insert(dealerBranches).values([
    { id: 'b-siam', dealerId: 'd-siam', address: 'Silom Road, Bangkok', lat: 13.724, lng: 100.534, hours: '10:00–19:00' },
    { id: 'b-charoen', dealerId: 'd-charoen', address: 'Yaowarat Road, Bangkok', lat: 13.74, lng: 100.51, hours: '09:30–18:30' },
    { id: 'b-chiang', dealerId: 'd-chiang', address: 'Nimman Road, Chiang Mai', lat: 18.796, lng: 98.967, hours: '10:00–19:00' },
    { id: 'b-dubai', dealerId: 'd-dubai', address: 'Deira Gold Souk, Dubai', lat: 25.269, lng: 55.297, hours: '10:00–22:00' },
    { id: 'b-mumbai', dealerId: 'd-mumbai', address: 'Zaveri Bazaar, Mumbai', lat: 19.076, lng: 72.877, hours: '10:30–19:00' },
    { id: 'b-ny', dealerId: 'd-ny', address: '47th Street, New York', lat: 40.757, lng: -73.978, hours: '10:00–18:00' }
  ]).onConflictDoNothing();

  const now = Date.now();
  const quoteRows = [
    { id: 'q-siam', dealerId: 'd-siam', branchId: 'b-siam', marketCode: 'TH', purity: 0.965, weightGrams: 15.244, sellPriceMinor: 6500000, buybackMinor: 6271692, currency: 'THB', verification: 'verified', makingChargeBps: 0, taxBps: 0 },
    { id: 'q-charoen', dealerId: 'd-charoen', branchId: 'b-charoen', marketCode: 'TH', purity: 0.965, weightGrams: 15.244, sellPriceMinor: 6480000, buybackMinor: 6250000, currency: 'THB', verification: 'verified', makingChargeBps: 0, taxBps: 0 },
    { id: 'q-chiang', dealerId: 'd-chiang', branchId: 'b-chiang', marketCode: 'TH', purity: 0.965, weightGrams: 15.244, sellPriceMinor: 6520000, buybackMinor: 6300000, currency: 'THB', verification: 'self_reported', makingChargeBps: 0, taxBps: 0 },
    { id: 'q-dubai', dealerId: 'd-dubai', branchId: 'b-dubai', marketCode: 'AE', purity: 0.9167, weightGrams: 1, sellPriceMinor: 51200, buybackMinor: 49300, currency: 'AED', verification: 'audited', makingChargeBps: 1200, taxBps: 500 },
    { id: 'q-mumbai', dealerId: 'd-mumbai', branchId: 'b-mumbai', marketCode: 'IN', purity: 0.9167, weightGrams: 10, sellPriceMinor: 12150000, buybackMinor: 11600000, currency: 'INR', verification: 'verified', makingChargeBps: 1200, taxBps: 300 },
    { id: 'q-ny', dealerId: 'd-ny', branchId: 'b-ny', marketCode: 'US', purity: 0.999, weightGrams: 31.1034768, sellPriceMinor: 408000, buybackMinor: 399000, currency: 'USD', verification: 'verified', makingChargeBps: 800, taxBps: 0 }
  ];
  await db.insert(dealerQuotes).values(quoteRows.map((q) => ({
    ...q,
    productType: 'jewelry',
    effectiveAt: new Date(now),
    expiresAt: new Date(now + 7 * DAY),
    source: 'seed',
    createdAt: new Date()
  }))).onConflictDoNothing();
}

export function newId(prefix = 'id') {
  return `${prefix}_${randomUUID()}`;
}
