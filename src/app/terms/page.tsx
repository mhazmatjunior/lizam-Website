import type { Metadata } from "next";
import LegalPage, { Section, Bullets, Callout, PolicyLink, SubHeading } from "@/app/components/LegalPage";
import { BUSINESS, ORDER_POLICY, RESPONSE_TIMES, isPlaceholder } from "@/data/legal";

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
            not accept them, please do not use this website or place an order.
          </p>
        </>
      }
    >
      <Section n={1} title="Who we are">
        <p>
          {BUSINESS.brandName}, also referred to as {BUSINESS.legalName}, is a fragrance
          brand operating in {BUSINESS.country} and selling perfumes and related fragrance
          products directly to customers through this website.
        </p>
        <p>
          Throughout these terms, &ldquo;{BUSINESS.brandName}&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to {BUSINESS.brandName} /{" "}
          {BUSINESS.legalName}. &ldquo;You&rdquo;, &ldquo;your&rdquo; and
          &ldquo;customer&rdquo; refer to any person who uses this website or buys from us.
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
            // A placeholder telephone or address is omitted rather than printed:
            // publishing a number nobody owns is worse than publishing none.
            ...(isPlaceholder(BUSINESS.phone)
              ? []
              : [
                  <>
                    Telephone: <span className="text-white/90">{BUSINESS.phone}</span>
                  </>,
                ]),
            ...(isPlaceholder(BUSINESS.address)
              ? []
              : [
                  <>
                    Address: <span className="text-white/90">{BUSINESS.address}</span>
                  </>,
                ]),
          ]}
        />
        <p>
          Full contact details and support hours are on our{" "}
          <PolicyLink href="/contact">Contact Us</PolicyLink> page.
        </p>
      </Section>

      <Section n={2} title="Eligibility to order">
        <p>To place an order through this website you must:</p>
        <Bullets
          items={[
            "Be at least 18 years of age, or have the consent and supervision of a parent or legal guardian.",
            "Have the legal capacity to enter into a binding agreement.",
            "Provide accurate, complete and current information when placing the order, including a deliverable address and a phone number on which we can reach you.",
            "Use this website only for lawful purposes.",
          ]}
        />
        <p>
          By placing an order you confirm that the information you have given us is
          accurate and complete. Orders that cannot be verified, or that we reasonably
          believe to be fraudulent or placed for onward commercial resale without our
          agreement, may be declined.
        </p>
      </Section>

      <Section n={3} title="Our products">
        <p>
          We sell perfumes and related fragrance products. We make reasonable efforts to
          ensure that the descriptions, images, sizes, colours, packaging and fragrance
          information shown on this website are accurate, but slight variations may occur
          because of:
        </p>
        <Bullets
          items={[
            "Screen and device settings.",
            "Photography and lighting conditions.",
            "Manufacturing or packaging variations.",
            "The availability of a particular packaging component.",
          ]}
        />
        <p>
          Such minor variations do not by themselves make a product defective. Where a
          variation goes further than this &mdash; a damaged, leaking, incomplete or
          incorrect item &mdash; it is covered by our{" "}
          <PolicyLink href="/shipping-returns">Shipping, Returns &amp; Refunds</PolicyLink>{" "}
          policy.
        </p>
        <p>Please also note:</p>
        <Bullets
          items={[
            "Fragrance is subjective and personal. How a scent develops, and how long it lasts, differs from person to person depending on skin chemistry, climate and how the product is applied. Longevity figures we quote are indicative of typical wear, not a guarantee for every wearer.",
            "Our products are cosmetic and intended for external use on skin or clothing only. They are not medicines and make no therapeutic claim.",
            "Batches are produced in limited quantities. A product shown on the website may sell out before your order is confirmed.",
          ]}
        />
      </Section>

      <Section n={4} title="Fragrance safety">
        <p>
          Perfumes and fragrance products are intended for external use only. When using
          our products, please:
        </p>
        <Bullets
          items={[
            "Avoid contact with the eyes.",
            "Avoid applying perfume to irritated, damaged or sensitive skin.",
            "Keep fragrance products away from children and pets.",
            "Keep products away from excessive heat, naked flames and direct sunlight — fragrance is flammable.",
            "Stop using the product if irritation or an adverse reaction occurs, and seek medical advice.",
          ]}
        />
        <Callout title="Patch-test before general use">
          If you have known allergies or sensitive skin, please review the product
          information and patch-test on a small area of skin before using a fragrance
          regularly. To the extent permitted by law, {BUSINESS.brandName} is not
          responsible for adverse reactions caused by misuse, improper storage, or a
          failure to follow these precautions.
        </Callout>
      </Section>

      <Section n={5} title="Prices and taxes">
        <Bullets
          items={[
            "All prices are shown in Pakistani Rupees (PKR) and include any applicable taxes unless stated otherwise at checkout.",
            <>
              Delivery charges, Cash on Delivery charges and any other applicable charges
              are shown separately before you confirm your order and depend on the method
              you choose. The current charges are listed in our{" "}
              <PolicyLink href="/shipping-returns">
                Shipping, Returns &amp; Refunds
              </PolicyLink>{" "}
              policy.
            </>,
            "We may change prices, promotions and delivery charges at any time and without prior notice. The price that applies to your order is the price displayed in your order summary at the moment you confirm it.",
            "If a price is displayed incorrectly because of an obvious error, we will contact you before dispatch and you may either confirm the order at the correct price or cancel it for a full refund.",
          ]}
        />
      </Section>

      <Section n={6} title="Placing and confirming an order">
        <p>
          Adding an item to your bag and submitting the checkout form is a request to buy,
          not a concluded contract. An order may be verified before it is accepted and
          dispatched. A contract between you and {BUSINESS.brandName} comes into effect
          only when we confirm your order &mdash; that is, once payment is received or
          verified (or, for Cash on Delivery, once the advance delivery charge is
          received) and we have sent you an order confirmation.
        </p>
        <p>We may contact you, using the details you gave us, to confirm:</p>
        <Bullets
          items={[
            "Your order details.",
            "Your delivery address.",
            "Your contact number.",
            "Your payment information, where applicable.",
            "Product availability.",
          ]}
        />
        <p>
          An order confirmation does not guarantee dispatch. We may still decline or
          cancel an order before it leaves us if the item turns out to be unavailable, if
          payment cannot be verified, if the delivery address falls outside the area your
          chosen method covers, if there was a pricing or description error, or if we
          suspect fraudulent or abusive use. Where we cancel an order you have already
          paid for, we refund you in full.
        </p>
      </Section>

      <Section n={7} title="Payment">
        <p>
          We may offer Cash on Delivery, bank transfer, the online payment methods made
          available on this website, and other methods we introduce from time to time.
          Which options are open to you can vary with your location, the product, the
          order value and other circumstances &mdash; the methods you can actually use are
          the ones shown in your checkout.
        </p>

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
      </Section>

      <Section n={8} title="Payment security">
        <p>
          We take reasonable measures to protect your payment and transaction information.
          Where a payment is processed by a third-party provider, your payment details are
          handled directly by that provider under its own terms and privacy policy, and we
          receive only confirmation of the result.
        </p>
        <Callout title="Never share your PIN or OTP">
          {BUSINESS.brandName} does not request or store sensitive payment credentials
          such as card PINs, CVV codes, wallet PINs, online banking passwords or one-time
          passwords (OTPs). We will never ask you for these by phone, email or message,
          and we will never ask you to send money to a personal account other than the
          account details shown at checkout. If anyone claiming to represent us asks for
          them, do not share them, and report it to us at{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>
          .
        </Callout>
      </Section>

      <Section n={9} title="Delivery">
        <p>
          We deliver across {BUSINESS.country}. Orders are normally dispatched within{" "}
          {ORDER_POLICY.dispatch} of confirmation, with courier transit of{" "}
          {ORDER_POLICY.deliveryMajorCities} to major cities and{" "}
          {ORDER_POLICY.deliveryRemote} to smaller towns and remote areas. These are
          estimated delivery periods rather than guaranteed dates, because the final leg
          is carried out by third-party couriers.
        </p>
        <p>
          Risk in the goods passes to you on delivery. Full details of charges, tracking,
          failed deliveries, re-delivery and delays are set out in our{" "}
          <PolicyLink href="/shipping-returns">Shipping, Returns &amp; Refunds</PolicyLink>{" "}
          policy.
        </p>
      </Section>

      <Section n={10} title="Cancellation, returns and refunds">
        <p>
          You may cancel an order within {ORDER_POLICY.cancellation} of placing it, or at
          any time before it is dispatched, for a full refund. Damaged, incorrect, missing
          or faulty items must be reported within {ORDER_POLICY.claimWindow} of delivery,
          and unopened orders may be returned within {ORDER_POLICY.returnWindow} of
          delivery.
        </p>
        <p>
          For hygiene and safety reasons, perfume that has been opened, sprayed, used or
          had its seal broken cannot be returned or exchanged unless it is faulty, damaged
          or not the item you ordered. The complete rules, including how to make a request
          and how refunds are paid, are in our{" "}
          <PolicyLink href="/shipping-returns">Shipping, Returns &amp; Refunds</PolicyLink>{" "}
          policy, which forms part of these terms.
        </p>
      </Section>

      <Section n={11} title="Reviews and content you submit">
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

      <Section n={12} title="Intellectual property">
        <p>
          All content on this website &mdash; including the {BUSINESS.brandName} name and
          logo, brand names, product names, product images and descriptions, graphics,
          designs, text, videos, layout and code &mdash; is owned by or licensed to us
          unless otherwise stated. You may view and share pages for personal,
          non-commercial purposes. You may not reproduce, copy, modify, distribute,
          republish, sell or otherwise commercially exploit any part of the site or its
          content, or use our branding on any product or listing, without our prior
          written permission.
        </p>
      </Section>

      <Section n={13} title="Acceptable use of this website">
        <p>You agree not to:</p>
        <Bullets
          items={[
            "Use the website for any unlawful purpose, or in a way that could damage, disable or impair it.",
            "Attempt to gain unauthorised access to any part of the website, its administrative area, its accounts or its servers.",
            "Interfere with the website's security or functionality, or with another customer's use of it.",
            "Introduce malicious software or harmful code, or use automated systems to scrape, harvest from, misuse or overload the website.",
            "Submit false or misleading information, including false orders, false payment receipts or false reviews.",
            "Impersonate another person.",
            "Use our content or brand identity without authorisation.",
          ]}
        />
        <p>
          We may restrict, suspend or terminate access to the website where misuse or
          prohibited activity is identified, and report unlawful activity to the relevant
          authorities.
        </p>
      </Section>

      <Section n={14} title="Product responsibility and our liability">
        <p>
          You are responsible for using and storing fragrance products in line with the
          product instructions and the safety precautions in clause 4.
        </p>
        <p>
          We are responsible for supplying products that match their description and are
          of satisfactory quality. Where we fail to do so, we will put the position right
          by replacing the item or refunding you in line with our returns policy.
        </p>
        <p>
          To the fullest extent permitted by law, we are not liable for losses, damages,
          allergic reactions or other consequences resulting from:
        </p>
        <Bullets
          items={[
            "Misuse of a product.",
            "Improper storage.",
            "Failure to follow the product instructions or the guidance in clause 4.",
            "Use of a product contrary to its intended purpose.",
            "Incorrect information supplied by the customer.",
          ]}
        />
        <p>
          We are likewise not liable for indirect or consequential loss, loss of profit or
          opportunity, or for delays caused by third-party couriers or payment providers.
          Our total liability in connection with any order will not exceed the amount you
          paid for that order.
        </p>
        <p>
          Nothing in these terms excludes or limits any liability that cannot lawfully be
          excluded or limited, including liability for death or personal injury caused by
          our negligence, or for fraud. Nothing here affects your statutory rights as a
          consumer.
        </p>
      </Section>

      <Section n={15} title="Third-party services">
        <p>This website relies on third-party services for purposes including:</p>
        <Bullets
          items={[
            "Payment processing.",
            "Shipping and delivery.",
            "Website hosting.",
            "Analytics.",
            "Customer communication.",
            "Website functionality.",
          ]}
        />
        <p>
          These third parties process information according to their own terms and privacy
          policies. We choose our partners carefully, but we are not responsible for their
          independent practices, policies or systems beyond what the law requires. The
          parties involved, and the data each one receives, are listed in our{" "}
          <PolicyLink href="/privacy">Privacy Policy</PolicyLink>.
        </p>
      </Section>

      <Section n={16} title="Events outside our reasonable control">
        <p>
          We are not liable for any failure or delay in performing our obligations where
          that failure results from circumstances beyond our reasonable control, including:
        </p>
        <Bullets
          items={[
            "Natural disasters, floods, earthquakes or severe weather.",
            "Government restrictions, including restrictions on movement.",
            "Strikes or industrial disputes.",
            "Transportation, courier or logistics disruption.",
            "Internet, telecommunications or power failure.",
            "Security incidents.",
            "Epidemics or other public emergencies.",
          ]}
        />
        <p>
          Where such an event materially affects your order we will contact you as soon as
          we reasonably can, and you may either wait for delivery or cancel for a full
          refund.
        </p>
      </Section>

      <Section n={17} title="Complaints">
        <p>
          If something has gone wrong, we want to put it right. We acknowledge every
          complaint within {RESPONSE_TIMES.acknowledgement} and aim to resolve it within{" "}
          {RESPONSE_TIMES.resolution}. Our full process, including how to escalate a
          complaint, is set out on our{" "}
          <PolicyLink href="/complaints">Complaint Handling</PolicyLink> page.
        </p>
      </Section>

      <Section n={18} title="Changes to these terms">
        <p>
          We may update or modify these terms from time to time to reflect changes in our
          products, our operations or the law. The updated version is published on this
          page with a revised &ldquo;Last updated&rdquo; date, and your continued use of
          the website after that constitutes acceptance of it, to the extent permitted by
          law. The version published when you place an order is the version that applies
          to that order.
        </p>
      </Section>

      <Section n={19} title="Governing law and jurisdiction">
        <p>
          These terms, and any dispute arising out of them or out of an order placed
          through this website, are governed by and interpreted in accordance with the
          applicable laws of the Islamic Republic of {BUSINESS.country}. Any such dispute
          is subject to the jurisdiction of the appropriate courts in {BUSINESS.country},
          subject to applicable law. Nothing here affects your statutory rights as a
          consumer.
        </p>
      </Section>

      <Section n={20} title="How to reach us">
        <p>
          Questions about these terms, or about an order, should go to{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>
          {isPlaceholder(BUSINESS.phone) ? "" : ` or ${BUSINESS.phone}`}. We answer
          enquiries within {RESPONSE_TIMES.enquiry} during {BUSINESS.hours}. More ways to
          contact us are on our <PolicyLink href="/contact">Contact Us</PolicyLink> page.
        </p>
      </Section>
    </LegalPage>
  );
}
