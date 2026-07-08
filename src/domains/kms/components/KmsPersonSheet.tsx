import { useState, useEffect, useMemo } from 'react';
import { kmsColors, kmsFont, personInitials } from '../lib/kms-theme';
import type { KmsPerson, KmsPersonHistoryRecord } from '../types';

interface KmsPersonSheetFilterProps {
  mode: 'filter';
  selectedPersonId: string | null;
  onSelectFilter: (personId: string | null) => void;
}

interface KmsPersonSheetAssignProps {
  mode: 'assign';
  selectedPersons: KmsPerson[];
  maxSelectable: number;
  onChangeAssign: (persons: KmsPerson[]) => void;
}

type KmsPersonSheetProps = (KmsPersonSheetFilterProps | KmsPersonSheetAssignProps) & {
  isOpen: boolean;
  onClose: () => void;
  persons: KmsPerson[];
  history: KmsPersonHistoryRecord[];
  onCreatePerson: (name: string) => Promise<KmsPerson | null>;
};

/**
 * Gedeelde bottom-sheet voor alles rond medewerkers: filteren van de productlijst
 * (mode="filter", single-select) én toewijzen aan een winkelmandregel (mode="assign",
 * multi-select met cap = quantity). Vervangt het eerder geplande losse PersonFilterSheet
 * én PersonTagPicker's eigen inline-aanmaak-paneel (zie Revisie 2 in de design-spec).
 */
