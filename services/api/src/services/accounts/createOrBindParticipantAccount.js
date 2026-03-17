const normalizeString = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

/**
 * Ensure a participant is bound to an account for billing workflows.
 * Reuses an existing account_members link if present; otherwise creates
 * a default account and binds the participant as a member.
 */
export const createOrBindParticipantAccount = async ({
  supabase,
  participantId,
  participant,
}) => {
  if (!supabase) {
    throw new Error('supabase_not_configured');
  }
  if (!participantId) {
    throw new Error('participant_id_required');
  }

  const { data: existingMembership, error: existingMembershipError } = await supabase
    .from('account_members')
    .select('id, account_id, role')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingMembershipError) {
    throw new Error(`account_members_find_failed:${existingMembershipError.message}`);
  }

  if (existingMembership?.id && existingMembership?.account_id) {
    return {
      accountId: existingMembership.account_id,
      accountMemberId: existingMembership.id,
      accountMemberRole: existingMembership.role ?? 'member',
      createdAccount: false,
      createdMembership: false,
    };
  }

  const accountPayload = {
    status: 'active',
    primary_contact_name: normalizeString(participant?.full_name),
    primary_contact_phone: normalizeString(participant?.phone),
    primary_contact_email: normalizeString(participant?.email),
    notes: 'Auto-created during waiver submission',
  };

  const { data: createdAccount, error: createAccountError } = await supabase
    .from('accounts')
    .insert(accountPayload)
    .select('id')
    .single();

  if (createAccountError || !createdAccount?.id) {
    throw new Error(`accounts_insert_failed:${createAccountError?.message ?? 'missing_account_id'}`);
  }

  const memberPayload = {
    account_id: createdAccount.id,
    participant_id: participantId,
    role: 'member',
  };

  const { data: createdMembership, error: createMembershipError } = await supabase
    .from('account_members')
    .insert(memberPayload)
    .select('id, account_id, role')
    .single();

  if (createMembershipError || !createdMembership?.id) {
    throw new Error(
      `account_members_insert_failed:${createMembershipError?.message ?? 'missing_account_member_id'}`
    );
  }

  return {
    accountId: createdMembership.account_id,
    accountMemberId: createdMembership.id,
    accountMemberRole: createdMembership.role ?? 'member',
    createdAccount: true,
    createdMembership: true,
  };
};

