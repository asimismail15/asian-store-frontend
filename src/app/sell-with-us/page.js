import InformationPage from "@/components/InformationPage";

export const metadata = { title: "Sell with Us | ASIAN STORE" };
export default function SellWithUsPage() {
  return <InformationPage eyebrow="PARTNER WITH US" title="Sell with us" intro="Have a product range that could be a good fit for ASIAN STORE? Tell us about your brand and the collection you would like us to consider." sections={[{title:"Share your collection",body:"Send a short introduction, product categories, and a link to your catalog or website."},{title:"Get in touch",body:"Our team can review your note and follow up if there is a fit."}]} action={{href:"mailto:asimismaill174@gmail.com?subject=Sell%20with%20ASIAN%20STORE",label:"Introduce your brand"}}/>;
}
