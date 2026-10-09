"use client";

import Link from "next/link";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderApi } from "@/lib/api";
import { useStore } from "@/components/StoreProvider";
import { shippingCountries } from "@/lib/regions";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null;
const walletAccounts = {
  jazzcash: { title: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_TITLE || "Asian Store", number: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_NUMBER || "03331582175" },
  easypaisa: { title: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_TITLE || "Asian Store", number: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_NUMBER || "03331582175" },
};

function PaymentForm({ clientSecret, orderId, shipping, cardholder, amount, onError, refreshCart }) {
  const stripe = useStripe(); const elements = useElements(); const router = useRouter(); const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (!stripe || !elements) return;
    setBusy(true); onError("");
    try {
      const result = await stripe.confirmPayment({ elements, clientSecret, confirmParams: { return_url: `${window.location.origin}/checkout?order=${orderId}`, payment_method_data: { billing_details: { name: cardholder, email: shipping.email } } }, redirect: "if_required" });
      if (result.error) { onError(result.error.message || "Payment failed."); setBusy(false); return; }
      if (result.paymentIntent?.status === "succeeded") { await orderApi.markPaid(orderId, { id: result.paymentIntent.id, status: result.paymentIntent.status, email_address: shipping.email }); await refreshCart(); router.push(`/checkout/success?order=${orderId}`); }
      else { router.push(`/checkout/success?order=${orderId}&pending=1`); }
    } catch (error) { onError(error.message); setBusy(false); }
  }
  return <form onSubmit={submit} className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-black"><h2 className="text-lg font-bold">Payment</h2><div className="mt-5"><PaymentElement /></div><button disabled={!stripe || busy || !clientSecret} className="mt-6 min-h-12 w-full rounded-full bg-violet-700 py-3 font-bold text-white disabled:opacity-50 dark:bg-violet-300 dark:text-black">{busy ? "Processing payment..." : `Pay $${amount.toFixed(2)} USD`}</button><p className="mt-3 text-xs text-black/55 dark:text-white/60">Your card details are handled securely by Stripe. Payment is charged in USD.</p></form>;
}

