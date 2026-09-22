import { FcGoogle } from "react-icons/fc";
import { SiAmericanexpress, SiApplepay, SiKlarna, SiVisa } from "react-icons/si";
import { cn } from "@/lib/utils";

// Simple Icons are single-color, which flattens Mastercard to one red disc.
// Its mark is two circles (red, yellow) with an orange overlap.
function MastercardMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#EB001B" />
      <circle cx="22" cy="10" r="10" fill="#F79E1B" />
      <path d="M16 2A10 10 0 0 1 16 18A10 10 0 0 1 16 2Z" fill="#FF5F00" />
    </svg>
  );
}

// Google Pay mark: the four-color G followed by "Pay" in Google's grey.
function GooglePayMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[3px]", className)} aria-hidden="true">
      <FcGoogle className="h-[15px] w-[15px]" />
      <span className="text-[13px] font-medium leading-none tracking-tight text-[#5F6368]">Pay</span>
    </span>
  );
}

// Light badge with the colored mark for every method except Klarna, whose
// mark is defined by its pink badge.
const LIGHT_CHIP = "border-[rgb(var(--line))] bg-white";

const METHODS = [
  { name: "Visa", Icon: SiVisa, chip: LIGHT_CHIP, className: "h-[18px] w-auto text-[#1434CB]" },
  { name: "Mastercard", Icon: MastercardMark, chip: LIGHT_CHIP, className: "h-[16px] w-auto" },
  { name: "American Express", Icon: SiAmericanexpress, chip: LIGHT_CHIP, className: "h-[18px] w-auto text-[#006FCF]" },
  { name: "Apple Pay", Icon: SiApplepay, chip: LIGHT_CHIP, className: "h-[20px] w-auto text-black" },
  { name: "Google Pay", Icon: GooglePayMark, chip: LIGHT_CHIP, className: "" },
  { name: "Klarna", Icon: SiKlarna, chip: "border-[#FFA8CD] bg-[#FFA8CD]", className: "h-[12px] w-auto text-black" },
] as const;

export function PaymentMethodIcons({ className }: { className?: string }) {
  return (
    <ul
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      aria-label="Payment methods available at checkout"
    >
      {METHODS.map(({ name, Icon, chip, className: iconClass }) => (
        <li key={name}>
          <span className={cn("inline-flex h-7 min-w-[2.75rem] items-center justify-center rounded-[5px] border px-2", chip)}>
            <Icon className={iconClass} aria-hidden="true" />
            <span className="sr-only">{name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
