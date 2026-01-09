"use client"

import React, { useState } from "react"

export default function Logo({
  size = 56,
  className = "",
  alt = "Owoabenes Mothercare & Kids Boutique",
}: {
  size?: number
  className?: string
  alt?: string
}) {
  const [src, setSrc] = useState("/logo.png")

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      className={`object-contain ${className}`}
      onError={() => setSrc("/placeholder-logo.png")}
    />
  )
}
