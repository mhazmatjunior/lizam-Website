# 🚀 Raanae Production Deployment Checklist

Follow these steps to transition your site from a testing "Sandbox" environment to a live "Production" environment.

## 1. Safepay Production Account
Payments will not process for customers using your Sandbox account.
- [ ] Go to [Safepay's Live Site](https://www.getsafepay.com/) and register for a **Live Merchant Account**.
- [ ] Complete the **KYC (Know Your Customer)** process by uploading your ID, bank details, and business proof.
- [ ] Once activated, go to **Settings > API Keys** in your *Live* Dashboard to get your production keys.

---

## 2. Vercel Environment Variables
You must add these to the **Environment Variables** section in your Vercel Project Settings. Ensure you select **"Production"** for all of them.

| Variable Name | Production Value |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Your live domain (e.g., `https://raanae.com`) |
| `NEXT_PUBLIC_SAFEPAY_ENVIRONMENT` | `production` |
| `NEXT_PUBLIC_SAFEPAY_PUBLIC` | Your **Live** Public Key |
| `SAFEPAY_SECRET` | Your **Live** Secret Key |
| `SAFEPAY_WEBHOOK_SECRET` | Your **Live** Webhook Secret |
| `NEXTAUTH_URL` | Your live domain (e.g., `https://raanae.com`) |
| `NEXTAUTH_SECRET` | A long random string (can keep your current one) |

---

## 3. Connect Your Domain
1. Log in to your **Vercel Dashboard**.
2. Go to **Settings > Domains**.
3. Add your domain (e.g., `raanae.com`).
4. Vercel will give you **A records** or **CNAME** records. You must add these to your domain provider (GoDaddy, Namecheap, etc.) to point the traffic to Vercel.

---

## 4. Trigger Final Build
Once your domain is connected and variables are added:
- [ ] Push a final commit to your GitHub master branch or click **Redeploy** in the Vercel dashboard.
- [ ] Visit your site on the new domain and verify that the checkout button takes you to the *Live* Safepay screen (not the sandbox one).

---

## ⚠️ Post-Launch Checklist
- **Test Transaction:** Perform one small real purchase using your own bank card to ensure the money reaches Safepay correctly.
- **Admin Verification:** Log in to your Admin portal at `yourdomain.com/admin` to ensure you can see that test order.
- **Analytics:** Enable Vercel Analytics or Google Analytics to track your visitors.
