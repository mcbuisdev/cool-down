/*
  Food characters, drawn as SVG.

  To add a new food:
  1. Add an entry to window.FOODS below with a `draw(heat)` function that returns
     SVG markup for the food (viewBox is 0 0 200 200; use face(...) for the face).
     `steamFrom` is the [x, y] point the steam rises from.
  2. Add its name to `foods` in content.js using the same key.
*/
(function () {
  // Glow colors behind the food, from frozen (0) to lava hot (5).
  const GLOW = ["#bfe3f5", "#c8ecd6", "#ffe3a8", "#ffc98a", "#ff9f6e", "#ff6b4a"];
  const INK = "#3b2a24";
  let uid = 0;

  // A face whose expression matches the heat.
  function face(cx, cy, heat, s = 1) {
    const st = `stroke="${INK}" stroke-width="${3.2}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    const cheek = heat === 0 ? "#9fd3ee" : heat >= 4 ? "#ff5a3c" : "#ff9b8f";
    const cheekOpacity = heat >= 4 ? 0.65 : 0.45;
    let eyes = "";
    let mouth = "";
    let extra = "";
    switch (heat) {
      case 0: // frozen and shivery
        eyes = `<circle cx="-13" cy="-6" r="3.2" fill="${INK}"/><circle cx="13" cy="-6" r="3.2" fill="${INK}"/>`;
        mouth = `<path ${st} d="M -10 9 l 4 -3 l 4 3 l 4 -3 l 4 3"/>`;
        break;
      case 1: // happy, ready to eat
        eyes = `<path ${st} d="M -18 -5 q 5 -7 10 0 M 8 -5 q 5 -7 10 0"/>`;
        mouth = `<path d="M -11 4 q 11 14 22 0 z" fill="${INK}"/><path d="M -5 9 q 5 4 10 0" fill="#ff8a7a"/>`;
        break;
      case 2: // calm smile
        eyes = `<circle cx="-13" cy="-6" r="3.6" fill="${INK}"/><circle cx="13" cy="-6" r="3.6" fill="${INK}"/>`;
        mouth = `<path ${st} d="M -8 5 q 8 8 16 0"/>`;
        break;
      case 3: // uneasy
        eyes = `<circle cx="-13" cy="-5" r="3.6" fill="${INK}"/><circle cx="13" cy="-5" r="3.6" fill="${INK}"/>`;
        extra = `<path ${st} d="M -19 -14 l 10 2 M 19 -14 l -10 2"/>`;
        mouth = `<path ${st} d="M -8 9 l 16 0"/>`;
        break;
      case 4: // getting upset
        eyes = `<circle cx="-13" cy="-5" r="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="-13" cy="-4" r="2.8" fill="${INK}"/>
                <circle cx="13" cy="-5" r="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="13" cy="-4" r="2.8" fill="${INK}"/>`;
        extra = `<path ${st} d="M -21 -17 l 12 4 M 21 -17 l -12 4"/>
                 <path d="M 26 -18 q 4 7 0 10 q -4 -3 0 -10 z" fill="#8fd0f5"/>`;
        mouth = `<path ${st} d="M -10 10 q 2.5 -4 5 0 q 2.5 4 5 0 q 2.5 -4 5 0 q 2.5 4 5 0"/>`;
        break;
      default: // 5: OUCH
        eyes = `<path ${st} d="M -19 -11 l 9 5 l -9 5 M 19 -11 l -9 5 l 9 5"/>`;
        extra = `<path d="M 27 -20 q 4 7 0 10 q -4 -3 0 -10 z" fill="#8fd0f5"/>
                 <path d="M -29 -14 q 4 7 0 10 q -4 -3 0 -10 z" fill="#8fd0f5"/>`;
        mouth = `<ellipse cx="0" cy="11" rx="9" ry="8" fill="${INK}"/><ellipse cx="0" cy="15" rx="5.5" ry="3.5" fill="#ff7a6b"/>`;
    }
    return `<g transform="translate(${cx} ${cy}) scale(${s})">
      <ellipse cx="-22" cy="6" rx="6" ry="4" fill="${cheek}" opacity="${cheekOpacity}"/>
      <ellipse cx="22" cy="6" rx="6" ry="4" fill="${cheek}" opacity="${cheekOpacity}"/>
      ${eyes}${extra}${mouth}
    </g>`;
  }

  // Wisps of steam: more wisps the hotter it is.
  function steam(heat, x, y) {
    if (heat <= 0) return "";
    const spots = [[0], [-14, 14], [-26, 0, 26], [-36, -12, 12, 36], [-44, -22, 0, 22, 44]][heat - 1];
    const tall = 30 + heat * 8;
    return spots
      .map((dx, i) => {
        const sx = x + dx;
        const sy = y - (i % 2) * 6;
        return `<path class="steam" style="animation-delay:-${(i * 0.9 + 0.3).toFixed(2)}s"
          d="M ${sx} ${sy} c -11 -${tall / 6} 11 -${tall / 3} 0 -${tall / 2} c -11 -${tall / 6} 11 -${tall / 3} 0 -${tall / 2}"
          fill="none" stroke="#b7c3d6" stroke-width="7" stroke-linecap="round"/>`;
      })
      .join("");
  }

  function frost(points) {
    return points
      .map(([x, y]) => `<g transform="translate(${x} ${y})" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
        <path d="M -6 0 h 12 M 0 -6 v 12 M -4 -4 l 8 8 M 4 -4 l -8 8"/></g>`)
      .join("");
  }

  function nugget(x, y, s, frozen) {
    const fill = frozen ? "#e6d5b0" : "#eba94c";
    const edge = frozen ? "#a9c6d8" : "#c27a2c";
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M -38 -5 C -40 -28 -15 -36 5 -32 C 28 -30 42 -18 38 4 C 36 26 12 32 -6 30 C -28 30 -37 18 -38 -5 Z"
        fill="${fill}" stroke="${edge}" stroke-width="3"/>
      <g fill="${frozen ? "#f4ecd9" : "#f7c870"}">
        <circle cx="-22" cy="-16" r="3"/><circle cx="20" cy="-20" r="2.5"/><circle cx="28" cy="10" r="3"/>
        <circle cx="-26" cy="16" r="2.5"/><circle cx="8" cy="22" r="2.5"/><circle cx="-4" cy="-24" r="2"/>
      </g>
    </g>`;
  }

  window.FOODS = {
    nuggets: {
      steamFrom: [100, 82],
      draw(heat) {
        const frozen = heat === 0;
        return `
          <ellipse cx="100" cy="168" rx="84" ry="18" fill="#fff" stroke="#e8d9c7" stroke-width="3"/>
          <ellipse cx="100" cy="166" rx="62" ry="10" fill="#f6eee4"/>
          ${nugget(55, 150, 0.7, frozen)}
          ${nugget(146, 152, 0.68, frozen)}
          ${nugget(100, 122, 1.25, frozen)}
          ${face(100, 124, heat, 0.95)}
          ${frozen ? frost([[52, 140], [150, 146], [70, 104], [134, 110]]) : ""}`;
      },
    },
    ramen: {
      steamFrom: [100, 76],
      draw(heat) {
        const frozen = heat === 0;
        const broth = frozen ? "#d8eef7" : "#f3c873";
        const noodle = frozen ? "#f2f7fa" : "#fbe7ad";
        return `
          <path d="M 150 40 L 108 100" stroke="#b9875a" stroke-width="5" stroke-linecap="round"/>
          <path d="M 166 46 L 116 102" stroke="#a5754b" stroke-width="5" stroke-linecap="round"/>
          <ellipse cx="100" cy="100" rx="76" ry="17" fill="${broth}" stroke="#c84a40" stroke-width="4"/>
          <rect x="56" y="80" width="18" height="26" rx="3" fill="#2f5d3a" transform="rotate(-12 65 93)"/>
          <ellipse cx="128" cy="97" rx="15" ry="9" fill="#fff"/><ellipse cx="128" cy="97" rx="7" ry="5" fill="#f6a623"/>
          <g fill="none" stroke="${noodle}" stroke-width="4" stroke-linecap="round">
            <path d="M 42 102 q 8 -8 16 0 t 16 0 t 16 0"/>
            <path d="M 84 106 q 6 -6 12 0 t 12 0"/>
            <path d="M 140 104 q 6 -6 12 0 t 12 0"/>
          </g>
          <circle cx="98" cy="95" r="7" fill="#fff" stroke="#f08ba0" stroke-width="2"/>
          <path d="M 95 95 a 3 3 0 1 1 3 3" fill="none" stroke="#f08ba0" stroke-width="2"/>
          <path d="M 24 102 L 176 102 C 176 148 144 178 100 178 C 56 178 24 148 24 102 Z"
            fill="${frozen ? "#e7a39d" : "#e8574c"}" stroke="#c84a40" stroke-width="4"/>
          <path d="M 34 124 q 11 -8 22 0 t 22 0 t 22 0 t 22 0 t 22 0 t 22 0" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>
          ${face(100, 146, heat, 0.95)}
          ${frozen ? frost([[44, 112], [158, 114], [80, 92], [150, 84]]) : ""}`;
      },
    },
  };

  // Full SVG for a food at a heat level (0 = frozen, 1 = cool ... 5 = lava).
  window.drawFood = function (key, heat) {
    const food = window.FOODS[key] || window.FOODS.nuggets;
    const id = `glow${++uid}`;
    const h = Math.max(0, Math.min(5, Math.round(heat)));
    const [sx, sy] = food.steamFrom;
    return `<svg class="food-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs><radialGradient id="${id}"><stop offset="0" stop-color="${GLOW[h]}" stop-opacity=".95"/>
        <stop offset="1" stop-color="${GLOW[h]}" stop-opacity="0"/></radialGradient></defs>
      <circle cx="100" cy="115" r="96" fill="url(#${id})"/>
      <g class="steam-group">${steam(h, sx, sy)}</g>
      ${food.draw(h)}
    </svg>`;
  };

  window.HEAT_COLORS = GLOW;
})();
