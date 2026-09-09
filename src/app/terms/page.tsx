import type { Metadata } from "next";
import LegalPage, { Section, Bullets, Callout, PolicyLink, SubHeading } from "@/app/components/LegalPage";
import { BUSINESS, ORDER_POLICY, RESPONSE_TIMES } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions | RAANAE",
  description:
    "The terms on which RAANAE sells fragrances through this website, including orders, pricing, payment, delivery, returns and liability.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro={
        <>
          <p>
            These Terms &amp; Conditions govern your use of this website and every
            purchase you make from {BUSINESS.brandName} ({BUSINESS.legalName}). Please
            read them before placing an order.
          </p>
          <p>
            By browsing this website, creating an order or completing a payment, you
            confirm that you have read, understood and accepted these terms. If you do
            not accept them, please do not use this website.
          </p>
        </>
      }
    >
      <Section n={1} title="Who we are">
        <p>
          {BUSINESS.brandName} is a fragrance brand operating in {BUSINESS.country} and
          selling directly to customers through this website.
        </p>
        <Bullets
          items={[
            <>
              Trading name: <strong className="text-white/90">{BUSINESS.brandName}</strong>
            </>,
            <>
              Registered name:{" "}
              <strong className="text-white/90">{BUSINESS.legalName}</strong>
            </>,
            <>
              Email:{" "}
              <a
                href={`mailto:${BUSINESS.email}`}
                className="text-gold hover:underline underline-offset-4"
              >
                {BUSINESS.email}
              </a>
            </>,
            <>
              Telephone: <span className="text-white/90">{BUSINESS.phone}</span>
            </>,
            <>
              Address: <span className="text-white/90">{BUSINESS.address}</span>
            </>,
          ]}
        />
        <p>
          Full contact details and support hours are on our{" "}
          <PolicyLink href="/contact">Contact Us</PolicyLink> page.
        </p>
      </Section>

      <Section n={2} title="Eligibility to order">
        <p>
          You may place an order only if you are at least 18 years of age, or have the
          consent of a parent or guardian, and are legally capable of entering into a
          binding contract. You must provide accurate, complete and current information
          at checkout, including a deliverable address and a phone number on which we can
          reach you.
        </p>
        <p>
          Orders that cannot be verified, or that we reasonably believe to be fraudulent
          or placed for onward commercial resale without our agreement, may be declined.
        </p>
      </Section>

      <Section n={3} title="Our products">
        <p>
          We sell perfumes and related fragrance products. We describe every product as
          accurately as we can, but please note:
        </p>
        <Bullets
          items={[
            "Photographs are taken under studio lighting. Packaging, labels and the colour of the liquid may vary slightly from what appears on your screen.",
            "Fragrance is subjective and personal. How a scent develops, and how long it lasts, differs from person to person depending on skin chemistry, climate and how the product is applied. Longevity figures we quote are indicative of typical wear, not a guarantee for every wearer.",
            "Our products are cosmetic and intended for external use on skin or clothing only. They are not medicines and make no therapeutic claim.",
            "Batches are produced in limited quantities. A product shown on the website may sell out before your order is confirmed.",
          ]}
        />
        <Callout title="Skin sensitivity">
          Fragrance can cause irritation or an allergic reaction in some people. Please
          patch-test on a small area of skin before general use, keep the product away
          from the eyes, and stop using it and seek medical advice if irritation develops.
          Do not use on broken or damaged skin. Keep out of reach of children and away
          from heat and direct sunlight — the product is flammable.
        </Callout>
      </Section>

      <Section n={4} title="Prices and currency">
        <Bullets
          items={[
            "All prices are shown in Pakistani Rupees (PKR) and include any applicable taxes unless stated otherwise at checkout.",
            <>
              Delivery charges are shown separately before you confirm your order and
              depend on the delivery method you choose. The current charges are listed in
              our <PolicyLink href="/shipping-returns">Shipping, Returns &amp; Refunds</PolicyLink>{" "}
              policy.
            </>,
            "We may change prices, promotions and delivery charges at any time. The price that applies to your order is the price displayed in your order summary at the moment you confirm it.",
            "If a price is displayed incorrectly because of an obvious error, we will contact you before dispatch and you may either confirm the order at the correct price or cancel it for a full refund.",
          ]}
        />
      </Section>

      <Section n={5} title="How an order is formed">
        <p>
          Adding an item to your bag and submitting the checkout form is an offer to buy,
          not a concluded contract. A contract between you and {BUSINESS.brandName} comes
          into effect only when we confirm your order — that is, once payment is received
          or verified (or, for Cash on Delivery, once the advance delivery charge is
          received) and we have sent you an order confirmation.
        </p>
        <p>
          We may decline or cancel an order before dispatch if the item is out of stock,
          if payment cannot be verified, if the delivery address falls outside the area
          your chosen method covers, if there was a pricing or description error, or if we
          suspect fraudulent or abusive use. Where we cancel an order you have already
          paid for, we refund you in full.
        </p>
      </Section>

      <Section n={6} title="Payment">
        <p>We accept the following payment methods at checkout.</p>

        <SubHeading>Online card and wallet payment</SubHeading>
        <p>
          Processed by our payment partner, Safepay. You enter your card or wallet details
          on Safepay&apos;s own secure page. {BUSINESS.brandName} never sees or stores your
          card number, CVV or wallet PIN.
        </p>

        <SubHeading>Manual bank transfer or mobile wallet</SubHeading>
        <p>
          You transfer the amount to the account details shown at checkout and upload your
          receipt. We verify the receipt within {ORDER_POLICY.paymentVerification} and
          confirm your order once the funds are matched. Please transfer the exact amount
          shown, and keep your original transaction record until your order arrives.
        </p>

        <SubHeading>Cash on Delivery</SubHeading>
        <p>
          The delivery charge is paid in advance to confirm the order, and the product
          amount is paid in cash to the courier at your door. Please have the exact amount
          ready. The advance delivery charge covers the cost of sending the parcel and is
          not refundable once the parcel has been dispatched.
        </p>

        <SubHeading>Hand delivery by the founder</SubHeading>
        <p>
          Available in selected cities for a fixed charge per city tier, arranged with you
          in advance. See our{" "}
          <PolicyLink href="/shipping-returns">Shipping, Returns &amp; Refunds</PolicyLink>{" "}
          policy for the cities covered and the charges.
        </p>

        <Callout title="Never share your PIN or OTP">
          {BUSINESS.brandName} will never ask you for your card PIN, CVV, wallet PIN or a
          one-time password (OTP) by phone, email or message. If anyone claiming to
          represent us asks for these, do not share them, and report it to us at{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>
          .
        </Callout>
      </Section>

      <Section n={7} title="Delivery">
        <p>
          We deliver across {BUSINESS.country}. Orders are normally dispatched within{" "}
          {ORDER_POLICY.dispatch} of confirmation, with courier transit of{" "}
          {ORDER_POLICY.deliveryMajorCities} to major cities and{" "}
          {ORDER_POLICY.deliveryRemote} to smaller towns and remote areas. Delivery
          timelines are estimates rather than guarantees, because the final leg is carried
          out by third-party couriers.
        </p>
        <p>
          Risk in the goods passes to you on delivery. Full details of charges, tracking,
          failed deliveries and delays are set out in our{" "}
          <PolicyLink href="/shipping-returns">Shipping, Returns &amp; Refunds</PolicyLink>{" "}
          policy.
        </p>
      </Section>

      <Section n={8} title="Cancellation, returns and refunds">
        <p>
          You may cancel an order within {ORDER_POLICY.cancellation} of placing it, or at
          any time before it is dispatched, for a full refund. Damaged, incorrect or
          faulty items must be reported within {ORDER_POLICY.claimWindow} of delivery, and
          unopened orders may be returned within {ORDER_POLICY.returnWindow} of delivery.
        </p>
        <p>
          For hygiene and safety reasons, perfume that has been opened, used or had its
          seal broken cannot be returned or exchanged unless it is faulty, damaged or not
          the item you ordered. The complete rules, including how to make a request and
          how refunds are paid, are in our{" "}
          <PolicyLink href="/shipping-returns">Shipping, Returns &amp; Refunds</PolicyLink>{" "}
          policy, which forms part of these terms.
        </p>
      </Section>

      <Section n={9} title="Reviews and content you submit">
        <p>
          If you submit a review, rating, photograph or other content to this website, you
          confirm that it is your own honest experience, that you own or are permitted to
          share any images you upload, and that the content does not infringe anyone
          else&apos;s rights.
        </p>
        <Bullets
          items={[
            "You grant us a non-exclusive, royalty-free licence to display, reproduce and adapt your submitted content on this website and in our marketing.",
            "We may decline to publish, edit for length, or remove content that is unlawful, abusive, misleading, promotional, or unrelated to the product.",
            "Submitted content is reviewed before publication, and uploaded photographs are stored privately until approved.",
            "Please do not include personal information you would not want published, such as your phone number or address.",
          ]}
        />
      </Section>

      <Section n={10} title="Intellectual property">
        <p>
          The {BUSINESS.brandName} name and logo, product names, photographs, artwork,
          text, layout and code on this website are owned by us or licensed to us. You may
          view and share pages for personal, non-commercial purposes. You may not copy,
          reproduce, republish, sell or use any part of the site or its content for
          commercial purposes, or use our branding on any product or listing, without our
          prior written permission.
        </p>
      </Section>

      <Section n={11} title="Acceptable use of this website">
        <p>You agree not to:</p>
        <Bullets
          items={[
            "Use the website for any unlawful purpose, or in a way that could damage, disable or impair it.",
            "Attempt to gain unauthorised access to any part of the website, its administrative area, its accounts or its servers.",
            "Introduce malicious code, or use automated systems to scrape, harvest from or overload the website.",
            "Submit false orders, false payment receipts or false reviews.",
            "Interfere with another customer's use of the website.",
          ]}
        />
        <p>
          We may suspend or refuse service to anyone who breaches this clause, and report
          unlawful activity to the relevant authorities.
        </p>
      </Section>

      <Section n={12} title="Our liability">
        <p>
          We are responsible for supplying products that match their description and are
          of satisfactory quality. Where we fail to do so, we will put the position right
          by replacing the item or refunding you in line with our returns policy.
        </p>
        <p>
          To the fullest extent permitted by law, we are not liable for indirect or
          consequential loss, loss of profit or opportunity, delays caused by third-party
          couriers or payment providers, or an allergic or skin reaction where the product
          was used contrary to the guidance in clause 3. Nothing in these terms excludes
          or limits any liability that cannot lawfully be excluded, including liability for
          death or personal injury caused by our negligence, or for fraud.
        </p>
        <p>
          Our total liability in connection with any order will not exceed the amount you
          paid for that order.
        </p>
      </Section>

      <Section n={13} title="Third-party services">
        <p>
          This website relies on third parties to take payments, host data and deliver
          parcels. Their own terms and privacy practices apply to the services they
          provide. We choose our partners carefully, but we are not responsible for their
          acts or omissions beyond what the law requires. The parties involved, and the
          data each one receives, are listed in our{" "}
          <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
        </p>
      </Section>

      <Section n={14} title="Events outside our control">
        <p>
          We are not liable for any failure or delay in performing our obligations where
          that failure is caused by events outside our reasonable control, including
          strikes, courier or postal disruption, network or power failure, restrictions on
          movement, natural disaster, or the acts of any government or authority. Where
          such an event affects your order we will contact you, and you may either wait
          for delivery or cancel for a full refund.
        </p>
      </Section>

      <Section n={15} title="Complaints">
        <p>
          If something has gone wrong, we want to put it right. We acknowledge every
          complaint within {RESPONSE_TIMES.acknowledgement} and aim to resolve it within{" "}
          {RESPONSE_TIMES.resolution}. Our full process, including how to escalate a
          complaint, is set out on our{" "}
          <PolicyLink href="/complaints">Complaint Handling</PolicyLink> page.
        </p>
      </Section>

      <Section n={16} title="Changes to these terms">
        <p>
          We may update these terms from time to time to reflect changes in our products,
          our operations or the law. The version published on this page when you place an
          order is the version that applies to that order. The date at the top of this
          page shows when it was last revised.
        </p>
      </Section>

      <Section n={17} title="Governing law and jurisdiction">
        <p>
          These terms, and any dispute arising out of them or out of an order placed
          through this website, are governed by the laws of {BUSINESS.country}, and the
          courts of {BUSINESS.country} have exclusive jurisdiction. Nothing here affects
          your statutory rights as a consumer.
        </p>
      </Section>

      <Section n={18} title="How to reach us">
        <p>
          Questions about these terms, or about an order, should go to{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>{" "}
          or {BUSINESS.phone}. We answer enquiries within {RESPONSE_TIMES.enquiry} during{" "}
          {BUSINESS.hours}.
        </p>
      </Section>
    </LegalPage>
  );
}
