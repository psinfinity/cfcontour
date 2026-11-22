'use strict';

// bucket everyone by rating and average their score

(function (CF) {
  // api row -> { handle, score }
  function toRow(row) {
    const member = row.party && row.party.members && row.party.members[0];
    return { handle: member && member.handle, score: row.points || 0 };
  }

  function compute(rows, ratings) {
    const buckets = new Map();  // rating bucket lower bound -> { count, sum }
    let participants = 0;

    for (const row of rows) {
      const handle = String(row.handle || '').toLowerCase();
      const rating = ratings && ratings.has(handle) ? ratings.get(handle) : null;

      // points is the score (problems in normal contests, real score in score-based ones)
      const score = row.score || 0;

      participants++;

      if (rating === null) continue;

      const low = Math.floor(rating / 100) * 100;
      const bucket = buckets.get(low) || { count: 0, sum: 0 };
      bucket.count++;
      bucket.sum += score;
      buckets.set(low, bucket);
    }

    const bucketList = [...buckets.entries()]
      .map(([low, bucket]) => ({
        low,
        high: low + 99,
        count: bucket.count,
        avg: bucket.sum / bucket.count,
      }))
      .sort((a, b) => a.low - b.low);

    return { buckets: bucketList, participants };
  }

  function rowsForFilter(state) {
    const apiRows = (state.apiRows || []).map(toRow);
    if (state.filter === 'official') return apiRows;

    // everyone = api official + page unofficial
    const unofficial = (state.domRows || []).filter((row) => !row.official);
    return [...apiRows, ...unofficial];
  }

  CF.toRow = toRow;
  CF.compute = compute;
  CF.rowsForFilter = rowsForFilter;
})(window.CFContour = window.CFContour || {});