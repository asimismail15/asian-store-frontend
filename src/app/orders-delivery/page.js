import InformationPage from "@/components/InformationPage";

export const metadata = { title: "Orders & Delivery | ASIAN STORE" };
export default function OrdersDeliveryPage() {
  return <InformationPage eyebrow="CUSTOMER CARE" title="Orders & delivery" intro="Find your order updates and delivery information in one place. Sign in to review current orders, or check delivery estimates before you shop." sections={[{title:"Order updates",body:"Your account shows order status and the latest tracking details available for each order."},{title:"Delivery estimates",body:"Use the shipping page to view an estimated rate and delivery window for a destination."}]} action={{href:"/track-order",label:"Track an order"}}/>;
}
