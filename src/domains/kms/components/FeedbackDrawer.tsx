import { useCallback, useEffect, useRef, useState } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { captureScreenWithout, uploadScreenshot } from '../lib/kms-screenshot';

type FeedbackType = 'bug' | 'improvement' | 'feature'
type FeedbackPriority = 'critical' | 'high' | 'medium' | 'low'

const API_BASE = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_URL ?? 'https://api.databiz.app')
  : 'https://api.databiz.app'

const ITEM_TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'improvement', label: 'Verbetering', emoji: '✨' },
  { value: 'feature', label: 'Nieuwe wens', emoji: '💡' },
]

const PRIORITIES: { value: FeedbackPriority; label: string; color: string }[] = [
  { value: 'critical', label: 'Kritiek', color: '#ef4444' },
  { value: 'high', label: 'Hoog', color: '#f97316' },
  { value: 'medium', label: 'Normaal', color: '#3b82f6' },
  { value: 'low', label: 'Laag', color: '#6b7280' },
]

const PLACEHOLDERS: Record<FeedbackType, string> = {
  bug: 'Wat gaat er mis? Wat deed je, en wat verwachtte je te zien?',
  improvement: 'Wat kan er beter, en waarom zou dat helpen?',
  feature: 'Wat wil je graag zien? Beschrijf de use case.',
}

