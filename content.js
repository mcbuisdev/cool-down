/*
  ALL the words in the app live in this file.
  DRAFT COPY — please review and rewrite anything so it sounds like you.

  Tips for editing:
  - Only change the text inside the quotes.
  - If your text needs an apostrophe inside "double quotes", that's fine: "it's".
  - {food} gets swapped for the food's name, {n} and {total} for numbers.
  - Lists (inside [ ]) can be made longer or shorter. Keep the commas between items.
*/
window.CONTENT = {
  appTitle: "Cool It Down",
  tagline: "When feelings get too hot, let them cool before you take a bite.",

  home: {
    story: "Read the Story",
    tool: "My Food Is Hot!",
  },

  nav: {
    home: "Home",
    back: "Back",
    next: "Next",
    soundOn: "Sound on",
    soundOff: "Sound off",
    settings: "Settings",
  },

  foods: {
    nuggets: { name: "Chicken Nuggets" },
    ramen: { name: "Ramen" },
  },

  // The story always uses the chicken nuggets.
  // heat: 0 = frozen, 1 = cool and ready, 5 = super hot.
  // props: emoji shown next to the food.
  story: [
    {
      heat: 5,
      props: ["✨"],
      title: "Fresh out of the oven!",
      text: "Here's a plate of yummy, fresh chicken nuggets. They smell SO good. But they are super HOT!",
    },
    {
      heat: 5,
      burst: "OUCH!",
      props: [],
      title: "Too fast!",
      text: "If you bite right away... OUCH! You burn your mouth. When we react to anger too fast, we can say or do things we don't really mean.",
    },
    {
      heat: 4,
      props: ["💛"],
      title: "Hot isn't bad",
      text: "The nuggets aren't bad. They're just too hot right now. Anger is like that too. It's an okay feeling. It just needs some time to cool.",
    },
    {
      heat: 4,
      props: ["😡", "✊", "💓"],
      title: "Look for the steam",
      text: "How can you tell food is hot? Steam! Your body has steam too: a hot face, tight fists, a fast heartbeat.",
    },
    {
      heat: 3,
      props: ["🌬️", "🥤", "⏳"],
      title: "Ways to cool down",
      text: "You can blow on them. You can grab a drink while they cool. Or you can just sit and wait with them.",
    },
    {
      heat: 5,
      props: ["🔁", "🔥"],
      title: "Not back in the microwave!",
      text: "Putting them back in the microwave makes them even HOTTER. Thinking about what made you mad over and over again is like that.",
    },
    {
      heat: 0,
      props: ["🧊", "❄️"],
      title: "Not the freezer, either",
      text: "Shoving them in the freezer doesn't work either. Frozen nuggets aren't yummy! Hiding feelings away doesn't make them go away.",
    },
    {
      heat: 5,
      props: ["🧊", "🥤"],
      title: "Oops!",
      text: "Sometimes we still burn our mouth. That's okay! Grab some ice water: say sorry and fix what you can. Then try again next time.",
    },
    {
      heat: 1,
      props: ["😋"],
      title: "Just right",
      text: "When they've cooled down enough, you can take a bite. That's when you can say or do what you really want to.",
    },
  ],
  storyEnd: "Try it yourself!",

  pickFood: {
    title: "Pick your food",
    subtitle: "Which hot food is yours today?",
  },

  heat: {
    title: "How hot is it?",
    subtitle: "Tap how hot your feelings are right now.",
    // One label for each level, 1 through 5.
    levels: ["Warm", "Toasty", "Hot", "Really hot", "LAVA hot!"],
  },

  body: {
    title: "Where do you feel the heat?",
    subtitle: "Tap the spots where your body feels hot, tight, or buzzy.",
    spots: {
      face: "Hot face",
      chest: "Fast heartbeat",
      tummy: "Tight tummy",
      hands: "Tight fists",
      feet: "Stompy feet",
    },
    skip: "Skip",
    next: "Next",
  },

  toolbox: {
    title: "Cooling toolbox",
    subtitle: "Pick a way to cool your {food} down.",
    tools: {
      breathe: { name: "Blow on it", desc: "Slow, cooling breaths" },
      drink: { name: "Grab a drink", desc: "Do something else while it cools" },
      wait: { name: "Sit and wait", desc: "Let it cool on its own" },
      steamOut: { name: "Let the steam out", desc: "Say how you feel" },
      sauce: { name: "Dipping sauce", desc: "Add something cozy" },
    },
  },

  breathe: {
    title: "Blow on it",
    subtitle: "Let's cool it down with slow breaths.",
    start: "Start",
    ready: "Ready?",
    inhale: "Smell the yummy food...",
    exhale: "...now blow on it!",
    round: "Breath {n} of {total}",
    done: "All done!",
  },

  drink: {
    title: "Grab a drink",
    subtitle: "Take a sip while it cools. Then try this:",
    newIdea: "New idea",
    done: "I did it!",
    ideas: [
      "Find 5 blue things in the room.",
      "Do 10 wall push-ups.",
      "Name 3 animals that start with B.",
      "Count backwards from 20.",
      "Draw your food with a silly face.",
      "Squeeze a pillow as hard as you can, then let go.",
      "Hum your favorite song.",
      "Name 5 things you can hear right now.",
      "Stretch up tall like a giraffe.",
      "Spell your name backwards.",
      "Do 10 jumping jacks.",
      "Think of a food for every letter from A to E.",
    ],
  },

  wait: {
    title: "Sit and wait",
    subtitle: "Hot food cools down on its own. Let's wait together.",
    start: "Start waiting",
    pause: "Pause",
    resume: "Keep going",
    finishEarly: "I'm done waiting",
    done: "Done!",
    timeUp: "Time's up!",
  },

  steamOut: {
    title: "Let the steam out",
    subtitle: "Cut it open! What feelings are inside? Tap them.",
    prompt: "Say it out loud:",
    sentence: "“I feel {feelings} because...”",
    sentenceEmpty: "“I feel ___ because...”",
    and: "and",
    done: "I said it!",
    feelings: [
      { emoji: "😠", word: "mad" },
      { emoji: "😤", word: "frustrated" },
      { emoji: "😳", word: "embarrassed" },
      { emoji: "😔", word: "left out" },
      { emoji: "💔", word: "hurt" },
      { emoji: "😒", word: "jealous" },
      { emoji: "😟", word: "worried" },
      { emoji: "🙄", word: "annoyed" },
      { emoji: "😞", word: "disappointed" },
      { emoji: "⚖️", word: "treated unfairly" },
    ],
  },

  sauce: {
    title: "Dipping sauce",
    subtitle: "Add something cozy and comforting. Try this:",
    newIdea: "New idea",
    done: "I did it!",
    ideas: [
      "Hug a pillow or a stuffed animal.",
      "Wrap up in a cozy blanket.",
      "Pet a dog or a cat.",
      "Listen to your favorite song.",
      "Look at a picture that makes you smile.",
      "Think of someone who makes you feel safe.",
      "Sip some cold water.",
      "Doodle something you love.",
    ],
  },

  cooled: {
    cooling: "Ahh... cooling down...",
    done: "Your {food} cooled down a little!",
    next: "Check the temperature",
  },

  check: {
    title: "Check the temperature",
    subtitle: "How hot is it now?",
    next: "Next",
    stillHot: "Still a little hot. That's okay! Let's try another cooling tool.",
    tryAnother: "Try another tool",
  },

  ready: {
    title: "Ready for a bite!",
    subtitle: "Now that it's cooled down, what do you want to do?",
    next: "I'm ready",
    choices: [
      { emoji: "💬", text: "Talk to someone about it" },
      { emoji: "🙋", text: "Ask for help" },
      { emoji: "🛋️", text: "Take a break" },
      { emoji: "🧩", text: "Solve the problem" },
      { emoji: "🤝", text: "Make it right" },
      { emoji: "🔁", text: "Try again" },
    ],
  },

  celebrate: {
    title: "You cooled it down!",
    text: "You waited, you cooled it down, and now you're ready. That takes real strength!",
    again: "Start over",
    story: "Read the story",
  },

  settings: {
    title: "Settings",
    note: "Settings go back to normal when the page is refreshed. Nothing is saved.",
    sound: "Sound",
    reduceMotion: "Calmer animations",
    largeText: "Large text",
    waitLength: "Wait timer",
    breathRounds: "Number of breaths",
    breathPace: "Breathing pace",
    paces: { slow: "Slow", normal: "Normal", quick: "Quick" },
    seconds: "seconds",
    minute: "minute",
    minutes: "minutes",
    close: "Done",
  },
};
