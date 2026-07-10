import ViewRenderer from "@/components/view-renderer"
import { getView } from "@/lib/views"

export default function HomePage() {
  const view = getView("homepage")
  return <ViewRenderer id={view.id} className={view.className} html={view.html} />
}
