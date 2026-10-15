import type { Metadata } from "next";
import HashScroll from "@/components/about/HashScroll";
import Button from "@/components/site/Button";
import { contactFor } from "@/components/site/regionalContacts";
import CraneRentalContent from "@/components/services/CraneRentalContent";
import ContactForm from "@/components/contact/ContactForm";

/**
 * /services/crane-rental — Crane Rental's own page (2026-10-09). The first
 * service to get one, following the Maxim Crane comparison: an indexable URL
 * with its own title, and the quote form on the page rather than one click
 * away. Old /services#crane-rental links redirect here.
 *
 * Body: CraneRentalContent. This file adds the metadata and the quote
 * section — the same /contact form (ContactForm, service
 * preselected), so there is still one form and one submission path. Like
 * /contact, it says plainly that nothing is sent until a backend exists.
 *
 * Reached from: the homepage card, the nav's Services panel, the footer,
 * the /services card and crane preview (all via services.ts serviceHref).
 *
 * DARK THEME (TNT Dark, 2026-10-15): the gold quote band is unchanged; the
 * form card is black, like Dark's homepage RequestQuote form.
 */

export const metadata: Metadata = {
  title: "Crane Rental | TNT Crane & Rigging",
  description:
    "Operated and bare crane rental across the TNT Crane & Rigging family: all-terrain, crawler, rough-terrain, hydraulic truck and carry deck cranes, boom trucks and more, in the US and Canada.",
  alternates: { canonical: "/services/crane-rental" },
};

const MAIN_LINE = contactFor("TNT Crane & Rigging")!.phones[0];

export default function CraneRentalPage() {
  return (
    <>
      <HashScroll />
      <CraneRentalContent />

      {/* QUOTE — form on the page. Gold band like /services' close; the
          form card sits on it the way the homepage quote form sits on slate. */}
      <section id="quote" aria-labelledby="crane-quote-heading" className="scroll-mt-32 bg-tnt-amber">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:px-8">
          <div>
            <p className="font-body text-[13px] font-bold tracking-[0.18em] text-black/70 uppercase">Request a Quote</p>
            <h2 id="crane-quote-heading" className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl tracking-wide text-black uppercase">
              Get a crane
              <br />
              rental quote
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-black/75">
              Tell us the load, the site and the window. If you know the lift weight, radius and
              height, include them and our team can size the crane faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={MAIN_LINE.href} variant="primary" arrow={false}>
                Call {MAIN_LINE.display}
              </Button>
              <Button href="/contact#regional-contacts" variant="secondary">
                Regional contacts
              </Button>
            </div>
          </div>
          <div>
            <h3 className="sr-only">Crane rental quote form</h3>
            <ContactForm service="crane-rental" />
          </div>
        </div>
      </section>
    </>
  );
}
