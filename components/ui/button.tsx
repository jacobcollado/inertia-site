import { Button as BaseButton, buttonVariants } from "./button-base"
import { Button as RadixButton } from "./button-radix"

// Dev-time switch for which headless primitive library powers Button.
// Set NEXT_PUBLIC_UI_PRIMITIVE_LIB=radix to use @radix-ui/react-slot instead of @base-ui/react.
const Button =
  process.env.NEXT_PUBLIC_UI_PRIMITIVE_LIB === "radix" ? RadixButton : BaseButton

export { Button, buttonVariants }
