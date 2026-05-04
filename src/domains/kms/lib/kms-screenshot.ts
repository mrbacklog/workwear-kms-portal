import { toPng } from 'html-to-image'

export interface CaptureResult {
  blob: Blob
  dataUrl: string
}

export async function captureScreenWithout(
  hideElement: HTMLElement | null
): Promise<CaptureResult | null> {
  const root = document.getElementById('root')
  if (!root) return null

  const prevVisibility = hideElement?.style.visibility ?? ''
  if (hideElement) {
    hideElement.style.visibility = 'hidden'
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

  try {
    const dataUrl = await toPng(root, {
      pixelRatio: 1,
      skipAutoScale: true,
      filter: (node: HTMLElement) => {
        if (node instanceof HTMLIFrameElement) return false
        return true
      },
    })

    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return { blob, dataUrl }
  } catch (err) {
    console.error('[kms-screenshot] Capture mislukt:', err)
    return null
  } finally {
    if (hideElement) {
      hideElement.style.visibility = prevVisibility
    }
  }
}

export async function uploadScreenshot(
  itemId: string,
  blob: Blob,
  baseUrl: string,
  authHeader?: Record<string, string>
): Promise<string | null> {
  try {
    const form = new FormData()
    form.append('file', blob, 'screenshot.png')

    const res = await fetch(`${baseUrl}/api/v1/backlog/items/${itemId}/screenshot`, {
      method: 'POST',
      body: form,
      headers: authHeader ?? {},
    })

    if (!res.ok) return null
    const data = await res.json() as { screenshot_url: string }
    return data.screenshot_url
  } catch {
    return null
  }
}
