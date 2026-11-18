/* Shared by the public calculator and the Node financial checks. All money is cents. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TuitionCalculator = factory();
}(typeof window === 'undefined' ? this : window, function () {
  'use strict';
  function number(value, label, max, integer) {
    if (value === '' || value === null || value === undefined || !Number.isFinite(Number(value))) throw new Error(label + ': enter a number.');
    var result = Number(value);
    if (result < 0 || result > max || (integer && !Number.isInteger(result))) throw new Error(label + ': enter ' + (integer ? 'a whole number' : 'a number') + ' from 0 to ' + max.toLocaleString('en-US') + '.');
    return result;
  }
  function money(value, label) { return Math.round(number(value, label, 10000000) * 100); }
  function calculate(input) {
    if (!Array.isArray(input.programs) || !input.programs.length || input.programs.length > 6) throw new Error('Include between one and six programs.');
    var collection = number(input.collectionRate, 'Expected collection', 100) / 100;
    var fee = number(input.processingRate, 'Payment costs', 20) / 100;
    var staffing = money(input.staffing, 'Annual staffing');
    var space = money(input.space, 'Monthly space and utilities');
    var other = money(input.other, 'Other annual costs');
    var annualCosts = staffing + space * 12 + other;
    var schedule = Array.from({length: 13}, function (_, i) { return {period: i, billed: 0, receipts: 0, paymentCosts: 0, operatingCosts: 0, net: 0, cumulative: 0}; });
    var programs = input.programs.map(function (p, i) {
      var label = 'Program ' + (i + 1);
      var enrollment = number(p.enrollment, label + ' enrollments', 10000, true);
      var tuition = money(p.tuition, label + ' annual tuition');
      var discountRate = number(p.discount, label + ' discount', 100);
      var discount = Math.round(tuition * discountRate / 100);
      var netTuition = tuition - discount;
      var deposit = money(p.deposit, label + ' deposit');
      var payments = number(p.payments, label + ' payments', 12, true);
      if (payments < 1) throw new Error(label + ': use 1 to 12 remaining payments.');
      if (deposit > netTuition) throw new Error(label + ': the deposit must not exceed tuition after the estimated discount.');
      var remaining = netTuition - deposit;
      var installment = Math.floor(remaining / payments);
      var finalInstallment = remaining - installment * (payments - 1);
      schedule[0].billed += deposit * enrollment;
      for (var m = 1; m <= payments; m++) schedule[m].billed += (m === payments ? finalInstallment : installment) * enrollment;
      return {enrollment: enrollment, tuition: tuition, discountRate: discountRate, discount: discount, netTuition: netTuition, deposit: deposit, payments: payments, installment: installment, finalInstallment: finalInstallment, gross: tuition * enrollment, discounts: discount * enrollment, billed: netTuition * enrollment};
    });
    var gross = programs.reduce(function (total, p) { return total + p.gross; }, 0);
    var discounts = programs.reduce(function (total, p) { return total + p.discounts; }, 0);
    var billed = gross - discounts;
    var receipts = 0, paymentCosts = 0, cumulative = 0, lowestBalance = 0;
    // Distribute whole cents across 12 operating months so schedule and annual totals agree.
    schedule.forEach(function (row, i) {
      row.receipts = Math.round(row.billed * collection);
      row.paymentCosts = Math.round(row.receipts * fee);
      row.operatingCosts = i === 0 ? 0 : Math.floor(annualCosts / 12) + (i === 12 ? annualCosts % 12 : 0);
      row.net = row.receipts - row.paymentCosts - row.operatingCosts;
      cumulative += row.net;
      row.cumulative = cumulative;
      lowestBalance = Math.min(lowestBalance, cumulative);
      receipts += row.receipts;
      paymentCosts += row.paymentCosts;
    });
    var net = receipts - paymentCosts - annualCosts;
    var target = collection > 0 ? Math.ceil(annualCosts / (collection * (1 - fee))) : null;
    return {programs: programs, gross: gross, discounts: discounts, billed: billed, receipts: receipts, paymentCosts: paymentCosts, annualCosts: annualCosts, net: net, target: target, reserve: Math.max(0, -lowestBalance), upfront: schedule[0].receipts, schedule: schedule, lowerEnrollmentNet: Math.round(receipts * 0.9) - Math.round(paymentCosts * 0.9) - annualCosts};
  }
  function csvCell(value) {
    var text = String(value);
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function dollars(cents) { return (cents / 100).toFixed(2); }
  function csv(input, result) {
    var rows = [
      ['Microschool tuition and budget estimate'],
      ['Created', new Date().toISOString().slice(0, 10)],
      ['Currency', 'USD'],
      ['Planning estimate only; deposits are part of tuition, not additional revenue.'],
      ['Programs may share students. Enrollments are counted separately in each program.'],
      [], ['Assumption', 'Value'],
      ['Annual staffing including founder pay', dollars(money(input.staffing, 'Staffing'))],
      ['Monthly space and utilities', dollars(money(input.space, 'Space'))],
      ['Other annual costs', dollars(money(input.other, 'Other'))],
      ['Expected collection percent', input.collectionRate], ['Payment costs percent of receipts', input.processingRate],
      [], ['Program', 'Enrollments', 'Annual tuition per enrollment', 'Estimated discount percent', 'Net tuition per enrollment', 'Deposit toward tuition per enrollment', 'Remaining payments', 'Regular payment per enrollment', 'Final payment per enrollment', 'Total annual billed tuition'],
    ];
    result.programs.forEach(function (p, i) { rows.push(['Program ' + (i + 1), p.enrollment, dollars(p.tuition), p.discountRate, dollars(p.netTuition), dollars(p.deposit), p.payments, dollars(p.installment), dollars(p.finalInstallment), dollars(p.billed)]); });
    rows.push([], ['Annual result', 'USD'], ['Tuition before discounts', dollars(result.gross)], ['Estimated discounts', dollars(result.discounts)], ['Tuition after discounts', dollars(result.billed)], ['Expected collections', dollars(result.receipts)], ['Payment costs', dollars(result.paymentCosts)], ['Operating costs', dollars(result.annualCosts)], ['Projected surplus or shortfall', dollars(result.net)], ['Approximate billed tuition needed to cover costs', result.target === null ? 'Not available at 0% collection' : dollars(result.target)], ['Additional cash needed for modeled timing', dollars(result.reserve)], ['Surplus or shortfall with 10% lower enrollment revenue', dollars(result.lowerEnrollmentNet)], [], ['Period', 'Scheduled tuition', 'Expected receipts', 'Payment costs', 'Operating costs', 'Net cash', 'Cumulative cash from zero']);
    result.schedule.forEach(function (row) { rows.push([row.period === 0 ? 'Upfront deposits' : 'Month ' + row.period, dollars(row.billed), dollars(row.receipts), dollars(row.paymentCosts), dollars(row.operatingCosts), dollars(row.net), dollars(row.cumulative)]); });
    rows.push([], ['Assumptions: all deposits arrive upfront; remaining payments begin in month 1; operating costs run evenly over 12 months; same collection and payment-cost rates apply to every receipt.'], ['No startup costs, taxes, debt, grants, enrollment changes, or payment delays are modeled. Add relevant recurring costs to your inputs.'], ['The discount percentage estimates the combined effect of family, program-combination, and sibling discounts; it does not configure those rules.'], ['Scholarship receipts replace family payments toward tuition; do not add the same tuition a second time.'], ['Amounts round to cents; a final payment may differ slightly.'], ['Values stay in this browser tab and this download; no account is created.'], ['Request a demo', 'https://www.microschoolledger.com/#contact']);
    return '\uFEFF' + rows.map(function (row) { return row.map(csvCell).join(','); }).join('\r\n');
  }
  return {calculate: calculate, csv: csv};
}));
