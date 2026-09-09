import type { Metadata } from "next";
import LegalPage, { Section, Bullets, Callout, PolicyLink, SubHeading } from "@/app/components/LegalPage";
import DeliveryChargesTable from "@/app/components/DeliveryChargesTable";
import { BUSINESS, ORDER_POLICY, RESPONSE_TIMES } from "@/data/legal";
import { FOUNDER_DELIVERY_TIERS } from "@/data/founder-cities";

export const metadata: Metadata = {
  title: "Shipping, Returns & Refunds | RAANAE",
  description:
    "RAANAE's shipping, exchange, return, refund and order cancellation policies: delivery charges and timelines, how to cancel, and how refunds are paid.",
};

const FOUNDER_CITIES = FOUNDER_DELIVERY_TIERS.flatMap((tier) => tier.cities).join(", ");

export default function ShippingReturnsPage() {
  return (
    <LegalPage
      eyebrow="Orders"
      title="Shipping, Exchange, Return, Refund & Cancellation Policy"
      intro={
        <>
          <p>
            This policy explains how we deliver your order, what delivery costs, how to
            cancel, and how returns, exchanges and refunds work. It applies to every order
            placed through this website and forms part of our{" "}
            <PolicyLink href="/terms">Terms &amp; Conditions</PolicyLink>.
          </p>
          <p>
            In short: delivery is free when you pay in advance, you can cancel free of
            charge any time before dispatch, and if an order arrives damaged, incorrect or
            faulty we will replace it or refund you in full.
          </p>
        </>
      }
    >
      <Section n={1} title="Where we deliver">
        <p>
          We deliver throughout {BUSINESS.country} using established courier partners.
          Hand delivery by the founder is offered in selected cities only —{" "}
          {FOUNDER_CITIES} — and is arranged with you in advance. We do not currently
          ship outside {BUSINESS.country}.
        </p>
        <p>
          If your city is not covered by a delivery method you select at checkout, you
          will be told before your order is confirmed and can choose another method.
        </p>
      </Section>

      <Section n={2} title="Delivery charges">
        <p>
          Delivery is charged according to the method you choose, and the exact amount is
          shown in your order summary before you confirm. The current charges are:
        </p>
        <DeliveryChargesTable />
        <Callout title="Free delivery when you pay in advance">
          Pay the full amount up front — by card, mobile wallet or bank transfer — and we
          deliver anywhere in {BUSINESS.country} at no delivery cost. The delivery charge
          applies only where payment is collected at your door.
        </Callout>
      </Section>

      <Section n={3} title="Dispatch and delivery times">
        <Bullets
          items={[
            <>
              <strong className="text-white/90">Order confirmation</strong> — immediate for
              card and wallet payments. For a manual bank or wallet transfer, we verify
              your uploaded receipt within {ORDER_POLICY.paymentVerification} and confirm
              once the funds are matched.
            </>,
            <>
              <strong className="text-white/90">Dispatch</strong> —{" "}
              {ORDER_POLICY.dispatch} from confirmation. Orders confirmed on a Sunday or a
              public holiday are dispatched on the next working day.
            </>,
            <>
              <strong className="text-white/90">Transit</strong> —{" "}
              {ORDER_POLICY.deliveryMajorCities} to major cities and{" "}
              {ORDER_POLICY.deliveryRemote} to smaller towns and remote areas.
            </>,
            <>
              <strong className="text-white/90">Hand delivery by the founder</strong> — on
              a date agreed directly with you.
            </>,
          ]}
        />
        <p>
          These are estimates, not guarantees. The final leg of delivery is carried out by
          third-party couriers, and weather, strikes, public holidays and restrictions on
          movement can delay a parcel. If your order is running materially late we will
          contact you, and you may either wait or cancel it for a full refund.
        </p>
      </Section>

      <Section n={4} title="Tracking your order">
        <p>
          Once your parcel is handed to the courier we add its tracking number to your
          order, which you can see on your order confirmation page and in the dispatch
          email we send you. If you have not received a tracking number within{" "}
          {ORDER_POLICY.dispatch} of confirmation, email{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>{" "}
          with your order number and we will follow it up.
        </p>
      </Section>

      <Section n={5} title="Delivery attempts and failed deliveries">
        <Bullets
          items={[
            "Please make sure the phone number on your order is reachable — couriers call before they deliver.",
            "If nobody is available, the courier will normally attempt delivery again. After repeated failed attempts the parcel is returned to us.",
            "If a Cash on Delivery parcel is refused at the door, or delivery fails because the address or phone number was incorrect, the advance delivery charge is not refundable, as the delivery cost has already been incurred.",
            "Where a prepaid parcel is returned to us undelivered, we will contact you to arrange redelivery, or refund the product amount in full.",
            "Please check the parcel in front of the courier where you can, and refuse it if the outer packaging is visibly damaged or the seal is broken.",
          ]}
        />
      </Section>

      <Section n={6} title="Cancelling an order">
        <SubHeading>Cancellation by you</SubHeading>
        <Bullets
          items={[
            <>
              You may cancel free of charge within {ORDER_POLICY.cancellation} of placing
              your order, or at any time before it has been dispatched — whichever is
              later.
            </>,
            "To cancel, email or call us with your order number. Please do not rely on a message sent through any other channel, as we may not see it in time.",
            "Once a parcel has been handed to the courier it can no longer be cancelled. You can instead refuse it at the door, or return it under the returns section below.",
            <>
              Where you cancel in time, any amount you have paid — including the advance
              delivery charge, if the parcel has not yet been dispatched — is refunded in
              full.
            </>,
          ]}
        />

        <SubHeading>Cancellation by us</SubHeading>
        <p>We may cancel an order before dispatch if:</p>
        <Bullets
          items={[
            "The item is out of stock or the batch has sold out.",
            "Your payment could not be verified, or the receipt uploaded does not match the order amount.",
            "The delivery address falls outside the area your chosen method covers.",
            "There was an obvious pricing or description error.",
            "We reasonably suspect fraudulent or abusive use.",
          ]}
        />
        <p>
          We will tell you why, and refund anything you have paid in full. Nothing in this
          section allows us to keep money for an order we have cancelled.
        </p>
      </Section>

      <Section n={7} title="Returns">
        <SubHeading>When you can return an item</SubHeading>
        <Bullets
          items={[
            <>
              <strong className="text-white/90">
                Damaged, leaking, incorrect or incomplete
              </strong>{" "}
              — report it within {ORDER_POLICY.claimWindow} of delivery and we will replace
              the item or refund you in full, including any delivery charge you paid. Keep
              the packaging and send us photographs.
            </>,
            <>
              <strong className="text-white/90">Faulty</strong> — if a bottle, atomiser or
              cap does not work as it should, tell us within{" "}
              {ORDER_POLICY.returnWindow} of delivery and we will replace it or refund you.
            </>,
            <>
              <strong className="text-white/90">Unopened and unused</strong> — you may
              return an order within {ORDER_POLICY.returnWindow} of delivery if the product
              is still sealed, unused, and in its original box with all packaging intact.
            </>,
          ]}
        />

        <SubHeading>What cannot be returned</SubHeading>
        <Callout title="Opened fragrance cannot be returned">
          For hygiene and safety reasons, perfume that has been opened, sprayed, used or
          had its seal broken cannot be returned or exchanged — unless it is faulty,
          damaged in transit, or not the item you ordered. This is standard for cosmetic
          products and does not affect your rights where an item is defective.
        </Callout>
        <Bullets
          items={[
            "Items reported after the windows above have passed.",
            "Items returned without their original packaging, box or seal, where the return is because you changed your mind.",
            "Items damaged after delivery through misuse, storage in heat or direct sunlight, or an accident.",
            "Free gifts and promotional items, unless the paid item they came with is also returned.",
          ]}
        />

        <SubHeading>How to make a return</SubHeading>
        <Bullets
          items={[
            <>
              Contact us first, at{" "}
              <a
                href={`mailto:${BUSINESS.email}`}
                className="text-gold hover:underline underline-offset-4"
              >
                {BUSINESS.email}
              </a>{" "}
              or {BUSINESS.phone}, with your order number, what is wrong, and photographs
              where relevant. Please do not send anything back before we have confirmed the
              return, as we cannot process unannounced parcels.
            </>,
            "We will confirm whether your return is approved, and give you the return address and instructions.",
            "Pack the item securely, in its original box where you still have it. Perfume is fragile and flammable, so it must be well protected.",
            "Once we receive and inspect the item, we will notify you of the outcome and issue any refund or replacement due.",
          ]}
        />

        <SubHeading>Who pays return shipping</SubHeading>
        <Bullets
          items={[
            "We pay, where the item was damaged in transit, faulty, incorrect, or the order was incomplete. We will either arrange collection or reimburse the return cost you paid, against a receipt.",
            "You pay, where you are returning an unopened item because you changed your mind.",
          ]}
        />
      </Section>

      <Section n={8} title="Exchanges">
        <p>
          You may ask to exchange an item within {ORDER_POLICY.exchangeWindow} of delivery,
          on the same conditions as a return: the product must be sealed and unused, or the
          exchange must be because the item is faulty, damaged or not what you ordered.
        </p>
        <Bullets
          items={[
            "Exchanges are subject to the replacement item being in stock. If it is not, we will offer you an alternative or a full refund.",
            "Where the replacement costs more, we will ask you to pay the difference; where it costs less, we will refund the difference.",
            "For a faulty, damaged or incorrect item, we cover the cost of shipping the replacement to you. For a change-of-mind exchange, the return and redelivery cost is yours.",
            "An item can be exchanged once. If the replacement is also unsuitable, we will refund you instead.",
          ]}
        />
      </Section>

      <Section n={9} title="Refunds">
        <p>
          Once a refund is approved, we process it within{" "}
          {ORDER_POLICY.refundProcessing} and issue it to the method you paid with wherever
          possible.
        </p>
        <Bullets
          items={[
            <>
              <strong className="text-white/90">Card or wallet payment</strong> — refunded
              through our payment provider to the same card or wallet. Your bank may take a
              further few working days to show it on your statement.
            </>,
            <>
              <strong className="text-white/90">Bank transfer or mobile wallet</strong> —
              refunded to the account the payment came from. We may ask you to confirm the
              account title and number in writing before transferring.
            </>,
            <>
              <strong className="text-white/90">Cash on Delivery</strong> — because we hold
              no card details, we refund by bank transfer or mobile wallet to an account you
              nominate.
            </>,
          ]}
        />
        <SubHeading>What is refunded</SubHeading>
        <Bullets
          items={[
            "The full product amount, in every case where a refund is due.",
            "The delivery charge as well, where the fault was ours — a damaged, faulty, incorrect or incomplete order, or an order we cancelled.",
            "The product amount only, where you changed your mind about an unopened item. The delivery charge already spent on getting the parcel to you is not refunded.",
            "Nothing is deducted as a handling or restocking fee. We do not charge one.",
          ]}
        />
        <p>
          We will always tell you the exact amount being refunded, and why, before we
          process it.
        </p>
      </Section>

      <Section n={10} title="If something goes wrong">
        <p>
          If you are unhappy with how a delivery, return, exchange or refund has been
          handled, please raise it with us. We acknowledge every complaint within{" "}
          {RESPONSE_TIMES.acknowledgement} and aim to resolve it within{" "}
          {RESPONSE_TIMES.resolution}. Our full process, and how to escalate, is on our{" "}
          <PolicyLink href="/complaints">Complaint Handling</PolicyLink> page.
        </p>
        <Callout title="Questions about an order">
          Email{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-gold hover:underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>{" "}
          or call {BUSINESS.phone} during {BUSINESS.hours}. Please have your order number
          ready.
        </Callout>
      </Section>
    </LegalPage>
  );
}
