-- Function to redeem a key and convert it directly to credits
CREATE OR REPLACE FUNCTION redeem_key(
    p_user_id TEXT,
    p_key_code TEXT
) RETURNS JSONB AS $$
DECLARE
    v_key_record RECORD;
    v_credits INTEGER;
    v_current_credits INTEGER;
    v_new_credits INTEGER;
    v_key_type TEXT;
BEGIN
    -- Check if the key exists and is valid
    SELECT * INTO v_key_record
    FROM api_keys
    WHERE key_code = p_key_code
    FOR UPDATE; -- Lock the row to prevent concurrent modifications
    
    -- If key doesn't exist
    IF v_key_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid key. Please check and try again.'
        );
    END IF;
    
    -- If key is already used
    IF v_key_record.is_used THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has already been used.'
        );
    END IF;
    
    -- If key is expired
    IF v_key_record.expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has expired.'
        );
    END IF;
    
    -- If key is not active
    IF NOT v_key_record.is_active THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key is not active.'
        );
    END IF;
    
    -- Determine credits based on key type
    v_key_type := v_key_record.tier;
    
    CASE v_key_type
        WHEN 'BASIC' THEN v_credits := 10;
        WHEN 'STANDARD' THEN v_credits := 25;
        WHEN 'PREMIUM' THEN v_credits := 50;
        WHEN 'UNLIMITED' THEN v_credits := 100;
        ELSE v_credits := 5; -- Default for unknown types
    END CASE;
    
    -- Get current user credits
    SELECT credits INTO v_current_credits
    FROM user_credits
    WHERE user_id = p_user_id;
    
    -- If user doesn't exist in credits table, create entry
    IF v_current_credits IS NULL THEN
        INSERT INTO user_credits (user_id, credits)
        VALUES (p_user_id, 0)
        RETURNING credits INTO v_current_credits;
    END IF;
    
    -- Add credits to user
    v_new_credits := v_current_credits + v_credits;
    
    UPDATE user_credits
    SET credits = v_new_credits,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Mark key as used
    UPDATE api_keys
    SET is_used = TRUE,
        used_at = NOW(),
        used_by = p_user_id
    WHERE key_code = p_key_code;
    
    -- Record the transaction
    INSERT INTO credit_transactions (
        user_id,
        amount,
        transaction_type,
        key_code,
        description
    ) VALUES (
        p_user_id,
        v_credits,
        'KEY_REDEMPTION',
        p_key_code,
        'Credits added from key ' || p_key_code
    );
    
    -- Return success
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Key redeemed successfully!',
        'creditsAdded', v_credits,
        'newCredits', v_new_credits,
        'keyType', v_key_type
    );
EXCEPTION WHEN OTHERS THEN
    -- Handle any errors
    RETURN jsonb_build_object(
        'success', FALSE,
        'message', 'An error occurred: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Make sure we have the necessary tables
CREATE TABLE IF NOT EXISTS user_credits (
    user_id TEXT PRIMARY KEY,
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    key_code TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to api_keys table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'api_keys' AND column_name = 'used_by') THEN
        ALTER TABLE api_keys ADD COLUMN used_by TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'api_keys' AND column_name = 'used_at') THEN
        ALTER TABLE api_keys ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
    END IF;
END$$;
