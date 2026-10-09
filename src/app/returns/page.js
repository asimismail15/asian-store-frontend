import InformationPage from "@/components/InformationPage";

export const metadata = { title: "Returns | ASIAN STORE" };
export default function ReturnsPage() {
  return <InformationPage eyebrow="CUSTOMER CARE" title="Returns" intro="Need help with an item you received? Contact our team with your order reference and a brief description of the issue so we can guide you through the next steps." sections={[{title:"Start a request",body:"Email us with your order number and the item you need help with. Please wait for instructions before sending an item back."},{title:"Order details",body:"You can find your order reference and current order status in your account."}]} action={{href:"/contact",label:"Contact customer care"}}/>;
}
