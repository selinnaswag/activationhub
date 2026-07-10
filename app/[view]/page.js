import { notFound } from "next/navigation"
import ViewRenderer from "@/components/view-renderer"
import { getView, ROUTE_VIEW_IDS } from "@/lib/views"

export function generateStaticParams() {
  return ROUTE_VIEW_IDS.map((view) => ({ view }))
}

export const dynamicParams = false

const TITLES = {
  essentials: "Ethico Essentials",
  benchmark: "Benchmark Content",
  collateral: "Marketing Collateral",
  sdr: "SDR Resources",
  ae: "AE Resources",
  csm: "CSM Resources",
  mycm: "myCM Case Management",
}

export async function generateMetadata({ params }) {
  const { view } = await params
  const title = TITLES[view]
  return {
    title: title ? `Ethico | ${title}` : "Ethico | Activation Hub",
  }
}

export default async function ViewPage({ params }) {
  const { view } = await params
  const data = getView(view)
  if (!data || view === "homepage") notFound()
  return <ViewRenderer id={data.id} className={data.className} html={data.html} />
}
