import type { Metadata } from "next";
import { ReportView } from "@/components/report/ReportView";

export const metadata: Metadata = {
  title: "Your report",
  robots: { index: false, follow: false },
};

export default function ReportPage({ params }: { params: { orderId: string } }) {
  return <ReportView orderId={params.orderId} />;
}
