// Turns BANK_DATA into ready-to-play questions for every game and mode.
(() => {
  const D = window.BANK_DATA;
  const BUCKETS = ["Taxable", "Excluded", "Deductible", "Not deductible"];
  const LABELS = ["Taxable income", "Excluded", "Deductible", "Not deductible"];
  const VALUES = [100, 200, 300, 400, 500];

  const shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // Shuffle options; the correct one is listed first in the data.
  const mc = (prompt, opts, why, tag, kind) => {
    const order = shuffle(opts.map((_, i) => i));
    return { kind, tag, prompt, options: order.map((i) => opts[i]), answer: order.indexOf(0), why };
  };

  const sortQs = () => D.cards.map(([type, item, ans, why]) => ({
    kind: "sort", tag: `${type} item`, prompt: item, options: LABELS, answer: BUCKETS.indexOf(ans), why,
  }));
  const lieQs = () => D.lies.map(([topic, stmts, lie, why]) => {
    const order = shuffle([0, 1, 2]);
    return { kind: "lie", tag: topic, prompt: "Which one is the lie?", options: order.map((i) => stmts[i]), answer: order.indexOf(lie), why };
  });
  const jeopardyQs = () => D.jeopardy.cats.flatMap((c) => c.clues.map(([q, o, why]) => mc(q, o, why, c.name, "jeopardy")));

  window.BANK = {
    LABELS,
    shuffle,
    // Quiz: Card Sort, Two Truths, or Mix.
    quiz(game, count) {
      const pool = shuffle(game === "sort" ? sortQs() : game === "lie" ? lieQs() : [...sortQs(), ...lieQs()]);
      return count ? pool.slice(0, count) : pool;
    },
    // Jeopardy board with shuffled options.
    jeopardy() {
      return {
        cats: D.jeopardy.cats.map((c) => ({
          name: c.name,
          clues: c.clues.map(([q, o, why], r) => ({ value: VALUES[r], ...mc(q, o, why, c.name, "jeopardy") })),
        })),
        final: mc(D.jeopardy.final[0], D.jeopardy.final[1], D.jeopardy.final[2], "Final Jeopardy", "jeopardy"),
      };
    },
    // Flashcards for solo study: front, back, explanation.
    flashcards(deck) {
      const cards = [];
      if (deck === "all" || deck === "sort")
        for (const [type, item, ans, why] of D.cards)
          cards.push({ tag: `Card Sort · ${type}`, front: item, hint: "Taxable, excluded, deductible, or not deductible?", back: ans === "Taxable" ? "Taxable income" : ans, why });
      if (deck === "all" || deck === "lie")
        for (const [topic, stmts, lie, why] of D.lies)
          stmts.forEach((s, i) => cards.push({ tag: `True or false · ${topic}`, front: s, hint: "True or false?", back: i === lie ? "False" : "True", why: i === lie ? why : "" }));
      if (deck === "all" || deck === "jeopardy") {
        for (const c of D.jeopardy.cats)
          for (const [q, o, why] of c.clues) cards.push({ tag: `Jeopardy · ${c.name}`, front: q, hint: "", back: o[0], why });
        const f = D.jeopardy.final;
        cards.push({ tag: "Jeopardy · Final", front: f[0], hint: "", back: f[1][0], why: f[2] });
      }
      return shuffle(cards);
    },
    // Speed-round questions for team flashcards: a mix of every format.
    flashQs(count) {
      const tf = D.lies.flatMap(([topic, stmts, lie, why]) =>
        stmts.map((s, i) => ({ kind: "tf", tag: `True or false · ${topic}`, prompt: s, options: ["True", "False"], answer: i === lie ? 1 : 0, why: i === lie ? why : "That statement is true." })));
      const pool = shuffle([...sortQs(), ...tf, ...jeopardyQs()]);
      return count ? pool.slice(0, count) : pool;
    },
  };
})();
