const test = require('node:test');
const assert = require('node:assert/strict');
const calendarService = require('../src/services/calendarService');

test('calendar service builds Year 1 correctly', () => {
    const y1 = calendarService.buildLunisolarYear(1);
    assert.equal(y1.year, 1);
    assert.equal(y1.hasLeapMonth, false);
    assert.equal(y1.monthsCount, 12);
    assert.equal(y1.roshHashana, '0001-04-09T18:00:00Z');
    assert.equal(y1.months.length, 12);
    assert.equal(y1.months[0].name, 'Abib');
    assert.equal(y1.months[0].roshJodes, '0001-04-09T18:00:00Z');
    assert.equal(y1.months[0].next, y1.months[1].roshJodes);
});

test('calendar service builds Year 2026 correctly', () => {
    const y2026 = calendarService.buildLunisolarYear(2026);
    assert.equal(y2026.year, 2026);
    assert.equal(y2026.hasLeapMonth, true);
    assert.equal(y2026.monthsCount, 13);
    assert.equal(y2026.roshHashana, '2026-03-18T18:00:00Z');
    assert.equal(y2026.months.length, 13);
    assert.equal(y2026.months[0].name, 'Abib');
    assert.equal(y2026.months[0].roshJodes, '2026-03-18T18:00:00Z');
});

test('calendar retro summary list returns expected range', () => {
    const list = calendarService.getRetroSummaryList(1, 10);
    assert.equal(list.length, 10);
    assert.equal(list[0].year, 10);
    assert.equal(list[9].year, 1);
});
