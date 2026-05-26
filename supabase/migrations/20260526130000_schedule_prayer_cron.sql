-- Schedule the send-prayer-push edge function to run every minute via pg_cron + pg_net
-- This is the critical step that actually triggers prayer notifications automatically.
-- Extensions pg_cron and pg_net must already be enabled (done in prior migrations).

-- Safely remove existing schedule if it exists to make this migration re-runnable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prayer-push-notifications') THEN
    PERFORM cron.unschedule('prayer-push-notifications');
  END IF;
END;
$$;

-- Schedule the job to fire every minute
SELECT cron.schedule(
  'prayer-push-notifications',
  '* * * * *',
  $$
    SELECT net.http_post(
      url := 'https://lhdksrflshusknopsrzz.supabase.co/functions/v1/send-prayer-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZGtzcmZsc2h1c2tub3Bzcnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjEzMTMsImV4cCI6MjA4MTIzNzMxM30.ojA3qY26fY9zGFR55EuaDOX0ZClleccwH6y71KdovAg',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZGtzcmZsc2h1c2tub3Bzcnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjEzMTMsImV4cCI6MjA4MTIzNzMxM30.ojA3qY26fY9zGFR55EuaDOX0ZClleccwH6y71KdovAg'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