export default function CheckoutPage() {
  const { user, cart, ready, refreshCart, clearCart, selectedCountry, setShippingCountry, formatPrice } = useStore(); const router = useRouter(); const [shipping, setShipping] = useState({ address: "", city: "", postalCode: "", country: "", email: "" }); const [giftWrapped, setGiftWrapped] = useState(false); const [giftMessage, setGiftMessage] = useState(""); const [clientSecret, setClientSecret] = useState(""); const [amount, setAmount] = useState(0); const [orderId, setOrderId] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentDetails, setPaymentDetails] = useState({ senderPhone: "", transactionId: "", cardNumber: "", expiry: "", cvc: "", cardholder: "" });
  const [copiedAccount, setCopiedAccount] = useState("");
  const simulationMode = Boolean(user?.mockSession) || cart.some((item) => String(item._id || "").startsWith("local-"));
  const shippingDetails = { ...shipping, country: shipping.country || selectedCountry };
  const giftOptions = { giftWrapped, giftMessage: giftMessage.trim() };
  const subtotal = cart.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);
  async function copyWalletAccount(method) {
    try {
      await navigator.clipboard.writeText(walletAccounts[method].number);
      setCopiedAccount(method);
      window.setTimeout(() => setCopiedAccount(""), 1800);
    } catch {
      setError("Could not copy the account number. Select and copy it manually.");
    }
  }
  useEffect(() => {
    if (!ready || !user) return;
    const query = new URLSearchParams(window.location.search);
    const orderId = query.get("order"); const returnedSecret = query.get("payment_intent_client_secret");
    if (!orderId || !returnedSecret || !stripePromise) return;
    let active = true;
    stripePromise.then(async (stripe) => {
      if (active) setLoading(true);
      if (!stripe) throw new Error("Stripe could not be initialized.");
      const { paymentIntent, error: stripeError } = await stripe.retrievePaymentIntent(returnedSecret);
      if (stripeError) throw stripeError;
      if (paymentIntent?.status === "succeeded") {
        await orderApi.markPaid(orderId, { id: paymentIntent.id, status: paymentIntent.status, email_address: user?.email });
        await refreshCart();
        if (active) router.replace(`/checkout/success?order=${orderId}`);
      } else if (active) {
        router.replace(`/checkout/success?order=${orderId}&pending=1`);
      }
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router, user, ready, refreshCart]);
  async function prepare(event) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      if (["easypaisa", "jazzcash"].includes(paymentMethod) && !/^03\d{9}$/.test(paymentDetails.senderPhone.replace(/[\s-]/g, ""))) throw new Error("Enter a valid 11-digit sender phone number.");
      if (["easypaisa", "jazzcash"].includes(paymentMethod) && paymentDetails.transactionId.trim().length < 6) throw new Error("Enter the transaction ID from your transfer receipt.");
      if (paymentMethod === "card" && !paymentDetails.cardholder.trim()) throw new Error("Enter the cardholder name.");
      if (simulationMode && paymentMethod === "card" && (!/^\d{13,19}$/.test(paymentDetails.cardNumber.replace(/\s/g, "")) || !/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(paymentDetails.expiry) || !/^\d{3,4}$/.test(paymentDetails.cvc) || !paymentDetails.cardholder.trim())) throw new Error("Enter valid card details and the cardholder name.");
      if (simulationMode) {
        const orderId = `DEMO-${crypto.randomUUID()}`;
        const demoOrders = JSON.parse(localStorage.getItem("asian-store-demo-orders") || "[]");
        localStorage.setItem("asian-store-demo-orders", JSON.stringify([{ id: orderId, total: subtotal, status: "Pending", paymentMethod, paymentAccount: paymentMethod === "easypaisa" || paymentMethod === "jazzcash" ? `••••••${paymentDetails.senderPhone.slice(-4)}` : undefined, createdAt: new Date().toISOString(), shipping: shippingDetails, giftOptions }, ...demoOrders].slice(0, 20)));
        console.info("[mock-email]", { to: shippingDetails.email, subject: `ASIAN STORE order ${orderId} confirmed`, message: "Your demo order has been received.", simulated: true });
        await clearCart({ remote: true });
        router.push(`/checkout/success?order=${encodeURIComponent(orderId)}&simulated=1`);
        return;
      }
      if (paymentMethod === "card" && !stripePromise) throw new Error("Card payments are not configured yet. Choose EasyPaisa, JazzCash, or COD, or configure Stripe.");
      if (["easypaisa", "jazzcash"].includes(paymentMethod) && (!walletAccounts[paymentMethod].title || !walletAccounts[paymentMethod].number) && !simulationMode) throw new Error("The store wallet destination is not configured yet. Please choose COD or contact the store.");
      const order = await orderApi.create(shippingDetails, giftOptions, { paymentMethod, paymentSenderPhone: paymentDetails.senderPhone, paymentTransactionId: paymentDetails.transactionId.trim() });
      if (paymentMethod === "card") {
        const intent = await orderApi.paymentIntent(order._id);
        setOrderId(order._id); setAmount(subtotal); setClientSecret(intent.clientSecret);
      } else {
        await refreshCart();
        router.push(`/checkout/success?order=${order._id}&payment=${paymentMethod}&pending=${paymentMethod === "cod" ? "0" : "1"}`);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  if (!ready) return <main className="p-12 text-center text-black dark:text-white">Loading checkout...</main>;
  if (!user) return <main className="p-8 text-center text-black dark:text-white sm:p-16"><p>Please sign in before checkout.</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-full bg-violet-700 px-5 text-white dark:bg-violet-300 dark:text-black" href="/login?next=/checkout">Sign in</Link></main>;
  if (!cart.length) return <main className="p-8 text-center text-black dark:text-white sm:p-16">Your cart is empty. <Link className="text-violet-700 dark:text-violet-300" href="/shop">Browse products</Link></main>;
  const fields = [["address", "Street address"], ["city", "City"], ["postalCode", "Postal code"], ["email", "Receipt email"]];
  const paymentOptions = [
    ["easypaisa", "EasyPaisa", "Manual transfer"],
    ["jazzcash", "JazzCash", "Manual transfer"],
    ["card", "Credit / Debit Card", "Visa / Mastercard"],
    ["cod", "Cash on Delivery", "Pay when your order arrives"],
  ];
  const inputClass = "mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-violet-700 dark:border-white/15 dark:bg-black dark:focus:border-violet-300";

  return <main className="lux-fade-in mx-auto max-w-5xl px-4 py-10 text-black dark:text-white sm:px-5 sm:py-12">
    <h1 className="text-3xl font-bold">Checkout</h1>
    <div className="mt-7 grid items-start gap-6 md:grid-cols-2">
      <form onSubmit={prepare} className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-black">
        <h2 className="text-lg font-bold">Shipping details</h2>
        {fields.slice(0, 3).map(([key, label]) => <label key={key} className="block text-sm font-medium">{label}<input required value={shipping[key]} onChange={(event) => setShipping({ ...shipping, [key]: event.target.value })} className={inputClass} /></label>)}
        <label className="block text-sm font-medium">Country<select required value={shippingDetails.country} onChange={(event) => { setShipping({ ...shipping, country: event.target.value }); setShippingCountry(event.target.value); }} className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-black dark:border-white/15 dark:bg-black dark:text-white">{shippingCountries.map((country) => <option key={country}>{country}</option>)}</select></label>
        <label className="block text-sm font-medium">Receipt email<input type="email" required value={shipping.email} onChange={(event) => setShipping({ ...shipping, email: event.target.value })} className={inputClass} /></label>

        <section aria-labelledby="payment-heading" className="rounded-xl border border-black/10 p-4 dark:border-white/15">
          <h2 id="payment-heading" className="text-lg font-bold">Payment method</h2>
          <div className="mt-3 space-y-2">{paymentOptions.map(([value, label, hint]) => <label key={value} className={`lux-interactive flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${paymentMethod === value ? "border-violet-700 bg-violet-50 dark:border-violet-300 dark:bg-violet-950/40" : "border-black/10 dark:border-white/15"}`}><input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={() => { setPaymentMethod(value); setClientSecret(""); setOrderId(""); setError(""); }} className="size-4 accent-violet-700 dark:accent-violet-300"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{label}</span><span className="block text-xs text-black/55 dark:text-white/60">{hint}</span></span><span aria-hidden="true" className="text-violet-700 dark:text-violet-300">{value === "easypaisa" ? "E" : value === "jazzcash" ? "J" : value === "card" ? "C" : "COD"}</span></label>)}</div>

          {["easypaisa", "jazzcash"].includes(paymentMethod) && <div className="mt-4 space-y-3">
            <div className="lux-glass rounded-xl border p-4 text-sm shadow-sm shadow-violet-900/5">
              <p className="font-semibold text-violet-900 dark:text-violet-100">ASIAN STORE {paymentMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"} transfer details</p>
              {walletAccounts[paymentMethod].title && walletAccounts[paymentMethod].number ? <><p className="mt-2">Account title: <strong>{walletAccounts[paymentMethod].title}</strong></p><div className="mt-1 flex flex-wrap items-center gap-3"><p>Mobile number: <strong className="select-all">{walletAccounts[paymentMethod].number}</strong></p><button type="button" onClick={() => copyWalletAccount(paymentMethod)} className="rounded-full border border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-800 transition hover:bg-violet-700 hover:text-white dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-300 dark:hover:text-black">{copiedAccount === paymentMethod ? "Copied" : "Copy number"}</button></div></> : <p className="mt-2 text-xs">Merchant account details are not configured. Please choose COD or contact the store.</p>}
              <p className="mt-2 text-xs text-black/60 dark:text-white/65">After transfer, enter the sender number and Trx ID from your receipt. Wallet orders remain pending until verified.</p>
            </div>
            <label className="block text-sm font-medium">Sender phone number<input required inputMode="numeric" autoComplete="tel-national" placeholder="03XXXXXXXXX" value={paymentDetails.senderPhone} onChange={(event) => setPaymentDetails({ ...paymentDetails, senderPhone: event.target.value.replace(/[^\d\s-]/g, "") })} className={inputClass} /></label>
            <label className="block text-sm font-medium">Transaction ID (Trx ID)<input required minLength={6} maxLength={120} autoComplete="off" value={paymentDetails.transactionId} onChange={(event) => setPaymentDetails({ ...paymentDetails, transactionId: event.target.value.slice(0, 120) })} placeholder="Transaction reference from receipt" className={inputClass} /></label>
          </div>}

          {paymentMethod === "card" && <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium">Cardholder name<input required autoComplete="cc-name" value={paymentDetails.cardholder} onChange={(event) => setPaymentDetails({ ...paymentDetails, cardholder: event.target.value })} className={inputClass} /></label>
            {simulationMode ? <div className="grid grid-cols-2 gap-3"><label className="col-span-2 block text-sm font-medium">Card number<input required inputMode="numeric" autoComplete="cc-number" value={paymentDetails.cardNumber} onChange={(event) => setPaymentDetails({ ...paymentDetails, cardNumber: event.target.value.replace(/[^\d ]/g, "").slice(0, 23) })} placeholder="1234 5678 9012 3456" className={inputClass} /></label><label className="block text-sm font-medium">Expiry<input required autoComplete="cc-exp" placeholder="MM/YY" value={paymentDetails.expiry} onChange={(event) => setPaymentDetails({ ...paymentDetails, expiry: event.target.value.slice(0, 7) })} className={inputClass} /></label><label className="block text-sm font-medium">CVC<input required type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={paymentDetails.cvc} onChange={(event) => setPaymentDetails({ ...paymentDetails, cvc: event.target.value.replace(/\D/g, "").slice(0, 4) })} className={inputClass} /></label></div> : <p className="text-xs text-black/55 dark:text-white/60">Card number, expiry, and CVC are collected securely by Stripe after continuing.</p>}
          </div>}
          {paymentMethod === "cod" && <p className="mt-3 text-xs text-black/55 dark:text-white/60">Pay the courier when your order is delivered.</p>}
        </section>

        <section className="rounded-xl border border-violet-200 p-4 dark:border-violet-900">
          <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={giftWrapped} onChange={(event) => setGiftWrapped(event.target.checked)} className="mt-0.5 size-4 accent-violet-700 dark:accent-violet-300"/><span><span className="block text-sm font-semibold">Luxury Gift Packaging</span><span className="mt-1 block text-xs text-black/55 dark:text-white/60">Complimentary premium wrapping</span></span><span className="ml-auto rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">FREE</span></label>
          <label className="mt-4 block text-sm font-medium">Personal gift note <span className="font-normal text-black/50 dark:text-white/55">(optional)</span><textarea value={giftMessage} onChange={(event) => setGiftMessage(event.target.value.slice(0, 300))} maxLength={300} rows={3} className={`${inputClass} resize-y`} /><span className="mt-1 block text-right text-[10px] text-black/50 dark:text-white/55">{giftMessage.length}/300</span></label>
        </section>
        <p className="flex justify-between border-t border-black/10 pt-4 dark:border-white/15"><span>Order total</span><strong>{formatPrice(subtotal)}</strong></p>
        <button disabled={loading} className="min-h-12 w-full rounded-full bg-violet-700 py-3 font-semibold text-white disabled:opacity-50 dark:bg-violet-300 dark:text-black">{loading ? "Preparing checkout..." : paymentMethod === "card" && !simulationMode ? clientSecret ? "Refresh payment details" : "Continue to secure card payment" : `Place ${paymentMethod === "cod" ? "COD" : paymentMethod === "easypaisa" ? "EasyPaisa" : paymentMethod === "jazzcash" ? "JazzCash" : "demo card"} order`}</button>
      </form>
      {clientSecret && stripePromise && orderId ? <Elements stripe={stripePromise} options={{ clientSecret }}><PaymentForm clientSecret={clientSecret} orderId={orderId} shipping={shippingDetails} cardholder={paymentDetails.cardholder} amount={amount} onError={setError} refreshCart={refreshCart} /></Elements> : <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70 dark:border-white/15 dark:bg-black dark:text-white/70">{simulationMode ? "Demo checkout is active. Demo orders are saved locally; no payment is processed." : "Select a payment method and complete shipping details to continue."}</div>}
    </div>
    {error && <p role="alert" className="mt-5 rounded-lg bg-violet-50 p-3 text-sm text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">{error}</p>}
  </main>;
}
