import type { Metadata } from "next";
import LegalPage, { Section, Bullets, Callout, PolicyLink, SubHeading } from "@/app/components/LegalPage";
import { BUSINESS, DATA_PROCESSORS, RESPONSE_TIMES } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | RAANAE",
  description:
    "How RAANAE collects, uses, shares, stores and protects your personal information, and the choices and rights you have over it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={
        <>
          <p>
            {BUSINESS.brandName} ({BUSINESS.legalName}) respects your privacy. This policy
            explains what personal information we collect when you visit this website or
            place an order, why we collect it, who we share it with, how long we keep it,
            and what you can ask us to do with it.
          </p>
          <p>
            We collect only what we need to take your order, deliver it, answer your
            questions and meet our legal obligations. We do not sell your personal
            information to anyone.
          </p>
        </>
      }
    >
      <Section n={1} title="Who is responsible for your information">
        <p>
          {BUSINESS.legalName} is responsible for the personal information described in
          this policy. If you have a question or request about your data, contact us at{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>{" "}
          or {BUSINESS.phone}. Our postal address is {BUSINESS.address}.
        </p>
      </Section>

      <Section n={2} title="Information we collect">
        <SubHeading>Information you give us</SubHeading>
        <Bullets
          items={[
            <>
              <strong className="text-white/90">Order and delivery details</strong> — your
              name, email address, phone number, street address, city, province and postal
              code, entered at checkout so we can confirm and deliver your order.
            </>,
            <>
              <strong className="text-white/90">Payment confirmation</strong> — when you
              pay by manual bank transfer or mobile wallet, the receipt or screenshot you
              upload so we can match your payment to your order.
            </>,
            <>
              <strong className="text-white/90">Reviews and photographs</strong> — the
              name, rating, written review and any images you choose to submit about a
              product.
            </>,
            <>
              <strong className="text-white/90">Correspondence</strong> — the content of
              emails, calls and messages you send us, including complaints, so we can
              respond and keep a record of the outcome.
            </>,
          ]}
        />

        <SubHeading>Information collected automatically</SubHeading>
        <Bullets
          items={[
            "Basic technical information sent by your browser, such as your IP address, device and browser type, and the pages you visited, used to keep the site secure and working correctly.",
            "Your shopping bag, which is stored in your own browser (in local storage) so that it survives a page refresh. It stays on your device and is not sent to us until you place an order.",
          ]}
        />

        <Callout title="What we never collect">
          We never receive or store your full card number, card expiry, CVV or wallet PIN.
          When you pay online, those details are entered directly on the secure page of
          our payment partner, Safepay, and stay with them. We are told only whether the
          payment succeeded, along with a reference for the transaction.
        </Callout>
      </Section>

      <Section n={3} title="Why we use your information">
        <Bullets
          items={[
            "To confirm, price, process and deliver your order, and to keep you informed about its progress.",
            "To verify a payment you have made, and to detect and prevent fraudulent or duplicate transactions.",
            "To answer your enquiries and to investigate and resolve complaints.",
            "To publish product reviews you have chosen to submit, after moderation.",
            "To keep records of sales and payments, as required for accounting, tax and regulatory purposes.",
            "To protect the security and integrity of this website.",
            "To send you marketing messages about new fragrances and offers, but only where you have asked to receive them. You can opt out at any time.",
          ]}
        />
        <p>
          We rely on the performance of our contract with you for order-related
          processing, on our legitimate interest in running a secure and honest shop for
          fraud prevention and site security, on your consent for marketing and for
          publishing your review, and on our legal obligations for record keeping.
        </p>
      </Section>

      <Section n={4} title="Who we share it with">
        <p>
          We share your information only with the parties below, only to the extent they
          need it, and only for the purposes described.
        </p>
        <Bullets
          items={DATA_PROCESSORS.map((processor) => (
            <>
              <strong className="text-white/90">{processor.name}</strong> —{" "}
              {processor.purpose}
            </>
          ))}
        />
        <p>
          We may also disclose information where we are required to do so by law, by a
          court order, or by a regulator or law-enforcement authority, and where necessary
          to establish or defend legal claims. If our business is ever transferred to
          another owner, customer records may transfer with it, subject to this policy.
        </p>
        <p className="text-white/90">
          We do not sell, rent or trade your personal information, and we do not share it
          with advertisers.
        </p>
      </Section>

      <Section n={5} title="Where your information is stored">
        <p>
          Our website and database are hosted on servers operated by our hosting and
          database providers, which may be located outside {BUSINESS.country}. Where your
          information is transferred abroad, we take reasonable steps to ensure it remains
          protected to the standard described in this policy and is held only by providers
          bound to keep it confidential and secure.
        </p>
      </Section>

      <Section n={6} title="How we protect it">
        <Bullets
          items={[
            "The website is served over an encrypted HTTPS connection.",
            "Payment receipts and review photographs are held in private storage that is not publicly browsable, and are opened only through short-lived, signed links.",
            "The administrative area is protected by password authentication and is restricted to authorised staff.",
            "Access to customer records is limited to the people who need it to fulfil orders and answer enquiries.",
          ]}
        />
        <p>
          No method of transmission or storage is completely secure, so we cannot
          guarantee absolute security. If a breach ever affects your information in a way
          likely to cause you harm, we will tell you and the relevant authority without
          undue delay.
        </p>
      </Section>

      <Section n={7} title="How long we keep it">
        <Bullets
          items={[
            "Order records, including payment references and delivery details, are kept for as long as needed to serve you and then for the period required by tax and accounting rules.",
            "Payment receipts you upload are kept only as long as needed to verify the payment and to deal with any later dispute about it.",
            "Published reviews and their photographs are kept until you ask us to remove them.",
            "Enquiry and complaint correspondence is kept as a record of what happened and how it was resolved.",
            "Marketing contact details are removed promptly once you opt out.",
          ]}
        />
      </Section>

      <Section n={8} title="Cookies and browser storage">
        <p>
          We keep this to a minimum. We use your browser&apos;s local storage to remember
          your shopping bag, and a secure session cookie is set when a member of our team
          signs in to the administrative area. We do not use cookies to build advertising
          profiles of visitors.
        </p>
        <p>
          You can clear or block cookies and local storage in your browser settings. If
          you do, the site will still work, but your shopping bag will not be remembered
          between visits.
        </p>
      </Section>

      <Section n={9} title="Your rights and choices">
        <p>You may ask us to:</p>
        <Bullets
          items={[
            "Tell you what personal information we hold about you, and give you a copy of it.",
            "Correct information that is wrong or out of date.",
            "Delete information we no longer need to keep — for example, to remove a review you have published.",
            "Stop sending you marketing messages, at any time.",
            "Withdraw a consent you previously gave, without affecting anything already done on the basis of it.",
          ]}
        />
        <p>
          Write to{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>{" "}
          with your request and enough detail for us to find your records, such as your
          order number. We respond within {RESPONSE_TIMES.enquiry} and complete verified
          requests as quickly as we reasonably can. We may need to keep certain order and
          payment records even after a deletion request, where the law requires it.
        </p>
        <p>
          If you are unhappy with how we have handled your information, you can raise it
          through our <PolicyLink href="/complaints">Complaint Handling</PolicyLink>{" "}
          process.
        </p>
      </Section>

      <Section n={10} title="Children">
        <p>
          This website is not directed at children, and we do not knowingly collect
          personal information from anyone under 18. If you believe a child has given us
          their information, contact us and we will delete it.
        </p>
      </Section>

      <Section n={11} title="Links to other websites">
        <p>
          Our pages may link to other websites, including our payment partner and our
          social media profiles. Those websites have their own privacy policies, and we
          are not responsible for how they handle your information. Please read their
          policies before providing them with your details.
        </p>
      </Section>

      <Section n={12} title="Changes to this policy">
        <p>
          We may update this policy to reflect changes in our practices or in the law.
          The date at the top of this page shows when it was last revised. Where a change
          materially affects how we use information you have already given us, we will
          take reasonable steps to tell you.
        </p>
      </Section>

      <Section n={13} title="Contact us about privacy">
        <p>
          Email{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>
          , call {BUSINESS.phone} during {BUSINESS.hours}, or write to us at{" "}
          {BUSINESS.address}. More ways to reach us are on our{" "}
          <PolicyLink href="/contact">Contact Us</PolicyLink> page.
        </p>
      </Section>
    </LegalPage>
  );
}
