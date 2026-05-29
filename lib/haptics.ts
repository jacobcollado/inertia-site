// Cross-platform haptic tap for the web.
//
// Android (Chrome/Firefox) supports the Vibration API directly. iOS Safari has
// no Vibration API, but Safari 18.0+ fires the system haptic when a hidden
// `<input type="checkbox" switch>` is clicked. Apple patched the programmatic
// click path in iOS 26.5, so the switch trick only fires on iOS 18.0-26.4; on
// newer versions it silently no-ops. Either way this never throws.

let switchInput: HTMLInputElement | null = null;

function getSwitchInput(): HTMLInputElement | null {
  if (typeof document === "undefined") return null;
  if (switchInput) return switchInput;

  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.display = "none";

  const input = document.createElement("input");
  input.type = "checkbox";
  // The `switch` attribute is what triggers the iOS haptic. It is not in the
  // HTMLInputElement type, so set it as an attribute.
  input.setAttribute("switch", "");

  label.appendChild(input);
  document.body.appendChild(label);
  switchInput = input;
  return switchInput;
}

export function hapticTap(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10);
    return;
  }
  // No Vibration API (iOS) — fall back to the switch input trick.
  try {
    getSwitchInput()?.click();
  } catch {
    // Ignore — haptics are a progressive enhancement.
  }
}
