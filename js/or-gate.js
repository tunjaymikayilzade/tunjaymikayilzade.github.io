const game = document.querySelector("#or-game");

if (game) {
  const buttons = { a: game.querySelector("#btn-a"), b: game.querySelector("#btn-b") };
  const wires = {
    a: game.querySelector("#wire-a"),
    b: game.querySelector("#wire-b"),
    y: game.querySelector("#wire-y")
  };
  const lamp = game.querySelector("#lamp");
  const status = game.querySelector("#gate-status");
  const rows = document.querySelectorAll(".truth tbody tr");
  const state = { a: false, b: false };

  function render() {
    const y = state.a || state.b;

    ["a", "b"].forEach((key) => {
      buttons[key].setAttribute("aria-pressed", String(state[key]));
      buttons[key].querySelector("span").textContent = state[key] ? "on" : "off";
      wires[key].classList.toggle("is-on", state[key]);
    });
    wires.y.classList.toggle("is-on", y);
    lamp.classList.toggle("is-on", y);

    const code = `${Number(state.a)}${Number(state.b)}`;
    rows.forEach((row) => row.classList.toggle("is-active", row.dataset.row === code));

    status.textContent = y
      ? `A = ${Number(state.a)}, B = ${Number(state.b)}, so Y = 1. The lamp is on.`
      : "A = 0, B = 0, so Y = 0. The lamp is off.";
  }

  Object.keys(buttons).forEach((key) => {
    buttons[key].addEventListener("click", () => {
      state[key] = !state[key];
      render();
    });
  });

  render();
}
