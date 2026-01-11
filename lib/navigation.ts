// Navigation utility for Electron static export
// Handles proper path resolution for file:// protocol

/**
 * Get the base path for navigation
 * In Electron with file:// protocol, we need to navigate using the full path
 */
function getBasePath(): string {
  if (typeof window === "undefined") return ""
  
  const { pathname, protocol } = window.location
  
  // For file:// protocol (Electron), we need to find the base path
  if (protocol === "file:") {
    // Find the 'out' directory in the path and use that as base
    const outIndex = pathname.indexOf("/out/")
    if (outIndex !== -1) {
      return pathname.substring(0, outIndex + 5) // Include '/out/'
    }
    // Fallback: go up to the directory containing index.html
    const lastSlash = pathname.lastIndexOf("/")
    if (lastSlash !== -1) {
      return pathname.substring(0, lastSlash + 1)
    }
  }
  
  // For http:// protocol (development), use root
  return "/"
}

/**
 * Get the correct path for static assets like logo
 * Works in both Electron (file://) and development (http://)
 */
export function getAssetPath(assetName: string): string {
  if (typeof window === "undefined") return `./${assetName}`
  
  const { protocol } = window.location
  
  if (protocol === "file:") {
    const basePath = getBasePath()
    return `file://${basePath}${assetName}`
  }
  
  // For development server
  return `/${assetName}`
}

/**
 * Get the logo path
 */
export function getLogoPath(): string {
  return getAssetPath("logo.jpeg")
}

/**
 * Navigate to a route within the app
 * @param route - The route to navigate to (e.g., "/admin", "/cashier", "/")
 */
export function navigateTo(route: string): void {
  if (typeof window === "undefined") return

  const { protocol } = window.location
  console.log("[DEBUG] Navigating to:", route, "protocol:", protocol)

  if (protocol === "file:") {
    // For Electron, construct the full file path
    const basePath = getBasePath()
    // Remove leading slash from route and add index.html for directories
    let targetPath = route.startsWith("/") ? route.substring(1) : route

    // Handle root path
    if (targetPath === "" || targetPath === "/") {
      targetPath = "index.html"
    } else {
      // Ensure path ends with /index.html for directory routes
      if (!targetPath.endsWith(".html")) {
        targetPath = targetPath.replace(/\/$/, "") + "/index.html"
      }
    }

    const fullPath = `file://${basePath}${targetPath}`
    console.log("[DEBUG] File navigation to:", fullPath)
    window.location.href = fullPath
  } else {
    // For development server, use simple navigation
    console.log("[DEBUG] HTTP navigation to:", route)
    window.location.href = route
  }
}

/**
 * Navigate to the login page (root)
 */
export function navigateToLogin(): void {
  navigateTo("/")
}

/**
 * Navigate to admin dashboard
 */
export function navigateToAdmin(): void {
  navigateTo("/admin")
}

/**
 * Navigate to cashier page
 */
export function navigateToCashier(): void {
  navigateTo("/cashier")
}

/**
 * Navigate to admin sub-page
 * @param subPage - The sub-page name (e.g., "inventory", "receipts", "reports")
 */
export function navigateToAdminPage(subPage: string): void {
  navigateTo(`/admin/${subPage}`)
}
