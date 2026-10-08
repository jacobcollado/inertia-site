import type { Metadata } from "next";
import { PolicyDoc } from "../policy-doc";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "If we can't get Aether working on your store within 14 days, you get a full refund. Here's how refunds work at Inertia.",
  alternates: { canonical: "https://byinertia.com/policies/refund-policy" },
};

const EFFECTIVE = "September 25, 2026";
const COMPANY = "Inertia Studio LLC";
const CONTACT = "hello@byinertia.com";

const SECTIONS = [
  {
    id: "digital-products",
    title: "Digital Products",
    body: `All products sold by ${COMPANY} ("Inertia", "we", "us"), including Shopify themes such as Aether, are digital goods delivered electronically. Because the product is accessible immediately upon purchase and cannot be returned, we do not offer refunds for change of mind. Aether purchases are covered by the guarantee below.`,
  },
  {
    id: "our-commitment",
    title: "Our Commitment",
    body: `That said, we stand behind everything we sell. If you run into a problem (a bug, something that isn't working as documented, or any other issue with your purchase), contact us at ${CONTACT} and we will do our best to make it right. For the first 14 days after purchase, we will fix any issue with the theme and help you set it up on your store. After that, support and advice continue through your dashboard at byinertia.com/dashboard. We take every complaint seriously and will work with you to resolve the issue. We would rather spend the time fixing something than leave a customer frustrated.`,
  },
  {
    id: "aether-guarantee",
    title: "Aether Guarantee",
    body: `If we can't get Aether working on your store, you get a full refund. To use it, contact us at ${CONTACT} within 14 days of purchase and give us the chance to fix the problem. If we can't resolve it, we refund the full purchase price and your license is deactivated. The guarantee does not cover: change of mind, purchases made by mistake, incompatibility with third-party apps or custom code not provided by Inertia, or issues arising from modifications made to the theme after purchase.`,
  },
  {
    id: "service-engagements",
    title: "Service Engagements",
    body: "Custom project work and retainer engagements are governed by the Terms of Service, not this policy. Deposits on service engagements are non-refundable in all cases.",
  },
  {
    id: "contact",
    title: "Questions",
    body: `If you have a problem with your purchase, please reach out before assuming there is no path forward. Most issues are fixable and we are happy to help. You can contact us any time at ${CONTACT}.`,
  },
];

export default function RefundPolicyPage() {
  return (
    <PolicyDoc
      title="Inertia Refund Policy"
      effective={EFFECTIVE}
      meta={[COMPANY, CONTACT]}
      sections={SECTIONS}
      self="refund"
      next={{ href: "/policies/terms-of-service", label: "Terms of Service" }}
    />
  );
}
