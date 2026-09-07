import { randomUUID } from 'node:crypto';
import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { requireAdmin } from '../../lib/requireAdmin.js';
import { registerAdminBillingRoutes } from './billing.js';

const ADMIN_KEY = 'test-admin-key-billing';
const ACCOUNT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const CHARGE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const CHARGE_ID_2 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

/**
 * In-memory Supabase stand-in for billing route tests.
 * Supports the chainable from()/insert()/update()/eq()/is()/select()/single()/maybeSingle()
 * calls used by `billing.js`. Does not talk to a network or production database.
 */
function createIsolatedSupabase({ seed = {}, fail = {} } = {}) {
  const tables = {};
  for (const [name, rows] of Object.entries(seed)) {
    tables[name] = rows.map((row) => ({ ...row }));
  }

  const remainingFails = { ...fail };

  function takeFail(table, action) {
    const key = `${table}.${action}`;
    const err = remainingFails[key];
    if (!err) return null;
    delete remainingFails[key];
    return typeof err === 'string' ? { message: err } : err;
  }

  function matches(row, filters) {
    return filters.every(([op, col, val]) => {
      if (op === 'eq') return row[col] === val;
      if (op === 'is') return row[col] === val;
      return true;
    });
  }

  function execute(state, mode) {
    return Promise.resolve().then(() => {
      if (!tables[state.table]) tables[state.table] = [];
      const failErr = takeFail(state.table, state.action);
      if (failErr) {
        return { data: null, error: failErr };
      }

      if (state.action === 'insert') {
        const row = { id: state.payload.id || randomUUID(), ...state.payload };
        tables[state.table].push(row);
        if (mode === 'many') return { data: [row], error: null };
        return { data: row, error: null };
      }

      if (state.action === 'update') {
        const rows = tables[state.table].filter((row) => matches(row, state.filters));
        for (const row of rows) Object.assign(row, state.payload);
        if (mode === 'single') {
          return rows[0]
            ? { data: rows[0], error: null }
            : { data: null, error: { message: 'not found' } };
        }
        if (mode === 'maybeSingle') return { data: rows[0] ?? null, error: null };
        return { data: rows, error: null };
      }

      const rows = tables[state.table].filter((row) => matches(row, state.filters));
      if (mode === 'maybeSingle') return { data: rows[0] ?? null, error: null };
      if (mode === 'single') {
        return rows[0]
          ? { data: rows[0], error: null }
          : { data: null, error: { message: 'not found' } };
      }
      return { data: rows, error: null };
    });
  }

  const supabase = {
    from(table) {
      const state = { table, action: 'select', payload: null, filters: [] };
      const builder = {
        select() {
          return builder;
        },
        insert(row) {
          state.action = 'insert';
          state.payload = row;
          return builder;
        },
        update(row) {
          state.action = 'update';
          state.payload = row;
          return builder;
        },
        eq(col, val) {
          state.filters.push(['eq', col, val]);
          return builder;
        },
        is(col, val) {
          state.filters.push(['is', col, val]);
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        maybeSingle() {
          return execute(state, 'maybeSingle');
        },
        single() {
          return execute(state, 'single');
        },
        then(onFulfilled, onRejected) {
          return execute(state, 'many').then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
    rpc() {
      return Promise.resolve({ data: null, error: { message: 'rpc_not_stubbed' } });
    },
  };

  return { supabase, tables };
}

function seedOpenCharge({
  amountCents = 15000,
  status = 'open',
  accountId = ACCOUNT_ID,
  chargeId = CHARGE_ID,
} = {}) {
  return {
    charges: [{ id: chargeId, account_id: accountId, status, amount_cents: amountCents }],
    view_charge_net: [{ charge_id: chargeId, net_due_cents: amountCents }],
    payment_allocations: [],
    payments: [],
    receipts: [],
  };
}

function validPaymentBody(overrides = {}) {
  return {
    account_id: ACCOUNT_ID,
    amount_cents: 15000,
    method: 'card',
    issued_by: 'front_desk',
    allocations: [{ charge_id: CHARGE_ID, amount_cents: 15000 }],
    issue_receipt: true,
    ...overrides,
  };
}

function createBillingApp(supabase) {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  router.use(requireAdmin);
  registerAdminBillingRoutes(router, { supabase });
  app.use('/api/admin', router);
  return app;
}

function authed(req) {
  return req.set('x-admin-key', ADMIN_KEY);
}

describe('admin billing/receipt routes', () => {
  const originalAdminKey = process.env.ADMIN_API_KEY;

  beforeEach(() => {
    process.env.ADMIN_API_KEY = ADMIN_KEY;
  });

  afterEach(() => {
    if (originalAdminKey === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = originalAdminKey;
  });

  describe('x-admin-key', () => {
    it('rejects record-payment without an admin key', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await request(app).post('/api/admin/billing/record-payment').send(validPaymentBody());
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ ok: false, error: 'unauthorized' });
    });

    it('rejects record-payment with a wrong admin key', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await request(app)
        .post('/api/admin/billing/record-payment')
        .set('x-admin-key', 'not-the-key')
        .send(validPaymentBody());
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ ok: false, error: 'unauthorized' });
    });

    it('rejects receipt void without an admin key', async () => {
      const { supabase } = createIsolatedSupabase({
        seed: {
          receipts: [{ id: 'receipt-1', voided_at: null }],
        },
      });
      const app = createBillingApp(supabase);
      const res = await request(app)
        .post('/api/admin/billing/receipts/receipt-1/void')
        .send({ void_reason: 'duplicate' });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ ok: false, error: 'unauthorized' });
    });
  });

  describe('validation', () => {
    it('rejects record-payment with a missing account or non-positive amount', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({ account_id: '', amount_cents: 0 }),
      );
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'account_and_positive_amount_required' });
    });

    it('rejects record-payment with an invalid payment method', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({ method: 'bitcoin' }),
      );
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'invalid_payment_method' });
    });

    it('rejects record-payment without issued_by', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({ issued_by: '  ' }),
      );
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'issued_by_required' });
    });

    it('rejects record-payment without allocations', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({ allocations: [] }),
      );
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'allocations_required' });
    });

    it('rejects record-payment when allocation sum does not match payment amount', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({
          amount_cents: 15000,
          allocations: [{ charge_id: CHARGE_ID, amount_cents: 5000 }],
        }),
      );
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'allocation_sum_must_equal_payment_amount' });
    });

    it('rejects record-payment when a charge is missing', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({
          allocations: [{ charge_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', amount_cents: 15000 }],
        }),
      );
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        ok: false,
        error: 'charge_not_found',
        charge_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      });
    });

    it('rejects record-payment when a charge belongs to another account', async () => {
      const { supabase } = createIsolatedSupabase({
        seed: seedOpenCharge({ accountId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' }),
      });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(validPaymentBody());
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'charge_account_mismatch', charge_id: CHARGE_ID });
    });

    it('rejects record-payment when allocation exceeds net due', async () => {
      const { supabase } = createIsolatedSupabase({ seed: seedOpenCharge({ amountCents: 5000 }) });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(validPaymentBody());
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        ok: false,
        error: 'allocation_exceeds_net_due',
        charge_id: CHARGE_ID,
        allocatable_cents: 5000,
      });
    });

    it('rejects receipt void without a void reason', async () => {
      const { supabase } = createIsolatedSupabase({
        seed: { receipts: [{ id: 'receipt-1', voided_at: null }] },
      });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/receipts/receipt-1/void')).send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'receipt_id_and_void_reason_required' });
    });

    it('rejects issue-for-refund without issued_by', async () => {
      const { supabase } = createIsolatedSupabase();
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/receipts/issue-for-refund')).send({
        payment_refund_id: 'refund-1',
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'payment_refund_id_and_issued_by_required' });
    });
  });

  describe('success', () => {
    it('records a payment, allocates it, marks the charge paid, and issues a receipt', async () => {
      const { supabase, tables } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(validPaymentBody());

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.payment_id).toEqual(expect.any(String));
      expect(res.body.receipt_id).toEqual(expect.any(String));

      expect(tables.payments).toHaveLength(1);
      expect(tables.payments[0]).toMatchObject({
        id: res.body.payment_id,
        account_id: ACCOUNT_ID,
        amount_cents: 15000,
        method: 'card',
        source: 'manual',
        status: 'succeeded',
        currency: 'USD',
      });
      expect(tables.payment_allocations).toEqual([
        expect.objectContaining({
          payment_id: res.body.payment_id,
          charge_id: CHARGE_ID,
          amount_cents: 15000,
        }),
      ]);
      expect(tables.charges[0].status).toBe('paid');
      expect(tables.receipts).toEqual([
        expect.objectContaining({
          id: res.body.receipt_id,
          receipt_kind: 'money_in',
          payment_id: res.body.payment_id,
          account_id: ACCOUNT_ID,
          amount_cents: 15000,
          issued_by: 'front_desk',
          source: 'staff_triggered',
        }),
      ]);
    });

    it('omits a receipt when issue_receipt is false', async () => {
      const { supabase, tables } = createIsolatedSupabase({ seed: seedOpenCharge() });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({ issue_receipt: false }),
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        payment_id: expect.any(String),
        receipt_id: null,
      });
      expect(tables.receipts).toHaveLength(0);
      expect(tables.payments).toHaveLength(1);
    });

    it('voids an active receipt', async () => {
      const receiptId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      const { supabase, tables } = createIsolatedSupabase({
        seed: { receipts: [{ id: receiptId, voided_at: null, void_reason: null }] },
      });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post(`/api/admin/billing/receipts/${receiptId}/void`)).send({
        void_reason: 'Issued in error',
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, receipt_id: receiptId });
      expect(tables.receipts[0].void_reason).toBe('Issued in error');
      expect(tables.receipts[0].voided_at).toEqual(expect.any(String));
    });
  });

  describe('non-transactional record-payment failure (current behavior)', () => {
    /**
     * record-payment writes payment → allocations → receipt as sequential inserts
     * with no wrapping transaction. API-HARD-001 is the follow-up to make this atomic.
     * These tests lock the current partial-failure behavior so a later RPC change is
     * forced to update this suite.
     */
    it('leaves a payment with no allocations when the first allocation insert fails', async () => {
      const { supabase, tables } = createIsolatedSupabase({
        seed: seedOpenCharge(),
        fail: { 'payment_allocations.insert': { message: 'simulated_allocation_failure' } },
      });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(validPaymentBody());

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'simulated_allocation_failure' });
      expect(res.body.payment_id).toBeUndefined();
      expect(tables.payments).toHaveLength(1);
      expect(tables.payment_allocations).toHaveLength(0);
      expect(tables.receipts).toHaveLength(0);
      expect(tables.charges[0].status).toBe('open');
    });

    it('leaves a payment plus one allocation when a later allocation insert fails', async () => {
      const seed = seedOpenCharge();
      seed.charges.push({
        id: CHARGE_ID_2,
        account_id: ACCOUNT_ID,
        status: 'open',
        amount_cents: 5000,
      });
      seed.view_charge_net.push({ charge_id: CHARGE_ID_2, net_due_cents: 5000 });

      let allocationInserts = 0;
      const { supabase, tables } = createIsolatedSupabase({ seed });
      const originalFrom = supabase.from.bind(supabase);
      supabase.from = (table) => {
        const builder = originalFrom(table);
        if (table !== 'payment_allocations') return builder;
        const originalInsert = builder.insert.bind(builder);
        builder.insert = (row) => {
          allocationInserts += 1;
          if (allocationInserts === 2) {
            return {
              then(onFulfilled, onRejected) {
                return Promise.resolve({
                  data: null,
                  error: { message: 'simulated_second_allocation_failure' },
                }).then(onFulfilled, onRejected);
              },
            };
          }
          return originalInsert(row);
        };
        return builder;
      };

      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(
        validPaymentBody({
          amount_cents: 20000,
          allocations: [
            { charge_id: CHARGE_ID, amount_cents: 15000 },
            { charge_id: CHARGE_ID_2, amount_cents: 5000 },
          ],
        }),
      );

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ ok: false, error: 'simulated_second_allocation_failure' });
      expect(tables.payments).toHaveLength(1);
      expect(tables.payment_allocations).toHaveLength(1);
      expect(tables.payment_allocations[0].charge_id).toBe(CHARGE_ID);
      expect(tables.receipts).toHaveLength(0);
    });

    it('returns payment_id and keeps payment + allocations when receipt insert fails', async () => {
      const { supabase, tables } = createIsolatedSupabase({
        seed: seedOpenCharge(),
        fail: { 'receipts.insert': { message: 'simulated_receipt_failure' } },
      });
      const app = createBillingApp(supabase);
      const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(validPaymentBody());

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe('simulated_receipt_failure');
      expect(res.body.payment_id).toEqual(expect.any(String));
      expect(tables.payments).toHaveLength(1);
      expect(tables.payments[0].id).toBe(res.body.payment_id);
      expect(tables.payment_allocations).toHaveLength(1);
      expect(tables.receipts).toHaveLength(0);
      expect(tables.charges[0].status).toBe('paid');
    });
  });

  it('returns supabase_not_configured when the client is missing', async () => {
    const app = createBillingApp(null);
    const res = await authed(request(app).post('/api/admin/billing/record-payment')).send(validPaymentBody());
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ ok: false, error: 'supabase_not_configured' });
  });
});
