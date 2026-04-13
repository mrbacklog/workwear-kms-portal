import { useCallback, useEffect, useRef, useState } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';

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

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const resetForm = useCallback(() => {
    setDescription('')
    setItemType('bug')
    setPriority('medium')
    setSubmitted(false)
    setSubmitError(null)
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
