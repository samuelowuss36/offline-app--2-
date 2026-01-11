"use client"

import React, { useState, useEffect } from "react"
import { getLogoPath, getAssetPath } from "@/lib/navigation"

export default function Logo({
  size = 56,
  className = "",
  alt = "Owoabenes Mothercare & Kids Boutique",
}: {
  size?: number
  className?: string
  alt?: string
}) {
  const [src, setSrc] = useState("./logo.jpeg")

  useEffect(() => {
    setSrc(getLogoPath())
  }, [])

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      className={`object-contain ${className}`}
      onError={() => setSrc(getAssetPath("placeholder-logo.png"))}
    />
  )
}