export function FeedbackDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [itemType, setItemType] = useState<FeedbackType>('bug')
  const [priority, setPriority] = useState<FeedbackPriority>('medium')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const capturingRef = useRef(false)
  const [captureError, setCaptureError] = useState<string | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const resetForm = useCallback(() => {
    setDescription('')
    setItemType('bug')
    setPriority('medium')
    setSubmitted(false)
    setSubmitError(null)
    setScreenshotBlob(null)
    setScreenshotPreview(null)
    setCaptureError(null)
  }, [])

  const handleCapture = useCallback(async () => {
    if (capturingRef.current) return
    capturingRef.current = true
    setCapturing(true)
    setCaptureError(null)
    const result = await captureScreenWithout(drawerRef.current)
    capturingRef.current = false
    setCapturing(false)
    if (result) {
      setScreenshotBlob(result.blob)
      setScreenshotPreview(result.dataUrl)
    } else {
      setCaptureError('Schermafbeelding mislukt. Probeer opnieuw.')
    }
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    timerRef.current = setTimeout(resetForm, 300)
  }, [resetForm])

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  async function handleSubmit() {
    if (!description.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const title = description.trim().slice(0, 80) || `${itemType} via kms`
      const res = await fetch(`${API_BASE}/api/v1/backlog/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description.trim(),
          source: 'kms_superuser',
          item_type: itemType,
          priority,
          target_app: 'kms',
        }),
      })
      if (!res.ok) {
        setSubmitError('Versturen mislukt. Probeer het opnieuw.')
        return
      }
      const created = await res.json() as { id: string }
      const capturedBlob = screenshotBlob   // bewaar lokale referentie vóór reset
      setScreenshotBlob(null)
      setScreenshotPreview(null)
      setCaptureError(null)
      if (capturedBlob) {
        void uploadScreenshot(created.id, capturedBlob, API_BASE)
      }
      setSubmitted(true)
      timerRef.current = setTimeout(handleClose, 1800)
    } catch {
      setSubmitError('Geen verbinding. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  const drawerWidth = '340px'

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 98,
          }}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Feedback geven"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0, bottom: 0, right: 0,
          width: drawerWidth,
          background: kmsColors.black,
          borderLeft: `1px solid ${kmsColors.border}`,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 99,
          fontFamily: kmsFont,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 52,
          borderBottom: `1px solid ${kmsColors.border}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: kmsColors.text }}>Feedback geven</span>
          <button onClick={handleClose} aria-label="Sluiten" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: kmsColors.textMuted, fontSize: 18, lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', paddingTop: 48 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: kmsColors.text }}>Bedankt voor je feedback!</p>
              <p style={{ fontSize: 12, color: kmsColors.textMuted, marginTop: 4 }}>We nemen het zo snel mogelijk op.</p>
            </div>
          ) : (
            <>
              {/* Type */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: kmsColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Type</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {ITEM_TYPES.map(t => (
                    <button key={t.value} onClick={() => setItemType(t.value)} style={{
                      flex: 1, padding: '6px 4px', fontSize: 11, fontWeight: 600,
                      borderRadius: 6, border: '2px solid',
                      borderColor: itemType === t.value ? kmsColors.orange : '#333',
                      background: itemType === t.value ? `${kmsColors.orange}20` : 'transparent',
                      color: itemType === t.value ? kmsColors.orange : kmsColors.textMuted,
                      cursor: 'pointer', fontFamily: kmsFont,
                      transition: 'all 150ms ease',
                    }}>
                      <span style={{ marginRight: 2 }}>{t.emoji}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgentie */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: kmsColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Urgentie</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {PRIORITIES.map(p => (
                    <button key={p.value} onClick={() => setPriority(p.value)} style={{
                      padding: '6px 4px', fontSize: 11, fontWeight: 600,
                      borderRadius: 6, border: '2px solid',
                      borderColor: priority === p.value ? p.color : '#333',
                      background: priority === p.value ? `${p.color}20` : 'transparent',
                      color: priority === p.value ? p.color : kmsColors.textMuted,
                      cursor: 'pointer', fontFamily: kmsFont,
                      transition: 'all 150ms ease',
                    }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Omschrijving */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: kmsColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Omschrijving <span style={{ textTransform: 'none', fontWeight: 400 }}>(verplicht)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={PLACEHOLDERS[itemType]}
                  rows={5}
                  style={{
                    marginTop: 8, width: '100%', boxSizing: 'border-box',
                    background: '#111', border: '1px solid #333', borderRadius: 6,
                    padding: '8px 12px', fontSize: 13, color: kmsColors.text,
                    fontFamily: kmsFont, resize: 'none', outline: 'none',
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div style={{
            padding: '12px 16px', borderTop: `1px solid ${kmsColors.border}`,
            display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
          }}>
            {/* Screenshot sectie */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: kmsColors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Schermafbeelding <span style={{ textTransform: 'none', fontWeight: 400 }}>(optioneel)</span>
              </p>
              {screenshotPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #333', borderRadius: 6, padding: '6px 8px', background: '#111' }}>
                  <img src={screenshotPreview} alt="Screenshot preview" style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #333', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: kmsColors.text, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>screenshot.png</p>
                    <button
                      type="button"
                      aria-label="Screenshot verwijderen"
                      onClick={() => { setScreenshotBlob(null); setScreenshotPreview(null); setCaptureError(null) }}
                      style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: kmsFont }}
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={capturing}
                    style={{
                      width: '100%', padding: '7px 12px', fontSize: 11, fontWeight: 600,
                      borderRadius: 6, border: '2px dashed #333',
                      background: 'transparent',
                      color: capturing ? kmsColors.textMuted : kmsColors.textMuted,
                      cursor: capturing ? 'not-allowed' : 'pointer',
                      fontFamily: kmsFont, transition: 'all 150ms ease',
                      opacity: capturing ? 0.5 : 1,
                    }}
                  >
                    <span aria-hidden="true">📷</span> {capturing ? 'Bezig...' : 'Scherm vastleggen'}
                  </button>
                  {captureError && (
                    <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{captureError}</p>
                  )}
                </>
              )}
            </div>

            {submitError && (
              <p style={{ fontSize: 12, color: '#ef4444', background: '#ef444415', border: '1px solid #ef444430', borderRadius: 6, padding: '6px 10px', margin: 0 }}>
                {submitError}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={handleClose} style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 500,
                background: 'none', border: '1px solid #333', borderRadius: 6,
                color: kmsColors.textMuted, cursor: 'pointer', fontFamily: kmsFont,
              }}>Annuleren</button>
              <button onClick={handleSubmit} disabled={!description.trim() || submitting} style={{
                padding: '6px 16px', fontSize: 12, fontWeight: 700,
                background: description.trim() && !submitting ? kmsColors.orange : '#333',
                border: 'none', borderRadius: 6,
                color: description.trim() && !submitting ? '#fff' : kmsColors.textMuted,
                cursor: description.trim() && !submitting ? 'pointer' : 'not-allowed',
                fontFamily: kmsFont, transition: 'all 150ms ease',
              }}>{submitting ? 'Versturen...' : 'Versturen'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Verticaal tabje */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-label="Feedback geven"
        aria-expanded={isOpen}
        style={{
          position: 'fixed',
          bottom: '10%',
          right: isOpen ? drawerWidth : 0,
          zIndex: 100,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          background: kmsColors.orange,
          color: '#fff',
          fontSize: 11, fontWeight: 700,
          padding: '12px 7px',
          borderRadius: '6px 0 0 6px',
          border: 'none', cursor: 'pointer',
          letterSpacing: '0.06em',
          fontFamily: kmsFont,
          boxShadow: '-3px 0 12px rgba(241,142,0,0.3)',
          transition: 'right 300ms ease-in-out',
          userSelect: 'none',
        }}
      >
        Feedback
      </button>
    </>
  )
}
