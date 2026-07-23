import type { Tool, Profile } from '@toolshare/types';

export type VerificationBlocker =
  | { type: 'age_restriction'; required_age: number }
  | { type: 'license_required'; license_type: string }
  | { type: 'identity_not_verified' };

export interface VerificationResult {
  canProceed: boolean;
  blockers: VerificationBlocker[];
}

export function verifyAgeAndLicense(
  tool: Pick<Tool, 'min_age' | 'requires_license' | 'license_type'>,
  profile: Pick<Profile, 'is_identity_verified' | 'is_age_verified'>,
): VerificationResult {
  const blockers: VerificationBlocker[] = [];

  if (!profile.is_identity_verified) {
    blockers.push({ type: 'identity_not_verified' });
  }

  if (tool.min_age > 18 && !profile.is_age_verified) {
    blockers.push({ type: 'age_restriction', required_age: tool.min_age });
  }

  if (tool.requires_license && profile.is_identity_verified && !profile.is_age_verified) {
    blockers.push({
      type: 'license_required',
      license_type: tool.license_type ?? 'required operator license',
    });
  }

  return { canProceed: blockers.length === 0, blockers };
}
