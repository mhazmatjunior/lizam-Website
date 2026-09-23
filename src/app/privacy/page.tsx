import type { Metadata } from "next";
import LegalPage, { Section, Bullets, Callout, PolicyLink, SubHeading } from "@/app/components/LegalPage";
import { BUSINESS, DATA_PROCESSORS, RESPONSE_TIMES, isPlaceholder } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | RAANAE",
  description:
    "What information RAANAE collects when you use this website, place an order or contact us, how we use and share it, how long we keep it, and the choices available to you.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={
        <>
          <p>
            At {BUSINESS.brandName} / {BUSINESS.legalName}, we respect your privacy and we
            are committed to protecting the personal information you provide when using
            our website, placing orders, or communicating with us.
          </p>
          <p>
            This policy explains what information we may collect, how we use it, how it may
            be shared, and the choices available to you. We collect only what is reasonably
            necessary to take your order, deliver it, answer your questions and meet our
            legal obligations, and we do not sell your personal information to anyone.
          </p>
        </>
      }
    >
      <Section n={1} title="Information we collect">
        <p>
          Depending on how you interact with our website, we may collect your full name,
          phone number, email address, billing and delivery address, order details, product
          preferences and purchase history, payment-related information, customer service
          communications, website usage information, device and browser information, and
          your IP address and general technical information.
        </p>

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

        <p>
          We only seek to collect information that is reasonably necessary for operating
          our website, processing orders, providing services, and communicating with
          customers.
        </p>
      </Section>

      <Section n={2} title="How we use your information">
        <p>We may use your information to:</p>
        <Bullets
          items={[
            "Process and fulfil orders, confirm them, arrange delivery, and keep you informed about the progress of your order.",
            "Respond to customer enquiries and complaints.",
            "Process payments and refunds, and prevent fraud, duplicate transactions and misuse.",
            "Publish product reviews you have chosen to submit, after moderation.",
            "Improve our products and website, and analyse website performance.",
            "Maintain website security.",
            "Keep records of sales and payments, as required for accounting, tax and regulatory purposes.",
            "Send marketing communications where permitted and appropriate, and only where you have asked to receive them.",
            "Comply with applicable legal requirements.",
          ]}
        />
        <p>
          We rely on the performance of our contract with you for order-related
          processing, on our legitimate interest in running a secure and honest shop for
          fraud prevention and site security, on your consent for marketing and for
          publishing your review, and on our legal obligations for record keeping.
        </p>
      </Section>

      <Section n={3} title="Order and payment information">
        <p>
          When you place an order, we collect the information necessary to process and
          fulfil that order. This may include your name, contact number, delivery address,
          order details and payment-related information.
        </p>
        <p>
          Where payment is processed by a third-party payment provider, that provider may
          collect and process payment information according to its own privacy policy and
          terms.
        </p>
        <Callout title="What we never collect">
          {BUSINESS.brandName} does not store sensitive payment credentials — your full
          card number, card expiry, CVV, card PIN, wallet PIN or online banking password.
          When you pay online, those details are entered directly on the secure page of our
          payment partner, Safepay, and stay with them. We are told only whether the
          payment succeeded, along with a reference for the transaction.
        </Callout>
      </Section>

      <Section n={4} title="Delivery information">
        <p>
          We share the information necessary with courier and logistics providers so that
          orders can be delivered. This may include your name, phone number, delivery
          address, and order or shipment information.
        </p>
        <p>
          Such information is shared only to the extent reasonably necessary to provide
          delivery services.
        </p>
      </Section>

      <Section n={5} title="Cookies and website analytics">
        <p>
          Our website may use cookies, browser storage and similar technologies to improve
          how the website works and to understand how visitors use it — to remember certain
          preferences, keep website features functioning, understand website traffic,
          improve performance and analyse customer interactions.
        </p>
        <p>
          We use your browser&apos;s local storage to remember your shopping bag, and a
          secure session cookie is set when a member of our team signs in to the
          administrative area.
        </p>
        <SubHeading>Advertising and measurement</SubHeading>
        <p>
          We use the Meta Pixel, a measurement tool provided by Meta Platforms (Facebook
          and Instagram). It sets cookies in your browser and tells Meta which of our
          pages you viewed and which actions you took, such as adding an item to your bag
          or completing an order. We use it to measure how well our advertising works and
          to show our adverts to people likely to be interested in our fragrances.
        </p>
        <p>
          This means Meta receives information about your visit to this website and may
          combine it with information it already holds about you, including for
          advertising purposes. Meta processes that information as an independent
          controller under its own{" "}
          <a
            href="https://www.facebook.com/privacy/policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline underline-offset-4"
          >
            Privacy Policy
          </a>
          . You can limit this through your Meta account&apos;s advert settings, through
          your browser&apos;s cookie controls, or by using a tracker-blocking extension.
        </p>
        <p>
          You may control or disable cookies through your browser settings. Disabling
          certain cookies may affect website functionality: the site will still work, but
          your shopping bag will not be remembered between visits.
        </p>
      </Section>

      <Section n={6} title="Third-party service providers">
        <p>
          We use trusted third-party providers for payment processing, courier and delivery
          services, website hosting, website analytics, marketing and communication
          services, and technical support. These providers may process information on our
          behalf or independently according to their own terms and privacy policies. They
          receive only what they need, and only for the purposes described below.
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
          Our website and database are hosted on servers operated by our hosting and
          database providers, which may be located outside {BUSINESS.country}. Where your
          information is transferred abroad, we take reasonable steps to ensure it remains
          protected to the standard described in this policy and is held only by providers
          bound to keep it confidential and secure.
        </p>
        <p>
          Our pages may also link to other websites, including our payment partner and our
          social media profiles. Those websites have their own privacy policies, and we are
          not responsible for how they handle your information.
        </p>
        <p>
          We may disclose information where we are required to do so by law, by a court
          order, or by a regulator or law-enforcement authority, and where necessary to
          establish or defend legal claims. If our business is ever transferred to another
          owner, customer records may transfer with it, subject to this policy.
        </p>
        <p className="text-white/90">
          We do not sell, rent or trade your personal information, and we do not share it
          with advertisers.
        </p>
      </Section>

      <Section n={7} title="Data security">
        <p>
          {BUSINESS.brandName} takes reasonable administrative, technical and
          organisational measures to protect personal information against unauthorised
          access, loss, misuse, alteration or disclosure.
        </p>
        <Bullets
          items={[
            "The website is served over an encrypted HTTPS connection.",
            "Payment receipts and review photographs are held in private storage that is not publicly browsable, and are opened only through short-lived, signed links.",
            "The administrative area is protected by password authentication and is restricted to authorised staff.",
            "Access to customer records is limited to the people who need it to fulfil orders and answer enquiries.",
          ]}
        />
        <p>
          However, no method of transmitting or storing information electronically can be
          guaranteed to be completely secure. If a breach ever affects your information in
          a way likely to cause you harm, we will tell you and the relevant authority
          without undue delay.
        </p>
      </Section>

      <Section n={8} title="Data retention">
        <p>
          We retain personal information only for as long as reasonably necessary for the
          purposes described in this policy, including order fulfilment, customer support,
          accounting, legal, security and dispute-resolution purposes.
        </p>
        <Bullets
          items={[
            "Order records, including payment references and delivery details, are kept for as long as needed to serve you and then for the period required by tax and accounting rules.",
            "Payment receipts you upload are kept only as long as needed to verify the payment and to deal with any later dispute about it.",
            "Published reviews and their photographs are kept until you ask us to remove them.",
            "Enquiry and complaint correspondence is kept as a record of what happened and how it was resolved.",
            "Marketing contact details are removed promptly once you opt out.",
          ]}
        />
        <p>
          When information is no longer reasonably required, we may delete, anonymise or
          securely dispose of it, subject to applicable legal or operational requirements.
        </p>
      </Section>

      <Section n={9} title="Your privacy rights">
        <p>
          Depending on applicable law, you may have rights regarding your personal
          information, including the right to:
        </p>
        <Bullets
          items={[
            "Request access to the personal information we hold about you, and a copy of it.",
            "Request correction of information that is inaccurate or out of date.",
            "Request deletion where legally applicable — for example, to remove a review you have published.",
            "Withdraw consent where processing is based on consent, without affecting anything already done on the basis of it.",
            "Object to certain uses of your information, including marketing, at any time.",
            "Request information about how your data is used.",
          ]}
        />
        <p>
          Requests can be submitted using the contact details below. Please include enough
          detail for us to find your records, such as your order number. We aim to respond
          to privacy-related enquiries within {RESPONSE_TIMES.enquiry}, and we may need to
          verify your identity before processing certain requests. We may also need to keep
          certain order and payment records even after a deletion request, where the law
          requires it.
        </p>
        <p>
          If you are unhappy with how we have handled your information, you can raise it
          through our <PolicyLink href="/complaints">Complaint Handling</PolicyLink>{" "}
          process.
        </p>
      </Section>

      <Section n={10} title="Marketing communications">
        <p>
          Where permitted, {BUSINESS.brandName} may send customers promotional
          communications about new fragrances, product launches, special offers, discounts,
          promotions and brand updates.
        </p>
        <p>
          You may ask us to stop sending marketing communications at any time, by
          contacting us or by using the unsubscribe option in the message. Even after you
          opt out of marketing, we will still send the essential transactional messages
          relating to your orders or customer service requests.
        </p>
      </Section>

      <Section n={11} title="Children’s privacy">
        <p>
          Our website is not intended to be used independently by children, and we do not
          knowingly collect personal information from children for marketing purposes.
        </p>
        <p>
          If you believe that a child has provided personal information to us without
          appropriate parental or guardian involvement, please contact us so that we can
          review the matter and take appropriate action.
        </p>
      </Section>

      <Section n={12} title="Changes to this policy">
        <p>
          {BUSINESS.brandName} may update this Privacy Policy from time to time. Any
          changes will be posted on this page together with an updated &ldquo;Last
          updated&rdquo; date.
        </p>
        <p>
          We encourage customers to review this page periodically to remain informed about
          how we handle personal information. Where a change materially affects how we use
          information you have already given us, we will take reasonable steps to tell you.
        </p>
      </Section>

      <Section n={13} title="Contact us">
        <p>
          If you have questions, concerns or requests regarding this policy, contact{" "}
          {BUSINESS.legalName} by email at{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>
          {isPlaceholder(BUSINESS.phone) ? "" : `, by phone on ${BUSINESS.phone}`}
          {isPlaceholder(BUSINESS.address) ? "" : `, or by post at ${BUSINESS.address}`}.
        </p>
        <p>
          Customer support hours are {BUSINESS.hours}. We aim to respond to
          privacy-related enquiries within {RESPONSE_TIMES.enquiry}. More ways to reach us
          are on our <PolicyLink href="/contact">Contact Us</PolicyLink> page.
        </p>
      </Section>
    </LegalPage>
  );
}
