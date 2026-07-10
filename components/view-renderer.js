"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

function hrefForView(view) {
  return view === "homepage" ? "/" : `/${view}`
}

export default function ViewRenderer({ id, className, html }) {
  const containerRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    // Prefetch the routes we can navigate to for snappy transitions.
    root.querySelectorAll("[data-nav]").forEach((el) => {
      const target = el.getAttribute("data-nav")
      if (target) router.prefetch(hrefForView(target))
    })

    // Open a collapsible panel + its chevron (used by scrollToMenu / toggles).
    function openPane(key) {
      const pane = root.querySelector(`#panel-${key}`)
      const chevron = root.querySelector(`#chevron-${key}`)
      if (pane) pane.classList.add("open")
      if (chevron) chevron.classList.add("open")
      return pane
    }

    function togglePane(key) {
      const pane = root.querySelector(`#panel-${key}`)
      const chevron = root.querySelector(`#chevron-${key}`)
      if (!pane) return
      const willOpen = !pane.classList.contains("open")
      pane.classList.toggle("open", willOpen)
      if (chevron) chevron.classList.toggle("open", willOpen)
    }

    // Delegated click handling for all the ported inline actions.
    function onClick(event) {
      const navEl = event.target.closest("[data-nav]")
      if (navEl && root.contains(navEl)) {
        event.preventDefault()
        router.push(hrefForView(navEl.getAttribute("data-nav")))
        return
      }

      const scrollToEl = event.target.closest("[data-scroll-to]")
      if (scrollToEl && root.contains(scrollToEl)) {
        const target = root.querySelector(`#${CSS.escape(scrollToEl.getAttribute("data-scroll-to"))}`)
        if (target) target.scrollIntoView({ behavior: "smooth" })
        return
      }

      const scrollMenuEl = event.target.closest("[data-scroll-menu]")
      if (scrollMenuEl && root.contains(scrollMenuEl)) {
        const key = scrollMenuEl.getAttribute("data-scroll-menu")
        openPane(key)
        const navigator = root.querySelector("#navigator-section")
        if (navigator) navigator.scrollIntoView({ behavior: "smooth", block: "start" })
        return
      }

      const toggleEl = event.target.closest("[data-toggle-pane]")
      if (toggleEl && root.contains(toggleEl)) {
        togglePane(toggleEl.getAttribute("data-toggle-pane"))
      }
    }

    root.addEventListener("click", onClick)

    // ---- Header dropdown menus (present on the homepage header) ----
    const menus = [
      { btn: "marketingMenuBtn", dropdown: "marketingMenuDropdown" },
      { btn: "teamMenuBtn", dropdown: "teamMenuDropdown" },
      { btn: "coreMenuBtn", dropdown: "coreMenuDropdown" },
    ]
      .map((m) => ({
        btn: root.querySelector(`#${m.btn}`),
        dropdown: root.querySelector(`#${m.dropdown}`),
      }))
      .filter((m) => m.btn && m.dropdown)

    function closeAllMenus() {
      menus.forEach((m) => m.dropdown.classList.add("hidden"))
    }

    const menuHandlers = menus.map((m) => {
      const handler = (event) => {
        event.stopPropagation()
        menus.forEach((other) => {
          if (other !== m) other.dropdown.classList.add("hidden")
        })
        m.dropdown.classList.toggle("hidden")
      }
      m.btn.addEventListener("click", handler)
      return { btn: m.btn, handler }
    })

    if (menus.length > 0) {
      document.addEventListener("click", closeAllMenus)
    }

    return () => {
      root.removeEventListener("click", onClick)
      menuHandlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler))
      if (menus.length > 0) document.removeEventListener("click", closeAllMenus)
    }
  }, [id, html, router])

  return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
