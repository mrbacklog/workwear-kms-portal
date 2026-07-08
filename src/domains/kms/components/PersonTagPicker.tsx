import { useState } from 'react';
import { kmsColors, kmsFont } from '../lib/kms-theme';
import { KmsConfirmDialog } from './KmsConfirmDialog';
import { KmsPersonSheet } from './KmsPersonSheet';
import type { KmsPerson, KmsPersonHistoryRecord } from '../types';

interface PersonTagPickerProps {
  quantity: number;
  selectedPersons: KmsPerson[];
  persons: KmsPerson[];
  history: KmsPersonHistoryRecord[];
  onChange: (persons: KmsPerson[]) => void;
  onCreatePerson: (name: string) => Promise<KmsPerson | null>;
  onDeletePerson: (id: string) => Promise<boolean>;
}

/**
 * Inline personen-tag-picker voor een bestelregel in OrderSummary.
 * Sinds Revisie 2: dun geworden — de eigen inline-aanmaak/kies-UI is vervangen door de
 * gedeelde KmsPersonSheet (mode="assign"), met een cap op de bestelde hoeveelheid.
 */
export function PersonTagPicker({
  quantity,
  selectedPersons,
  persons,
  history,
  onChange,
  onCreatePerson,
  onDeletePerson: _onDeletePerson,
}: PersonTagPickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingUntag, setPendingUntag] = useState<KmsPerson | null>(null);

  // Alleen waarschuwen als er MEER personen getagd zijn dan besteld — dat kan nooit kloppen.
  // Minder personen dan de bestelde hoeveelheid is een normale, geldige situatie (niet iedere
  // regel hoeft 1-op-1 aan een persoon gekoppeld te zijn).
  const mismatch = selectedPersons.length > quantity;

  function removePersonFromRow(person: KmsPerson) {
    onChange(selectedPersons.filter((p) => p.id !== person.id));
  }

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {selectedPersons.map((person) => (
          <span
            key={person.id}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 999,
              background: kmsColors.surfaceHover, border: `1px solid ${kmsColors.border}`,
              fontSize: 11, color: kmsColors.textSecondary, fontFamily: kmsFont,
            }}
          >
            {person.name}
            <button
              type="button"
              onClick={() => setPendingUntag(person)}
              aria-label={`Verwijder ${person.name} van deze regel`}
              style={{ background: 'none', border: 'none', color: kmsColors.textMuted, cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 13 }}
            >
              &times;
            </button>
          </span>
        ))}

        {mismatch && (
          <span
            title="Meer personen getagd dan de bestelde hoeveelheid"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%',
              background: 'rgba(241,142,0,0.15)', color: kmsColors.orange,
              fontSize: 10, fontWeight: 700, fontFamily: kmsFont,
            }}
          >
            !
          </span>
        )}

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          style={{
            background: 'none', border: `1px dashed ${kmsColors.border}`, borderRadius: 999,
            padding: '3px 8px', fontSize: 11, color: kmsColors.textMuted, cursor: 'pointer',
            fontFamily: kmsFont,
          }}
        >
          + medewerker
        </button>
      </div>

      <KmsPersonSheet
        mode="assign"
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        persons={persons}
        history={history}
        onCreatePerson={onCreatePerson}
        selectedPersons={selectedPersons}
        maxSelectable={quantity}
        onChangeAssign={onChange}
      />

      <KmsConfirmDialog
        open={pendingUntag !== null}
        title="Medewerker van regel verwijderen"
        description={
          pendingUntag
            ? `Weet u zeker dat u "${pendingUntag.name}" van deze bestelregel wilt verwijderen?`
            : undefined
        }
        confirmLabel="Verwijderen"
        variant="destructive"
        onConfirm={() => {
          if (pendingUntag) removePersonFromRow(pendingUntag);
          setPendingUntag(null);
        }}
        onCancel={() => setPendingUntag(null)}
      />
    </div>
  );
}
