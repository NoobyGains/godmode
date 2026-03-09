// lib/memory-search.js

export function searchMemories(query, store, options = {}) {
  const { type, limit = 10, minConfidence = 0 } = options;

  let candidates = store;
  if (type) candidates = candidates.filter(m => m.type === type);
  if (minConfidence > 0) candidates = candidates.filter(m => m.confidence >= minConfidence);

  if (!query || query.trim() === '') {
    // No query — return by confidence descending
    return candidates
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const idf = buildIDF(candidates);

  const scored = candidates.map(mem => {
    const contentLower = mem.content.toLowerCase();
    const contentWords = contentLower.split(/\s+/);

    // Exact match boost
    const exactMatch = contentLower.includes(query.toLowerCase()) ? 3.0 : 0;

    // Tag match boost
    const tagMatches = queryTerms.filter(t => mem.tags.some(tag => tag.toLowerCase().includes(t))).length;
    const tagBoost = (tagMatches / queryTerms.length) * 2.0;

    // TF-IDF relevance
    let tfidfScore = 0;
    for (const term of queryTerms) {
      const tf = contentWords.filter(w => w.includes(term)).length / contentWords.length;
      const termIdf = idf.get(term) || 0;
      tfidfScore += tf * termIdf;
    }

    const baseRelevance = exactMatch + tagBoost + tfidfScore;
    if (baseRelevance === 0) {
      return { ...mem, _score: 0 };
    }

    // Recency boost
    const daysSince = (Date.now() - new Date(mem.lastConfirmed).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = 1.0 / (1.0 + daysSince) * 0.5;

    // Confidence boost
    const confBoost = mem.confidence * 0.5;

    const score = baseRelevance + recencyBoost + confBoost;
    return { ...mem, _score: score };
  });

  return scored
    .filter(m => m._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...mem }) => mem);
}

function buildIDF(store) {
  const docCount = store.length || 1;
  const termDocCounts = new Map();

  for (const mem of store) {
    const words = new Set(mem.content.toLowerCase().split(/\s+/));
    for (const word of words) {
      termDocCounts.set(word, (termDocCounts.get(word) || 0) + 1);
    }
  }

  const idf = new Map();
  for (const [term, count] of termDocCounts) {
    idf.set(term, Math.log(docCount / count));
  }
  return idf;
}
