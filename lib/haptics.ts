// Cross-platform haptic tap for the web.
//
// Android (Chrome/Firefox) supports the Vibration API directly. iOS Safari has
// no Vibration API, but Safari 18.0+ fires the system haptic when an
// `<input type="checkbox" switch>` *changes state*. The element must be in the
// render tree (not display:none) and the toggle must happen synchronously
// inside a user gesture. Apple patched the programmatic path in iOS 26.5, so
// this fires on iOS 18.0-26.4 and silently no-ops on newer versions. It never
// throws — haptics are a progressive enhancement.

let switchInput: HTMLInputElement | null = null;

function getSwitchInput(): HTMLInputElement | null {
  if (typeof document === "undefined") return null;
  if (switchInput && switchInput.isConnected) return switchInput;

  const input = document.createElement("input");
  input.type = "checkbox";
  // The `switch` attribute is what makes iOS treat this as a system switch and
  // emit haptics on toggle. It is not in the HTMLInputElement type.
  input.setAttribute("switch", "");
  input.setAttribute("aria-hidden", "true");
  input.tabIndex = -1;

  // Visually hidden but still rendered — display:none disables the haptic.
  Object.assign(input.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "1px",
    height: "1px",
    opacity: "0",
    pointerEvents: "none",
    margin: "0",
    border: "0",
    padding: "0",
  } satisfies Partial<CSSStyleDeclaration>);

  document.body.appendChild(input);
  switchInput = input;
  return switchInput;
}

export function hapticTap(): void {
  // iOS first: toggle the switch state to fire the system haptic.
  const input = getSwitchInput();
  if (input) {
    try {
      // .click() toggles `checked` and fires the iOS switch haptic in one step.
      input.click();
    } catch {
      // Ignore — progressive enhancement.
    }
  }

  // Android / anything with the Vibration API.
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(12);
  }
}
