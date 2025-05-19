-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS redeem_key_direct(TEXT, TEXT);

-- Create a more robust function to handle the entire key redemption process
CREATE OR REPLACE FUNCTION redeem_key_direct(
  p_user_id TEXT,
  p_key_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_key_id INTEGER;
  v_key_credits INTEGER;
  v_key_tier TEXT;
  v_current_credits INTEGER;
  v_new_credits INTEGER;
  v_user_exists BOOLEAN;
  v_result JSONB;
  v_start_time TIMESTAMPTZ;
  v_execution_time INTERVAL;
BEGIN
  -- Record start time for performance monitoring
  v_start_time := clock_timestamp();
  
  -- Input validation
  IF p_user_id IS NULL OR p_user_id = '' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error_code', 'INVALID_USER_ID',
      'message', 'User ID cannot be empty'
    );
  END IF;
  
  IF p_key_code IS NULL OR p_key_code = '' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error_code', 'INVALID_KEY_CODE',
      'message', 'Key code cannot be empty'
    );
  END IF;

  -- Start a transaction with a timeout
  BEGIN;
    -- Set a statement timeout of 10 seconds to prevent hanging transactions
    SET LOCAL statement_timeout = '10s';
    
    -- Check if the key exists
    SELECT id, credits, tier INTO v_key_id, v_key_credits, v_key_tier
    FROM keys
    WHERE key_code = p_key_code
    FOR UPDATE NOWAIT; -- Use NOWAIT to fail immediately if locked
    
    -- Key not found
    IF v_key_id IS NULL THEN
      ROLLBACK;
      RETURN jsonb_build_object(
        'success', FALSE,
        'error_code', 'KEY_NOT_FOUND',
        'message', 'Key not found. Please check the key and try again.'
      );
    END IF;
    
    -- Check if key is already redeemed
    IF EXISTS (SELECT 1 FROM keys WHERE id = v_key_id AND is_redeemed = TRUE) THEN
      ROLLBACK;
      RETURN jsonb_build_object(
        'success', FALSE,
        'error_code', 'KEY_ALREADY_REDEEMED',
        'message', 'This key has already been redeemed.'
      );
    END IF;
    
    -- Check if key is expired
    IF EXISTS (SELECT 1 FROM keys WHERE id = v_key_id AND expires_at IS NOT NULL AND expires_at < NOW()) THEN
      ROLLBACK;
      RETURN jsonb_build_object(
        'success', FALSE,
        'error_code', 'KEY_EXPIRED',
        'message', 'This key has expired.'
      );
    END IF;
    
    -- Mark the key as redeemed
    UPDATE keys
    SET 
      is_redeemed = TRUE,
      redeemed_by = p_user_id,
      redeemed_at = NOW()
    WHERE id = v_key_id;
    
    -- Check if user exists
    SELECT EXISTS(
      SELECT 1 FROM telegram_users WHERE id = p_user_id
    ) INTO v_user_exists;
    
    -- Get current user credits or default to 0
    IF v_user_exists THEN
      SELECT credits INTO v_current_credits
      FROM telegram_users
      WHERE id = p_user_id
      FOR UPDATE NOWAIT; -- Use NOWAIT to fail immediately if locked
      
      -- Handle NULL credits
      IF v_current_credits IS NULL THEN
        v_current_credits := 0;
      END IF;
    ELSE
      v_current_credits := 0;
    END IF;
    
    -- Calculate new credits
    v_new_credits := v_current_credits + v_key_credits;
    
    -- Update or insert user
    IF v_user_exists THEN
      UPDATE telegram_users
      SET 
        credits = v_new_credits,
        updated_at = NOW()
      WHERE id = p_user_id;
    ELSE
      INSERT INTO telegram_users (id, credits, created_at, updated_at)
      VALUES (p_user_id, v_new_credits, NOW(), NOW());
    END IF;
    
    -- Record the redemption
    INSERT INTO key_redemptions (
      key_code,
      user_id,
      credits_added,
      redemption_time,
      tier,
      total_credits_after
    ) VALUES (
      p_key_code,
      p_user_id,
      v_key_credits,
      NOW(),
      v_key_tier,
      v_new_credits
    );
    
  -- Commit the transaction
  COMMIT;
  
  -- Calculate execution time
  v_execution_time := clock_timestamp() - v_start_time;
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Key redeemed successfully',
    'credits_added', v_key_credits,
    'new_credits', v_new_credits,
    'tier', v_key_tier,
    'execution_time_ms', EXTRACT(MILLISECOND FROM v_execution_time)
  );
  
EXCEPTION
  WHEN lock_not_available THEN
    -- Handle lock contention
    ROLLBACK;
    RETURN jsonb_build_object(
      'success', FALSE,
      'error_code', 'LOCK_CONTENTION',
      'message', 'Another operation is in progress. Please try again in a few moments.'
    );
  
  WHEN statement_timeout THEN
    -- Handle timeout
    ROLLBACK;
    RETURN jsonb_build_object(
      'success', FALSE,
      'error_code', 'TRANSACTION_TIMEOUT',
      'message', 'The operation timed out. Please try again.'
    );
    
  WHEN OTHERS THEN
    -- Rollback on any other error
    ROLLBACK;
    
    -- Return detailed error information
    RETURN jsonb_build_object(
      'success', FALSE,
      'error_code', 'DB_ERROR',
      'message', 'Database error occurred. Please try again.',
      'details', SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$$;

-- Add a comment to the function
COMMENT ON FUNCTION redeem_key_direct(TEXT, TEXT) IS 'Redeems a key for a user in a single atomic transaction with robust error handling';

-- Test the function with a simple case
DO $$
BEGIN
  -- Only run this test in development environments
  IF current_setting('app.environment', TRUE) = 'development' THEN
    RAISE NOTICE 'Testing redeem_key_direct function...';
    
    -- Create a test key if it doesn't exist
    INSERT INTO keys (key_code, credits, tier, created_at)
    VALUES ('TEST-1234-5678-9ABC', 100, 'STANDARD', NOW())
    ON CONFLICT (key_code) DO NOTHING;
    
    -- Test the function
    RAISE NOTICE 'Test result: %', redeem_key_direct('test-user-123', 'TEST-1234-5678-9ABC');
  END IF;
END;
$$;
