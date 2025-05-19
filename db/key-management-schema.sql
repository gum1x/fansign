-- Create keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_code VARCHAR(255) NOT NULL UNIQUE,
    key_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    generations_allowed INTEGER NOT NULL DEFAULT 1,
    generations_used INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    redeemed_by VARCHAR(255),
    redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Create key_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS key_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES keys(id),
    user_id VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create function to generate a new key
CREATE OR REPLACE FUNCTION generate_key(
    p_generations_allowed INTEGER DEFAULT 1,
    p_key_type VARCHAR DEFAULT 'STANDARD'
) RETURNS VARCHAR AS $$
DECLARE
    v_key_code VARCHAR;
    v_prefix VARCHAR;
BEGIN
    -- Set prefix based on key type
    CASE p_key_type
        WHEN 'BASIC' THEN v_prefix := 'BAS';
        WHEN 'STANDARD' THEN v_prefix := 'STD';
        WHEN 'PREMIUM' THEN v_prefix := 'PRE';
        WHEN 'UNLIMITED' THEN v_prefix := 'UNL';
        ELSE v_prefix := 'KEY';
    END CASE;
    
    -- Generate a unique key code
    LOOP
        v_key_code := v_prefix || '-' || 
                      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' ||
                      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' ||
                      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
                      
        -- Check if key already exists
        IF NOT EXISTS (SELECT 1 FROM keys WHERE key_code = v_key_code) THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Insert the new key
    INSERT INTO keys (
        key_code,
        key_type,
        generations_allowed,
        generations_used,
        is_active,
        is_used,
        expires_at
    ) VALUES (
        v_key_code,
        p_key_type,
        p_generations_allowed,
        0,
        TRUE,
        FALSE,
        NOW() + INTERVAL '30 days'
    );
    
    RETURN v_key_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to redeem a key
CREATE OR REPLACE FUNCTION redeem_key(
    p_user_id VARCHAR,
    p_key_code VARCHAR
) RETURNS JSONB AS $$
DECLARE
    v_key_id UUID;
    v_key_type VARCHAR;
    v_generations_allowed INTEGER;
    v_is_active BOOLEAN;
    v_is_used BOOLEAN;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_credits_added INTEGER;
    v_current_credits INTEGER;
    v_new_credits INTEGER;
