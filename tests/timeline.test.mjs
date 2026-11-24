import test from 'node:test';
import assert from 'node:assert/strict';
import { dateForYear, nextYearDate, TIMELINE_END } from '../src/timeline.mjs';
test('annual playback visits every year from independence through 1959 without gaps', () => {
  const dates = ['1776-07-04'];
  while (nextYearDate(dates.at(-1))) dates.push(nextYearDate(dates.at(-1)));
  assert.deepEqual(
    dates.map((date) => Number(date.slice(0, 4))),
    Array.from({ length: 184 }, (_, i) => 1776 + i),
  );
  assert.ok(dates.slice(1, -1).every((date) => date.endsWith('-12-31')));
  assert.equal(dates.at(-1), TIMELINE_END);
});
test('chapter dates advance to the following year; the final year respects the coverage end', () => {
  assert.equal(nextYearDate('1803-04-30'), '1804-12-31');
  assert.equal(nextYearDate('1959-01-03'), TIMELINE_END);
  assert.equal(nextYearDate(TIMELINE_END), null);
  assert.equal(dateForYear(1959), TIMELINE_END);
  assert.equal(dateForYear('invalid'), null);
});