export function KmsPersonSheet(props: KmsPersonSheetProps) {
  const { isOpen, onClose, persons, history, onCreatePerson } = props;
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Reset velden bij sluiten van de sheet zodat een volgend gebruik (ander product/regel)
    // niet de vorige zoekterm/naam-invoer toont; geen cascaderende render, alleen bij
    // open/dicht-transitie.
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch('');
      setNewName('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const orderCountByPerson = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of history) {
      counts.set(record.person_id, (counts.get(record.person_id) ?? 0) + 1);
    }
    return counts;
  }, [history]);

  const selectedIds = useMemo(
    () =>
      new Set(
        props.mode === 'filter'
          ? props.selectedPersonId
            ? [props.selectedPersonId]
            : []
          : props.selectedPersons.map((p) => p.id),
      ),
    [props],
  );

  const capReached = props.mode === 'assign' && selectedIds.size >= props.maxSelectable;

  const filteredSorted = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? persons.filter((p) => p.name.toLowerCase().includes(query))
      : persons;
    return [...filtered].sort((a, b) => {
      const countA = orderCountByPerson.get(a.id) ?? 0;
      const countB = orderCountByPerson.get(b.id) ?? 0;
      if (countA !== countB) return countB - countA;
      return a.name.localeCompare(b.name);
    });
  }, [persons, search, orderCountByPerson]);

  function selectPerson(person: KmsPerson) {
    if (props.mode === 'filter') {
      props.onSelectFilter(person.id === props.selectedPersonId ? null : person.id);
      onClose();
      return;
    }
    const isSelected = selectedIds.has(person.id);
    if (isSelected) {
      props.onChangeAssign(props.selectedPersons.filter((p) => p.id !== person.id));
      return;
    }
    if (capReached) return; // rij hoort al gedimd/disabled te zijn — defensieve no-op
    props.onChangeAssign([...props.selectedPersons, person]);
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed || creating) return;
    if (props.mode === 'assign' && capReached) return;
    setCreating(true);
    const person = await onCreatePerson(trimmed);
    setCreating(false);
    if (!person) return;
    setNewName('');
    if (props.mode === 'filter') {
      props.onSelectFilter(person.id);
      onClose();
    } else {
      props.onChangeAssign([...props.selectedPersons, person]);
    }
  }

  const title = props.mode === 'filter' ? 'Filter op medewerker' : 'Medewerkers toewijzen';

  return (
    <>
      <style>{`
        .kms-person-sheet {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: ${kmsColors.surface};
          border-radius: 18px 18px 0 0;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          transform: translateY(100%);
          transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kms-person-sheet.open { transform: translateY(0); }
        .kms-person-sheet-list { overflow-y: auto; scrollbar-width: none; }
        .kms-person-sheet-list::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 600,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 350ms ease',
          }}
        />
        <div className={`kms-person-sheet${isOpen ? ' open' : ''}`}>
          <div
            style={{
              width: 40, height: 4, borderRadius: 999,
              background: 'rgba(255,255,255,0.15)', margin: '10px auto', flexShrink: 0,
            }}
          />
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 20px 12px', flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: kmsColors.text, fontFamily: kmsFont }}>
              {title}
              {props.mode === 'assign' && (
                <span style={{ fontSize: 12, fontWeight: 600, color: kmsColors.textMuted, marginLeft: 8 }}>
                  {selectedIds.size} / {props.maxSelectable}
                </span>
              )}
            </span>
            <button
              onClick={onClose}
              aria-label="Sluiten"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: kmsColors.surfaceHover, border: 'none',
                color: kmsColors.textSecondary, fontSize: 16, cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam..."
              style={{
                width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 12,
                fontSize: 14, fontFamily: kmsFont, background: kmsColors.bg,
                border: `1.5px solid ${kmsColors.border}`, color: kmsColors.text, outline: 'none',
              }}
            />
          </div>

          {props.mode === 'filter' && props.selectedPersonId && (
            <button
              onClick={() => {
                props.onSelectFilter(null);
                onClose();
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: kmsFont, flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `1.5px dashed ${kmsColors.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: kmsColors.textMuted, fontSize: 18,
                }}
              >
                –
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: kmsColors.textSecondary }}>
                Filter wissen
              </span>
            </button>
          )}

          <div className="kms-person-sheet-list" style={{ padding: '0 20px 24px' }}>
            {filteredSorted.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: kmsColors.textMuted, fontFamily: kmsFont }}>
                Geen medewerker gevonden
              </div>
            )}
            {filteredSorted.map((person) => {
              const isSelected = selectedIds.has(person.id);
              const disabled = props.mode === 'assign' && capReached && !isSelected;
              const count = orderCountByPerson.get(person.id) ?? 0;
              return (
                <button
                  key={person.id}
                  onClick={() => selectPerson(person)}
                  disabled={disabled}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '10px 8px', borderRadius: 12,
                    background: isSelected ? 'rgba(0,160,200,0.08)' : 'transparent',
                    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'left', fontFamily: kmsFont,
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? kmsColors.cyan : kmsColors.surfaceHover,
                      color: isSelected ? kmsColors.bg : kmsColors.textSecondary,
                      fontWeight: 700, fontSize: 13,
                    }}
                  >
                    {personInitials(person.name)}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: kmsColors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {person.name}
                    </div>
                    <div style={{ fontSize: 11, color: count > 0 ? kmsColors.cyan : kmsColors.textFaint, marginTop: 2 }}>
                      {count > 0 ? `${count}× eerder besteld` : 'nog niets besteld'}
                    </div>
                  </span>
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={kmsColors.cyan} strokeWidth="2.5" style={{ flexShrink: 0 }}>
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: '12px 20px 20px', borderTop: `1px solid ${kmsColors.border}`, flexShrink: 0 }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleCreate();
                }
              }}
              placeholder="Nieuwe naam..."
              style={{
                flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px 14px',
                border: `1.5px solid ${kmsColors.border}`, borderRadius: 10, fontSize: 13,
                fontFamily: kmsFont, background: kmsColors.bg, color: kmsColors.text, outline: 'none',
              }}
            />
            <button
              onClick={() => void handleCreate()}
              disabled={creating || !newName.trim() || (props.mode === 'assign' && capReached)}
              style={{
                flexShrink: 0, padding: '10px 16px', borderRadius: 10, border: 'none',
                background: kmsColors.orange, color: '#FFFFFF', fontSize: 13, fontWeight: 600,
                fontFamily: kmsFont,
                cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Toevoegen
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