BEGIN
    -- Check if key exists
    SELECT id, key_type, generations_allowed, is_active, is_used, expires_at
    INTO v_key_id, v_key_type, v_generations_allowed, v_is_active, v_is_used, v_expires_at
    FROM keys
    WHERE key_code = p_key_code;
    
    -- If key doesn't exist
    IF v_key_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid key code'
        );
    END IF;
    
    -- If key is not active
    IF NOT v_is_active THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key is not active'
        );
    END IF;
    
    -- If key is already used
    IF v_is_used THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has already been used'
        );
    END IF;
    
    -- If key is expired
    IF v_expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has expired'
        );
    END IF;
    
    -- Determine credits to add based on key type
    CASE v_key_type
        WHEN 'BASIC' THEN v_credits_added := v_generations_allowed;
        WHEN 'STANDARD' THEN v_credits_added := v_generations_allowed;
        WHEN 'PREMIUM' THEN v_credits_added := v_generations_allowed;
        WHEN 'UNLIMITED' THEN v_credits_added := v_generations_allowed;
        ELSE v_credits_added := v_generations_allowed;
    END CASE;
    
    -- Get current user credits
    SELECT credits INTO v_current_credits
    FROM telegram_users
    WHERE id = p_user_id;
    
    -- If user doesn't exist, create them
    IF v_current_credits IS NULL THEN
        INSERT INTO telegram_users (id, credits)
        VALUES (p_user_id, 0)
        RETURNING credits INTO v_current_credits;
    END IF;
    
    -- Add credits to user
    v_new_credits := v_current_credits + v_credits_added;
    
    UPDATE telegram_users
    SET credits = v_new_credits
    WHERE id = p_user_id;
    
    -- Mark key as used
    UPDATE keys
    SET is_used = TRUE,
        redeemed_by = p_user_id,
        redeemed_at = NOW()
    WHERE id = v_key_id;
    
    -- Return success
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Key redeemed successfully',
        'credits_added', v_credits_added,
        'new_credits', v_new_credits,
        'key_type', v_key_type
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to check a key
CREATE OR REPLACE FUNCTION check_key(
    p_key_code VARCHAR
) RETURNS JSONB AS $$
DECLARE
    v_key_id UUID;
    v_key_type VARCHAR;
    v_generations_allowed INTEGER;
    v_generations_used INTEGER;
    v_is_active BOOLEAN;
    v_is_used BOOLEAN;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if key exists
    SELECT id, key_type, generations_allowed, generations_used, is_active, is_used, expires_at
    INTO v_key_id, v_key_type, v_generations_allowed, v_generations_used, v_is_active, v_is_used, v_expires_at
    FROM keys
    WHERE key_code = p_key_code;
    
    -- If key doesn't exist
    IF v_key_id IS NULL THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'Invalid key code'
        );
    END IF;
    
    -- Return key details
    RETURN jsonb_build_object(
        'valid', TRUE,
        'message', 'Key is valid',
        'key_type', v_key_type,
        'generations_allowed', v_generations_allowed,
        'generations_used', v_generations_used,
        'generations_remaining', v_generations_allowed - v_generations_used,
        'is_active', v_is_active,
        'is_used', v_is_used,
        'expires_at', v_expires_at
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to record key usage
CREATE OR REPLACE FUNCTION record_key_usage(
    p_key_code VARCHAR,
    p_user_id VARCHAR,
    p_endpoint VARCHAR DEFAULT NULL,
    p_details JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_key_id UUID;
    v_key_type VARCHAR;
    v_generations_allowed INTEGER;
    v_generations_used INTEGER;
    v_is_active BOOLEAN;
    v_is_used BOOLEAN;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if key exists
    SELECT id, key_type, generations_allowed, generations_used, is_active, is_used, expires_at
    INTO v_key_id, v_key_type, v_generations_allowed, v_generations_used, v_is_active, v_is_used, v_expires_at
    FROM keys
    WHERE key_code = p_key_code;
    
    -- If key doesn't exist
    IF v_key_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid key code'
        );
    END IF;
    
    -- If key is not active
    IF NOT v_is_active THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key is not active'
        );
    END IF;
    
    -- If key is expired
    IF v_expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has expired'
        );
    END IF;
    
    -- If key has reached usage limit
    IF v_generations_used >= v_generations_allowed THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has reached its usage limit'
        );
    END IF;
    
    -- Record usage
    INSERT INTO key_usage (key_id, user_id, endpoint, details)
    VALUES (v_key_id, p_user_id, p_endpoint, p_details);
    
    -- Increment usage count
    UPDATE keys
    SET generations_used = generations_used + 1
    WHERE id = v_key_id
    RETURNING generations_used INTO v_generations_used;
    
    -- Return success
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Usage recorded successfully',
        'generations_used', v_generations_used,
        'generations_remaining', v_generations_allowed - v_generations_used
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to use credits
CREATE OR REPLACE FUNCTION use_credits(
    p_user_id VARCHAR,
    p_amount INTEGER DEFAULT 1
) RETURNS JSONB AS $$
DECLARE
    v_current_credits INTEGER;
    v_remaining_credits INTEGER;
BEGIN
    -- Get current user credits
    SELECT credits INTO v_current_credits
    FROM telegram_users
    WHERE id = p_user_id;
    
    -- If user doesn't exist
    IF v_current_credits IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'User not found'
        );
    END IF;
    
    -- If not enough credits
    IF v_current_credits < p_amount THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Insufficient credits',
            'credits_needed', p_amount,
            'credits_available', v_current_credits
        );
    END IF;
    
    -- Deduct credits
    v_remaining_credits := v_current_credits - p_amount;
    
    UPDATE telegram_users
    SET credits = v_remaining_credits
    WHERE id = p_user_id;
    
    -- Return success
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Credits used successfully',
        'credits_used', p_amount,
        'remaining_credits', v_remaining_credits
    );
END;
$$ LANGUAGE plpgsql;
