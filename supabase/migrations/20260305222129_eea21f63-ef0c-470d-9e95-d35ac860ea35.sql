ALTER TABLE public.profiles ADD COLUMN vault_verify_ciphertext text, ADD COLUMN vault_verify_iv text;
ALTER TABLE public.teams ADD COLUMN vault_verify_ciphertext text, ADD COLUMN vault_verify_iv text;