"use client";

import { Hero, CodeBlock, ExamplesSection, InfoSection, PrimitiveLibToggle, usePrimitiveLibToggle, type Example, type ManualStep } from "../shared";

const code = `<Button variant="default">Primary action</Button>
<Button variant="outline">Secondary action</Button>
<Button variant="default" disabled>Disabled</Button>

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: rgb(var(--bg));
  background: var(--accent-gradient);
  transition: opacity 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.85;
}

.btn-primary:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid rgb(var(--line));
  padding: 10px 20px;
  font-size: 13px;
  letter-spacing: -0.01em;
  color: rgb(var(--muted));
  transition: color 0.2s ease;
}

.btn-secondary:hover {
  color: rgb(var(--fg));
}`;

const manualStepsByLib: Record<"base-ui" | "radix", ManualStep[]> = {
  "base-ui": [
    {
      title: "Install the following dependencies:",
      code: `npm install class-variance-authority @base-ui/react`,
    },
    {
      title: "Copy and paste the following code into your project:",
      filename: "components/ui/button.tsx",
      code: `import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-border bg-background",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Button({ className, variant, ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }`,
    },
    {
      title: "Update the import paths to match your project setup.",
      code: `import { Button } from "@/components/ui/button"`,
    },
  ],
  radix: [
    {
      title: "Install the following dependencies:",
      code: `npm install class-variance-authority @radix-ui/react-slot`,
    },
    {
      title: "Copy and paste the following code into your project:",
      filename: "components/ui/button.tsx",
      code: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-border bg-background",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Button({ className, variant, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }`,
    },
    {
      title: "Update the import paths to match your project setup.",
      code: `import { Button } from "@/components/ui/button"`,
    },
  ],
};

export default function ButtonsDemo() {
  const { lib, setLib, Button } = usePrimitiveLibToggle();

  const examples: Example[] = [
    {
      title: "Sizes",
      desc: "From xs to lg, the icon stays proportional via the size variant.",
      code: `<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`,
      demo: (
        <>
          <Button size="xs" className="rounded-full">Extra small</Button>
          <Button size="sm" className="rounded-full">Small</Button>
          <Button size="default" className="rounded-full">Default</Button>
          <Button size="lg" className="rounded-full">Large</Button>
        </>
      ),
    },
    {
      title: "Icon button",
      desc: "Use an icon-only size when the action is unambiguous without a label.",
      code: `<Button size="icon" aria-label="Add item">
  <Plus />
</Button>`,
      demo: (
        <Button size="icon" aria-label="Add item" className="rounded-full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </Button>
      ),
    },
    {
      title: "Full width",
      desc: "Stretch a button to its container for stacked, mobile-style forms.",
      code: `<Button variant="default" className="w-full">
  Continue
</Button>`,
      demo: (
        <Button variant="default" className="w-full rounded-full">
          Continue
        </Button>
      ),
    },
  ];

  return (
    <>
      <Hero title="Buttons" desc="Two weights, used the same way everywhere." />

      <section className="px-1 -mt-6 pb-16">
        <div className="max-w-2xl mx-auto w-full flex flex-col items-start">
          <PrimitiveLibToggle lib={lib} setLib={setLib} />
          <div className="flex flex-col gap-8 rounded-2xl border border-[rgb(var(--line))] p-8 sm:p-10 w-full" style={{ background: "rgb(var(--bg) / 0.4)" }}>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="default" className="rounded-full">
                Primary action
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Button>
              <Button variant="outline" className="rounded-full">
                Secondary action
              </Button>
              <Button variant="default" disabled className="rounded-full">
                Disabled
              </Button>
            </div>
            <p className="text-left text-[14px] tracking-tight text-[rgb(var(--muted))] max-w-sm" style={{ opacity: 0.5 }}>
              Primary uses the accent gradient and reserves itself for one action per view. Secondary is a quiet outline for everything else.
            </p>
            <p className="text-left text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>
              Rendered with {lib === "radix" ? "Radix UI" : "Base UI"}.
            </p>
            <CodeBlock code={code} />
          </div>

          <InfoSection
            install="npx shadcn@latest add button"
            manualSteps={manualStepsByLib[lib]}
            deps={[
              { name: "Base UI", href: "https://base-ui.com" },
              { name: "Radix UI", href: "https://radix-ui.com" },
            ]}
            usage={[
              "Button ships with two variants used across the product: default for the single primary action in a view, and outline for everything secondary. Avoid mixing more than one default button in the same group.",
              "Pass disabled for actions that are temporarily unavailable rather than hiding the button outright, this keeps layout stable and signals the action still exists.",
              `The component is built on ${lib === "radix" ? "Radix UI" : "Base UI"} below, toggle above to compare against ${lib === "radix" ? "Base UI" : "Radix UI"}. Styling and props are identical either way.`,
            ]}
          />

          <ExamplesSection examples={examples} />
        </div>
      </section>
    </>
  );
}
