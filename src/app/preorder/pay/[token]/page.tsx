import { redirect } from "next/navigation";

/**
 * The balance payment used to live on its own page here. It now happens on the
 * ordinary checkout page, which shows the deposit already paid alongside what
 * is left to complete the order.
 *
 * This redirect stays so the links in payment emails already sent keep working.
 */
export default async function LegacyBalancePayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/checkout?preorder=${token}`);
}
