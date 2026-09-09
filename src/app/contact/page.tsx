import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import LegalPage, { Section, Bullets, Callout, PolicyLink } from "@/app/components/LegalPage";
import {
  BUSINESS,
  RESPONSE_TIMES,
  ORDER_POLICY,
  isPlaceholder,
  telHref,
  whatsappHref,
} from "@/data/legal";

export const metadata: Metadata = {
  title: "Contact Us | RAANAE",
  description:
    "Reach RAANAE by email, phone or WhatsApp. Support hours, our address, and how to get help with an order, a return or a complaint.",
};

/**
 * One contact method.
 *
 * `href` is null while the underlying value is still an unconfirmed
 * placeholder -- the card then renders as plain text rather than as a link
 * that dials a number nobody owns.
 */
function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  note,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string | null;
  note?: string;
}) {
  const body = (
    <>
      <span className="w-10 h-10 shrink-0 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gold" />
      </span>
      <span className="min-w-0 space-y-1">
        <span className="block text-[9px] uppercase tracking-[0.3em] font-black text-white/40">
          {label}
        </span>
        <span className="block text-[14px] font-bold text-white break-words">{value}</span>
        {note && (
          <span className="block text-[11px] leading-relaxed text-white/50">{note}</span>
        )}
      </span>
    </>
  );

  const shell =
    "flex gap-4 items-start rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-5";

  return href ? (
    <a
      href={href}
      className={`${shell} hover:border-gold/40 hover:bg-gold/[0.04] transition-colors`}
    >
      {body}
    </a>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Customer Care"
      title="Contact Us"
      intro={
        <p>
          A real person answers every message. Whether it is a question before you buy, a
          query about an order on its way, or something that has gone wrong, use whichever
          of the channels below suits you and we will get back to you within{" "}
          {RESPONSE_TIMES.enquiry}.
        </p>
      }
    >
      <Section title="Ways to reach us">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ContactCard
            icon={Mail}
            label="Email"
            value={BUSINESS.email}
            href={`mailto:${BUSINESS.email}`}
            note="Best for order queries, returns and anything needing a written record."
          />
          <ContactCard
            icon={Phone}
            label="Phone"
            value={BUSINESS.phone}
            href={telHref(BUSINESS.phone)}
            note={`Available ${BUSINESS.hours}.`}
          />
          <ContactCard
            icon={MessageCircle}
            label="WhatsApp"
            value={BUSINESS.whatsapp}
            href={whatsappHref(BUSINESS.whatsapp)}
            note="Message us for a quick update or to send a photograph of an item."
          />
          <ContactCard
            icon={Clock}
            label="Support Hours"
            value={BUSINESS.hours}
            note="Messages received outside these hours are answered the next working day."
          />
        </div>

        {!isPlaceholder(BUSINESS.address) && (
          <div className="pt-4">
            <ContactCard
              icon={MapPin}
              label="Address"
              value={BUSINESS.address}
              note="Please contact us before visiting — we are not a walk-in retail store."
            />
          </div>
        )}
      </Section>

      <Section title="Help us help you faster">
        <p>
          When you write to us about an existing order, including these details in your
          first message usually saves a round of back-and-forth:
        </p>
        <Bullets
          items={[
            "Your order number, from your confirmation email or the order success page.",
            "The name and phone number the order was placed under.",
            "Which payment method you used, and the date of payment.",
            "A clear description of the problem, and photographs if an item arrived damaged or looks wrong.",
          ]}
        />
      </Section>

      <Section title="What to contact us about">
        <Bullets
          items={[
            <>
              <strong className="text-white/90">Before you order</strong> — questions about
              a fragrance, its longevity, ingredients, stock, or delivery to your city.
            </>,
            <>
              <strong className="text-white/90">Payment</strong> — if a payment failed, was
              taken twice, or your uploaded receipt has not been verified within{" "}
              {ORDER_POLICY.paymentVerification}.
            </>,
            <>
              <strong className="text-white/90">Delivery</strong> — to change an address
              before dispatch, to chase a delayed parcel, or to arrange redelivery. See our{" "}
              <PolicyLink href="/shipping-returns">
                Shipping, Returns &amp; Refunds
              </PolicyLink>{" "}
              policy.
            </>,
            <>
              <strong className="text-white/90">Cancellations and returns</strong> — to
              cancel within {ORDER_POLICY.cancellation}, report a damaged or incorrect item
              within {ORDER_POLICY.claimWindow} of delivery, or return an unopened order
              within {ORDER_POLICY.returnWindow}.
            </>,
            <>
              <strong className="text-white/90">Complaints</strong> — anything you are
              unhappy with. Our{" "}
              <PolicyLink href="/complaints">Complaint Handling</PolicyLink> page sets out
              the process and the timelines we hold ourselves to.
            </>,
            <>
              <strong className="text-white/90">Privacy</strong> — to see, correct or
              delete the information we hold about you, as described in our{" "}
              <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
            </>,
          ]}
        />
      </Section>

      <Section title="Our response commitment">
        <Bullets
          items={[
            <>General enquiries: answered within {RESPONSE_TIMES.enquiry}.</>,
            <>Complaints: acknowledged within {RESPONSE_TIMES.acknowledgement}.</>,
            <>
              Complaints resolved: within {RESPONSE_TIMES.resolution}, or{" "}
              {RESPONSE_TIMES.escalated} for cases needing investigation with a courier or
              payment provider, with progress updates while we work on it.
            </>,
          ]}
        />
        <Callout title="Beware of impersonation">
          We will never ask you for your card PIN, CVV, wallet PIN or a one-time password
          (OTP), and we will never ask you to send money to a personal account other than
          the account details shown at checkout. If in doubt, call us on the number on
          this page before paying anyone.
        </Callout>
      </Section>
    </LegalPage>
  );
}
