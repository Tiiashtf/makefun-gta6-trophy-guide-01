// The roadmap to the platinum, in five steps, built from the official trophy
// descriptions. Step counts and chapter names are paraphrased from GTABase's
// GTA 6 Trophy Guide and KeenGamer's Platinum Roadmap (see each step's note).
export const ROADMAP_STEPS = [
  {
    title: 'Play the story, Chapters 1–5',
    body: 'Finish the five chapters and the named story missions as they come — that alone earns the 12 story trophies, the two chapter golds and the platinum’s foundation. Take side content as it shows up, and scan vehicles and study animals as you travel: the 100% checklist counts what you already did.',
    trophies: '12 story trophies + final-mission gold',
    note: 'GTABase roadmap, Step 1',
  },
  {
    title: 'Do Lucia’s balcony meditation — now',
    body: 'In Chapter 1, the morning after Down to Earth, follow Lucia from the kitchen to the balcony and accept her meditation. It is gone after Chapter 1, and it may be needed for Positive Mental Attitude — the only trophy any guide flags as possibly missable. While you are here, start the character strands (Andy, Kenton, Billy, Randy, Tyrone, Bret) as they unlock.',
    trophies: 'Positive Mental Attitude (possibly missable)',
    note: 'GTABase; KeenGamer: 1 potentially missable',
  },
  {
    title: 'Activities and collectibles as you go',
    body: 'Gold all 42 Shooting Range challenges across the 12 ranges, win a Top Fun drone race at each of the 14 locations, meditate at all 18 spots, scan 100 WAiNK locations, finish 3 Collectible Card sets, try all 9 activity types, and land stunts whenever you travel — 250 for the trophy, 300 for 100%.',
    trophies: 'The Shootist, Top Fun, You WAiNKer!, Cunning Stunts + more',
    note: 'GTABase counts: 42 ranges, 14 drone spots, 18 meditations',
  },
  {
    title: 'Post-story clean-up in free roam',
    body: 'After the credits, free roam carries on. Rob the 8 bank vaults (5 for the trophy, all 8 for 100%), one illegal operation for each of the 9 gangs, the 5 armoured-truck and shop robberies, and the one-off moments — the jet at VCIA, the tank at Mile Zero, the jewellery store, the bowling alley. Finish the 8 stranger strands and the money trophies: $250,000 of marked bills, $100,000 spent, 8 garages, 10 Scooter Bros registrations.',
    trophies: 'Maximum Withdrawal, Pest Control, Strangers & Freaks + more',
    note: 'GTABase roadmap, Steps 2–3',
  },
  {
    title: '100% completion, then the platinum',
    body: 'Open Progress, then Stats, then 100% Completion and work through what is left: all robberies, underwater discoveries, every Shooting Range gold, all drone races, Bret’s 15 Target Decks, plus a share of the rest — 100 optional missions, 200 of 277 vehicle scans, 100 of 255 animal studies, 15 of 18 meditations, 70 of 80 challenges, 300 stunts, 100 WAiNK scans. When A Long Road pops, Vice Got a Price! follows immediately.',
    trophies: 'A Long Road (gold) → Vice Got a Price! (platinum)',
    note: 'GTABase 100% checklist breakdown',
  },
];

export function renderRoadmap(container) {
  container.replaceChildren();
  for (const [index, step] of ROADMAP_STEPS.entries()) {
    const item = document.createElement('li');
    item.id = 'roadmap-step-' + (index + 1);
    const heading = document.createElement('h3');
    heading.textContent = step.title;
    const body = document.createElement('p');
    body.textContent = step.body;
    const trophies = document.createElement('p');
    trophies.className = 'step-trophies';
    trophies.textContent = step.trophies;
    const note = document.createElement('p');
    note.className = 'step-note';
    note.textContent = 'Source: ' + step.note;
    item.append(heading, body, trophies, note);
    container.append(item);
  }
}
