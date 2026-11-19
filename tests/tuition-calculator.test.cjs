const {test} = require('node:test');
const assert = require('node:assert/strict');
const {calculate, csv} = require('../tools/microschool-tuition-calculator/model.js');
const base = () => ({programs: [{enrollment: 20, tuition: 6000, deposit: 500, payments: 10, discount: 0}], staffing: 72000, space: 1500, other: 10000, collectionRate: 100, processingRate: 0});
test('deposits count toward annual tuition; ten payments do not erase the last two operating months', () => {
  const r = calculate(base());
  assert.equal(r.billed, 12000000);
  assert.equal(r.annualCosts, 10000000);
  assert.equal(r.net, 2000000);
  assert.equal(r.upfront, 1000000);
  assert.equal(r.reserve, 0);
  assert.equal(r.schedule[1].billed, 1100000);
  assert.equal(r.schedule[11].billed, 0);
  assert.ok(r.schedule[11].operatingCosts > 0);
  assert.equal(r.schedule.reduce((s, m) => s + m.billed, 0), r.billed);
  assert.equal(r.schedule.reduce((s, m) => s + m.operatingCosts, 0), r.annualCosts);
  assert.equal(r.schedule[12].cumulative, r.net);
});
test('multiple programs can share students and have different discounts, deposits, and payment counts', () => {
  const input = base();
  input.programs = [{enrollment: 20, tuition: 6000, deposit: 500, payments: 10, discount: 10}, {enrollment: 10, tuition: 2000, deposit: 100, payments: 5, discount: 5}];
  const r = calculate(input);
  assert.equal(r.gross, 14000000);
  assert.equal(r.discounts, 1300000);
  assert.equal(r.billed, 12700000);
  assert.equal(r.upfront, 1100000);
  assert.equal(r.schedule[1].billed, 1340000);
  assert.equal(r.schedule[6].billed, 980000);
  assert.equal(r.net, 2700000);
  assert.equal(r.schedule.reduce((s, m) => s + m.billed, 0), r.billed);
});
test('collection assumptions and payment costs reduce receipts without creating extra revenue', () => {
  const input = base(); input.collectionRate = 95; input.processingRate = 3;
  const r = calculate(input);
  assert.equal(r.receipts, 11400000);
  assert.equal(r.paymentCosts, 342000);
  assert.equal(r.net, 1058000);
  assert.equal(r.target, Math.ceil(10000000 / (0.95 * 0.97)));
});
test('final installment conserves cents across multiple enrollments', () => {
  const input = base(); input.programs = [{enrollment: 7, tuition: 601, deposit: 500, payments: 3, discount: 0}];
  const r = calculate(input), p = r.programs[0];
  assert.equal(p.installment, 3366); assert.equal(p.finalInstallment, 3368);
  assert.equal(p.deposit + p.installment * 2 + p.finalInstallment, p.netTuition);
  assert.equal(r.schedule.reduce((s, m) => s + m.billed, 0), r.billed);
});
test('no enrollment and zero collection produce useful shortfalls without infinity or NaN', () => {
  const input = base(); input.programs[0].enrollment = 0;
  let r = calculate(input); assert.equal(r.net, -10000000); assert.equal(r.reserve, 10000000);
  input.collectionRate = 0; r = calculate(input); assert.equal(r.target, null); assert.equal(r.receipts, 0);
  assert.ok(!JSON.stringify(r).includes('NaN'));
});
test('100 percent discounts work with zero deposit, while impossible deposits fail clearly', () => {
  const input = base(); input.programs[0].discount = 100; input.programs[0].deposit = 0;
  assert.equal(calculate(input).billed, 0);
  input.programs[0].deposit = 1;
  assert.throws(() => calculate(input), /deposit must not exceed tuition/);
});
test('invalid and missing values are rejected instead of silently replaced with zero', () => {
  for (const [key, value] of [['enrollment', 1.5], ['enrollment', -1], ['tuition', ''], ['deposit', Infinity], ['discount', 101], ['payments', 0], ['payments', 13]]) {
    const input = base(); input.programs[0][key] = value; assert.throws(() => calculate(input));
  }
  for (const [key, value] of [['staffing', -1], ['collectionRate', 101], ['processingRate', 21]]) {
    const input = base(); input[key] = value; assert.throws(() => calculate(input));
  }
});
test('download includes assumptions, program detail, cents, annual and monthly results', () => {
  const input = base(), r = calculate(input), text = csv(input, r);
  assert.ok(text.startsWith('\uFEFF'));
  assert.ok(text.includes('"Program 1","20","6000.00","0","6000.00","500.00","10","550.00","550.00","120000.00"'));
  assert.ok(text.includes('"Projected surplus or shortfall","20000.00"'));
  assert.ok(text.includes('"Month 12"'));
  assert.ok(text.includes('deposits are part of tuition'));
  assert.ok(text.includes('https://www.microschoolledger.com/#contact'));
});
