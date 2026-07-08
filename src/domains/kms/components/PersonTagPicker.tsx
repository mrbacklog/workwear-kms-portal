import { useState } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { ConfirmDialog } from '@/shared/ui/components/confirm-dialog';
import type { KmsPerson } from '../types';

interface PersonTagPickerProps {
  quantity: number;
  selectedPersons: KmsPerson[];
  availablePersons: KmsPerson[];
  onChange: (persons: KmsPerson[]) => void;
  onCreatePerson: (name: string) => Promise<KmsPerson | null>;
  onDeletePerson: (id: string) => Promise<boolean>;
}

/**
 * Inline personen-tag-picker voor een bestelregel in OrderSummary.
 * Beheer (aanmaken + verwijderen-met-bevestiging) gebeurt uitsluitend hier — geen apart scherm.
 */
export function PersonTagPicker({
  quantity,
  selectedPersons,
  availablePersons,
  onChange,
  onCreatePerson,
  onDeletePerson,
}: PersonTagPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [pendingUntag, setPendingUntag] = useState<KmsPerson | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KmsPerson | null>(null);
  const [creating, setCreating] = useState(false);

  const mismatch = selectedPersons.length > 0 && selectedPersons.length !== quantity;

  function addPerson(person: KmsPerson) {
    if (selectedPersons.some((p) => p.id === person.id)) return;
    onChange([...selectedPersons, person]);
  }

  function removePersonFromRow(person: KmsPerson) {
    onChange(selectedPersons.filter((p) => p.id !== person.id));
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    const person = await onCreatePerson(trimmed);
    setCreating(false);
    if (person) {
      addPerson(person);
      setNewName('');
    }
  }

  const unselectedAvailable = availablePersons.filter(
    (p) => !selectedPersons.some((sp) => sp.id === p.id),
  );

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {selectedPersons.map((person) => (
          <span
            key={person.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 999,
              background: kmsColors.surfaceHover,
              border: `1px solid ${kmsColors.border}`,
              fontSize: 11,
              color: kmsColors.textSecondary,
              fontFamily: kmsFont,
            }}
          >
            {person.name}
            <button
              type="button"
              onClick={() => setPendingUntag(person)}
              aria-label={`Verwijder ${person.name} van deze regel`}
              style={{
                background: 'none',
                border: 'none',
                color: kmsColors.textMuted,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                fontSize: 13,
              }}
            >
              &times;
            </button>
          </span>
        ))}

        {mismatch && (
          <span
            title="Aantal getagde personen komt niet overeen met de bestelde hoeveelheid"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'rgba(241,142,0,0.15)',
              color: kmsColors.orange,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: kmsFont,
            }}
          >
            !
          </span>
        )}

        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          style={{
            background: 'none',
            border: `1px dashed ${kmsColors.border}`,
            borderRadius: 999,
            padding: '3px 8px',
            fontSize: 11,
            color: kmsColors.textMuted,
            cursor: 'pointer',
            fontFamily: kmsFont,
          }}
        >
          + persoon toevoegen
        </button>
      </div>

      {pickerOpen && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: 10,
            background: kmsColors.surface,
            border: `1px solid ${kmsColors.border}`,
          }}
        >
          {unselectedAvailable.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {unselectedAvailable.map((person) => (
                <span
                  key={person.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: kmsColors.surfaceHover,
                    border: `1px solid ${kmsColors.border}`,
                    borderRadius: 999,
                    padding: '3px 8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => addPerson(person)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 11,
                      color: kmsColors.text,
                      cursor: 'pointer',
                      fontFamily: kmsFont,
                    }}
                  >
                    {person.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(person)}
                    aria-label={`Verwijder ${person.name} definitief uit de personenlijst`}
                    title="Verwijder uit personenlijst"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: kmsColors.textMuted,
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                      fontSize: 12,
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
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
                flex: 1,
                padding: '6px 10px',
                border: `1px solid ${kmsColors.border}`,
                borderRadius: 8,
                fontSize: 12,
                fontFamily: kmsFont,
                background: kmsColors.bg,
                color: kmsColors.text,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={creating || !newName.trim()}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                background: kmsColors.orange,
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer',
                fontFamily: kmsFont,
              }}
            >
              Toevoegen
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingUntag !== null}
        title="Persoon van regel verwijderen"
        description={
          pendingUntag
            ? `Weet u zeker dat u "${pendingUntag.name}" van deze bestelregel wilt verwijderen?`
            : undefined
        }
        confirmLabel="Verwijderen"
        variant="destructive"
        onConfirm={() => {
          if (pendingUntag) {
            removePersonFromRow(pendingUntag);
          }
          setPendingUntag(null);
        }}
        onCancel={() => setPendingUntag(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Persoon definitief verwijderen"
        description={
          pendingDelete
            ? `Weet u zeker dat u "${pendingDelete.name}" definitief uit de personenlijst wilt verwijderen? Eerdere bestellingen blijven de naam tonen.`
            : undefined
        }
        confirmLabel="Verwijderen"
        variant="destructive"
        onConfirm={() => {
          if (pendingDelete) {
            void onDeletePerson(pendingDelete.id);
            onChange(selectedPersons.filter((p) => p.id !== pendingDelete.id));
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
