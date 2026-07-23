import { describe, it, expect } from 'vitest';
import { verifyAgeAndLicense } from '../src/verifyAgeAndLicense';
import type { Tool, Profile } from '@toolshare/types';

type T = Pick<Tool, 'min_age' | 'requires_license' | 'license_type'>;
type P = Pick<Profile, 'is_identity_verified' | 'is_age_verified'>;

const verifiedProfile: P = { is_identity_verified: true, is_age_verified: true };
const unverifiedProfile: P = { is_identity_verified: false, is_age_verified: false };
const idOnlyProfile: P = { is_identity_verified: true, is_age_verified: false };

const standardTool: T = { min_age: 18, requires_license: false, license_type: null };
const aerialTool: T = { min_age: 21, requires_license: true, license_type: 'Aerial Work Platform' };

describe('verifyAgeAndLicense', () => {
  it('fully verified profile on standard tool can proceed', () => {
    const r = verifyAgeAndLicense(standardTool, verifiedProfile);
    expect(r.canProceed).toBe(true);
    expect(r.blockers).toHaveLength(0);
  });

  it('unverified identity blocks on any tool', () => {
    const r = verifyAgeAndLicense(standardTool, unverifiedProfile);
    expect(r.canProceed).toBe(false);
    expect(r.blockers.some((b) => b.type === 'identity_not_verified')).toBe(true);
  });

  it('21+ tool without age verification blocks', () => {
    const r = verifyAgeAndLicense(aerialTool, idOnlyProfile);
    expect(r.canProceed).toBe(false);
    expect(r.blockers.some((b) => b.type === 'age_restriction')).toBe(true);
  });

  it('21+ tool with full verification can proceed', () => {
    const r = verifyAgeAndLicense(aerialTool, verifiedProfile);
    expect(r.canProceed).toBe(true);
  });

  it('license tool without age verification adds license blocker', () => {
    const r = verifyAgeAndLicense(aerialTool, idOnlyProfile);
    expect(r.blockers.some((b) => b.type === 'license_required')).toBe(true);
  });
});
