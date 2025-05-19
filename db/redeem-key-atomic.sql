-- Create a function to handle the entire key redemption process atomically
CREATE OR REPLACE FUNCTION redeem_key_atomic(
  user_id_param TEXT,
  key_code_param TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT,
  credits_added INTEGER,
  new_total_credits INTEGER,
  tier TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  key_record RECORD;
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Check if the key exists and is valid
  SELECT * INTO key_record
  FROM keys
  WHERE key_code = key_code_param
  FOR UPDATE;
  
  -- Key not found
  IF key_record IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, 
      'key_not_found'::TEXT, 
      0, 
      0, 
      NULL::TEXT;
    RETURN;
  END IF;
  
  -- Key already redeemed
  IF key_record.is_redeemed THEN
    RETURN QUERY SELECT 
      FALSE, 
      'key_already_redeemed'::TEXT, 
      0, 
      0, 
      key_record.tier;
    RETURN;
  END IF;
  
  -- Key expired
  IF key_record.expires_at IS NOT NULL AND key_record.expires_at < NOW() THEN
    RETURN QUERY SELECT 
      FALSE, 
      'key_expired'::TEXT, 
      0, 
      0, 
      key_record.tier;
    RETURN;
  END IF;
  
  -- Mark the key as redeemed
  UPDATE keys
  SET 
    is_redeemed = TRUE,
    redeemed_by = user_id_param,
    redeemed_at = NOW()
  WHERE id = key_record.id;
  
  -- Get current user credits or create user if doesn't exist
  SELECT credits INTO current_credits
  FROM telegram_users
  WHERE id = user_id_param
  FOR UPDATE;
  
  IF current_credits IS NULL THEN
    -- User doesn't exist, create them
    INSERT INTO telegram_users (id, credits, created_at, updated_at)
    VALUES (user_id_param, key_record.credits, NOW(), NOW());
    
    current_credits := 0;
  END IF;
  
  -- Calculate new credits
  new_credits := current_credits + key_record.credits;
  
  -- Update user credits
  UPDATE telegram_users
  SET 
    credits = new_credits,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Record the redemption
  INSERT INTO key_redemptions (
    key_code,
    user_id,
    credits_added,
    redemption_time,
    tier,
    total_credits_after
  ) VALUES (
    key_code_param,
    user_id_param,
    key_record.credits,
    NOW(),
    key_record.tier,
    new_credits
  );
  
  -- Return success
  RETURN QUERY SELECT 
    TRUE, 
    NULL::TEXT, 
    key_record.credits, 
    new_credits, 
    key_record.tier;
END;
$$;
