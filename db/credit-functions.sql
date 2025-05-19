-- Create function to get user credits with row locking for updates
CREATE OR REPLACE FUNCTION get_user_credits_for_update(user_id_param TEXT)
RETURNS TABLE (
  id TEXT,
  credits INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT tu.id, tu.credits
  FROM telegram_users tu
  WHERE tu.id = user_id_param
  FOR UPDATE;
END;
$$;

-- Create function to use a credit with proper error handling
CREATE OR REPLACE FUNCTION use_credit(user_id_param TEXT, credit_amount_param INTEGER)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_credits INTEGER;
  new_credit_balance INTEGER;
BEGIN
  -- Get the current credits with a lock
  SELECT credits INTO current_credits
  FROM telegram_users
  WHERE id = user_id_param
  FOR UPDATE;
  
  -- Handle case where user doesn't exist
  IF current_credits IS NULL THEN
    -- Create the user with 0 credits
    INSERT INTO telegram_users (id, credits, created_at, updated_at)
    VALUES (user_id_param, 0, NOW(), NOW());
    
    RETURN QUERY SELECT FALSE, 0, 'User did not exist, created with 0 credits';
    RETURN;
  END IF;
  
  -- Check if user has enough credits
  IF current_credits < credit_amount_param THEN
    RETURN QUERY SELECT FALSE, current_credits, 'Insufficient credits';
    RETURN;
  END IF;
  
  -- Deduct the credits
  new_credit_balance := current_credits - credit_amount_param;
  
  -- Update the user's credits
  UPDATE telegram_users
  SET 
    credits = new_credit_balance,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Return success
  RETURN QUERY SELECT TRUE, new_credit_balance, NULL::TEXT;
END;
$$;

-- Function to add credits atomically
CREATE OR REPLACE FUNCTION add_credits(user_id_param TEXT, credit_amount_param INTEGER)
RETURNS TABLE (
  success BOOLEAN,
  new_credits INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_credits INTEGER;
  new_credit_balance INTEGER;
BEGIN
  -- Get the current credits with a lock
  SELECT credits INTO current_credits
  FROM telegram_users
  WHERE id = user_id_param
  FOR UPDATE;
  
  -- Handle case where user doesn't exist
  IF current_credits IS NULL THEN
    -- Create the user with the provided credits
    INSERT INTO telegram_users (id, credits, created_at, updated_at)
    VALUES (user_id_param, credit_amount_param, NOW(), NOW());
    
    RETURN QUERY SELECT TRUE, credit_amount_param, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Add the credits
  new_credit_balance := current_credits + credit_amount_param;
  
  -- Update the user's credits
  UPDATE telegram_users
  SET 
    credits = new_credit_balance,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Return success
  RETURN QUERY SELECT TRUE, new_credit_balance, NULL::TEXT;
END;
$$;
