// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { formatShortName, personInitials } from './kms-theme';

describe('formatShortName', () => {
  it('voornaam + eerste letter laatste naamdeel + punt', () => {
    expect(formatShortName('Kees van der Meulen')).toBe('Kees M.');
  });

  it('twee naamdelen', () => {
    expect(formatShortName('Jan Jansen')).toBe('Jan J.');
  });

  it('één naamdeel blijft ongewijzigd', () => {
    expect(formatShortName('Cher')).toBe('Cher');
  });

  it('trimt overtollige spaties', () => {
    expect(formatShortName('  Kees   van der Meulen  ')).toBe('Kees M.');
  });
});

describe('personInitials', () => {
  it('eerste letter voornaam + eerste letter laatste naamdeel', () => {
    expect(personInitials('Kees van der Meulen')).toBe('KM');
  });

  it('één naamdeel gebruikt alleen die letter', () => {
    expect(personInitials('Cher')).toBe('C');
  });

  it('lege naam geeft vraagteken', () => {
    expect(personInitials('   ')).toBe('?');
  });
});
