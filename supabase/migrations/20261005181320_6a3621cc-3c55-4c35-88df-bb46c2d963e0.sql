CREATE TABLE public.ai_service_state (service text PRIMARY KEY, blocked boolean NOT NULL DEFAULT false, message text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_service_state TO service_role;
ALTER TABLE public.ai_service_state ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER ai_service_state_updated BEFORE UPDATE ON public.ai_service_state FOR EACH ROW EXECUTE FUNCTION public.ai_update_timestamp();