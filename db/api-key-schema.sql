-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT,
  notes TEXT
);

-- Create API usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_id UUID NOT NULL REFERENCES api_keys(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  count INTEGER NOT NULL DEFAULT 1,
  endpoint TEXT,
  details JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_id ON api_usage(key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);

-- Create function to record API usage
CREATE OR REPLACE FUNCTION record_api_usage(
  p_key TEXT,
  p_endpoint TEXT DEFAULT NULL,
  p_count INTEGER DEFAULT 1,
  p_details JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_key_id UUID;
BEGIN
  -- Get the key ID
  SELECT id INTO v_key_id FROM api_keys WHERE key = p_key AND is_active = TRUE;
  
  IF v_key_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert usage record
  INSERT INTO api_usage (key_id, timestamp, count, endpoint, details)
  VALUES (v_key_id, NOW(), p_count, p_endpoint, p_details);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if a key has reached its daily limit
CREATE OR REPLACE FUNCTION check_key_daily_limit(
  p_key TEXT,
  p_daily_limit INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_key_id UUID;
  v_count INTEGER;
BEGIN
  -- Get the key ID
  SELECT id INTO v_key_id FROM api_keys WHERE key = p_key AND is_active = TRUE;
  
  IF v_key_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If the limit is -1, it means unlimited
  IF p_daily_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Get the daily usage count
  SELECT COALESCE(SUM(count), 0) INTO v_count
  FROM api_usage
  WHERE key_id = v_key_id
    AND timestamp >= DATE_TRUNC('day', NOW());
  
  -- Check if the limit has been reached
  RETURN v_count < p_daily_limit;
END;
$$ LANGUAGE plpgsql;
