// Reviews of Aether, shared by the page (a server component) and the
// Testimonials carousel, so the data lives outside any client module.

export interface Testimonial {
  quote: string;
  name: string;
  /** Brand logo, a circular PNG in /public/reviews. Optional: without one
   * the caption shows the name alone. */
  logo?: string;
  /** The brand's store, shown as a bare domain under the name. */
  site?: string;
  /** An exact substring of the quote, inked in against the rest of the
   * quote in grey once it lands, so each review has one line that scans. */
  highlight?: string;
}

/* Real reviews from brands Inertia has worked with, quoted as sent. The
 * heading says "worked with" rather than claiming each one runs Aether, so
 * keep it that way unless every review here is from an Aether store. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "You've been great, super happy with how our website turned out and how quickly you were able to do everything. You make all the changes we have needed and are constantly willing to help. You have been amazing!",
    name: "Vora",
    logo: "/reviews/voraarchive.png",
    site: "voraarchive.com",
    highlight: "super happy with how our website turned out",
  },
  {
    quote:
      "I am happy with the service you provided, was a safe process, turn around time was good, requests were met tweaks were made that were asked for and you designed a very clear easy to use functioning store, would recommend & refer you to anyone else in need of a site",
    name: "defy.ca",
    logo: "/reviews/defy.png",
    site: "defytheodds.co",
    highlight: "turn around time was good",
  },
  {
    // The review named the studio "Agentic Web Designer"; Inertia is the
    // current name, swapped in at the owner's request. Em dashes replaced
    // with a period, per the site's copy rules.
    quote:
      "Awesome customer service from start to finish! They worked directly with me and my team throughout the entire process, were responsive, professional, and made sure everything was exactly how we wanted it. Great experience overall. 100% recommend Inertia to anyone looking for a reliable web design team!",
    name: "awoken__dreams",
    logo: "/reviews/awokendreams.png",
    site: "awokendreams.shop",
    highlight: "Awesome customer service from start to finish!",
  },
];
