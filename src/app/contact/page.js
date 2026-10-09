import InformationPage from "@/components/InformationPage";

export const metadata = { title: "Contact | ASIAN STORE" };
export default function ContactPage() {
  return <InformationPage eyebrow="WE’RE HERE TO HELP" title="Contact us" intro="For questions about an order, a product, or the store, send us a note and include any details that will help us understand your request." sections={[{title:"Email",body:"Reach the ASIAN STORE team at asimismaill174@gmail.com."},{title:"Order support",body:"Include your order reference when asking about delivery, a return, or an existing purchase."}]} action={{href:"mailto:asimismaill174@gmail.com",label:"Email ASIAN STORE"}}/>;
}
