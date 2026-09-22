import type { Metadata } from "next";
import LegalPage, { Section, Bullets, Callout, Steps, PolicyLink } from "@/app/components/LegalPage";
import { BUSINESS, RESPONSE_TIMES, ORDER_POLICY, isPlaceholder } from "@/data/legal";

export const metadata: Metadata = {
  title: "Complaint Handling | RAANAE",
  description:
    "How to submit a complaint to RAANAE, what to include, how long we take to acknowledge and resolve it, how we investigate, and how to escalate if you are not satisfied.",
};

export default function ComplaintsPage() {
  return (
    <LegalPage
      eyebrow="Customer Care"
      title="Complaint Handling"
      intro={
        <>
          <p>
            {BUSINESS.brandName} is committed to providing customers with reliable
            products, delivery services and customer support. If you experience an issue
            with an order, product, delivery, payment or our service, we encourage you to
            contact us so that we can review the matter and work towards an appropriate
            resolution.
          </p>
          <p>
            Raising a complaint is free. It does not affect any other right you have,
            including your right to a refund under our{" "}
            <PolicyLink href="/shipping-returns">
              Shipping, Returns &amp; Refunds
            </PolicyLink>{" "}
            policy or to pursue a dispute through your bank or card issuer.
          </p>
        </>
      }
    >
      <Section n={1} title="How to submit a complaint">
        <p>
          Email is the quickest way to reach the team that handles complaints, and it
          leaves you with a written record. Please put the word &ldquo;Complaint&rdquo; in
          the subject line so that it is routed straight away:
        </p>
        <Bullets
          items={[
            <>
              <strong className="text-white/90">Email</strong> —{" "}
              <a
                href={`mailto:${BUSINESS.email}?subject=Complaint`}
                className="text-gold hover:underline underline-offset-4"
              >
                {BUSINESS.email}
              </a>
            </>,
          ]}
        />
        {/* The telephone sentence is dropped whole while the numbers are still
            placeholders, rather than printed with "+92 3XX XXX XXXX" in it —
            see the note in src/data/legal.ts. */}
        {!isPlaceholder(BUSINESS.phone) && (
          <p>
            You can also reach the same team by telephone on {BUSINESS.phone}
            {isPlaceholder(BUSINESS.whatsapp) ? "" : ` or on WhatsApp at ${BUSINESS.whatsapp}`}{" "}
            during {BUSINESS.hours}
            {isPlaceholder(BUSINESS.address) ? "" : `, or by post at ${BUSINESS.address}`}. If
            you telephone us, we will confirm the complaint and its reference number to you
            in writing by email, so that you have a record of it too.
          </p>
        )}
        <p>Every complaint is logged the moment it arrives, however it arrives.</p>
      </Section>

      <Section n={2} title="What to tell us">
        <p>
          You do not need to use any particular form or wording. Providing complete
          information helps us review and resolve your complaint more efficiently, so
          please include what you can of:
        </p>
        <Bullets
          items={[
            "Your full name, and the email address and contact number the order was placed under.",
            "Your order number.",
            "The date of the order, and the payment method used.",
            "A description of the issue, in your own words, and when it happened.",
            "Relevant photographs or videos, where applicable — particularly for a damaged, leaking, incorrect or incomplete delivery.",
            "What outcome you are looking for — a replacement, an exchange, a refund, or an explanation.",
            "Any other information that may help us investigate the complaint.",
          ]}
        />
      </Section>

      <Section n={3} title="Complaint response time">
        <p>
          Every complaint follows the same four stages, and we will tell you which stage
          yours is at whenever you ask.
        </p>
        <Steps
          items={[
            {
              title: "Logged and acknowledged",
              meta: `Within ${RESPONSE_TIMES.acknowledgement}`,
              body: (
                <>
                  We record your complaint in our complaints register with a unique
                  reference number, the date received, and the channel it came through. We
                  then acknowledge it in writing, quoting that reference and naming the
                  person handling it.
                </>
              ),
            },
            {
              title: "Investigated",
              meta: "Immediately after acknowledgement",
              body: (
                <>
                  We examine the order record, the payment record, the dispatch and
                  tracking history, and any photographs or videos you have sent. Where the
                  courier or our payment provider needs to be involved, we open the matter
                  with them and tell you that we have done so.
                </>
              ),
            },
            {
              title: "Resolved and answered",
              meta: `Within ${RESPONSE_TIMES.resolution}`,
              body: (
                <>
                  We give you our decision in writing, with the reason for it, and set out
                  what we will do — a replacement, an exchange, a refund, a redelivery, or
                  an explanation of why we do not think we are at fault. Where a refund is
                  due, it is issued in line with our{" "}
                  <PolicyLink href="/shipping-returns">refund policy</PolicyLink> and
                  reaches you within {ORDER_POLICY.refundProcessing} of approval.
                </>
              ),
            },
            {
              title: "Extended, where more time is needed",
              meta: `Outer limit ${RESPONSE_TIMES.escalated}`,
              body: (
                <>
                  Some matters require additional time — where investigation, courier
                  verification, product inspection, payment-provider confirmation or other
                  third-party information is needed. Where that happens we tell you before
                  the {RESPONSE_TIMES.resolution} point, explain what we are waiting for,
                  give you a revised date, and update you as it progresses. These cases are
                  reviewed personally by the founder.
                </>
              ),
            },
          ]}
        />
      </Section>

      <Section n={4} title="Complaint investigation">
        <p>
          Depending on the nature of the complaint, {BUSINESS.brandName} may request
          additional information or evidence. This may include:
        </p>
        <Bullets
          items={[
            "Order details.",
            "Photographs.",
            "Videos.",
            "Delivery information.",
            "Payment information.",
            "Product or packaging details.",
            "Courier information.",
          ]}
        />
        <p>
          If we need anything further from you, we ask for it in a single request rather
          than piecemeal. We then review the available information and communicate the
          outcome, or the next steps, to you.
        </p>
      </Section>

      <Section n={5} title="If you are not satisfied with our answer">
        <p>
          Tell us. Reply to our decision quoting your complaint reference and say why you
          disagree, and it will be reviewed again by the founder of{" "}
          {BUSINESS.brandName} — someone other than the person who handled it first. We
          will respond to that review within {RESPONSE_TIMES.resolution}.
        </p>
        <p>
          If you remain unsatisfied after our internal review, you are free to take the
          matter further, and we will cooperate with any such process. Depending on the
          nature of your complaint, you may be able to approach:
        </p>
        <Bullets
          items={[
            "Your bank or card issuer, if the complaint concerns a payment made by card or through a bank account. They operate their own dispute and chargeback procedures, which have their own time limits — so raise it with them promptly.",
            "The payment service provider that processed the transaction, whose details appear on your payment confirmation.",
            "The consumer protection authority or council for your province, which handles complaints about goods and services sold to consumers in Pakistan.",
          ]}
        />
        <p>
          On request, we will give you a copy of the record of your complaint and our
          correspondence about it, to use in any of those processes.
        </p>
      </Section>

      <Section n={6} title="Our records">
        <p>
          We keep a register of every complaint we receive, recording the reference
          number, the date received, the customer and order it relates to, the nature of
          the complaint, the action taken, the date it was closed and the outcome. We
          review the register regularly to find recurring problems and fix their causes,
          not just their symptoms.
        </p>
        <p>
          Complaint records are treated as confidential and handled in line with our{" "}
          <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
        </p>
      </Section>

      <Section n={7} title="Common issues you do not need to complain about">
        <p>
          Some things are quicker to resolve as an ordinary request. Contact us by email
          or phone and we will simply deal with them:
        </p>
        <Bullets
          items={[
            <>
              Correcting a delivery address or phone number before the order is dispatched.
            </>,
            <>
              Cancelling an order within {ORDER_POLICY.cancellation} of placing it, or any
              time before dispatch.
            </>,
            <>
              A manual bank or wallet receipt that has not been verified within{" "}
              {ORDER_POLICY.paymentVerification}.
            </>,
            <>Asking where your parcel is, or requesting your tracking number.</>,
          ]}
        />
      </Section>

      <Callout title="Contact for complaints">
        {BUSINESS.legalName} — email{" "}
        <a
          href={`mailto:${BUSINESS.email}?subject=Complaint`}
          className="text-gold hover:underline underline-offset-4"
        >
          {BUSINESS.email}
        </a>
        {isPlaceholder(BUSINESS.phone) ? "" : ` or call ${BUSINESS.phone}`}. Customer
        support hours are {BUSINESS.hours}. Acknowledged within{" "}
        {RESPONSE_TIMES.acknowledgement}, resolved within{" "}
        {RESPONSE_TIMES.resolution}.
      </Callout>
    </LegalPage>
  );
}
