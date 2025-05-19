-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS key_redemptions;
DROP TABLE IF EXISTS keys;
DROP TABLE IF EXISTS user_credits;

-- Create a simple table for users and their credits
CREATE TABLE user_credits (
    user_id TEXT PRIMARY KEY,
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for keys with generation allowances
CREATE TABLE keys (
    id SERIAL PRIMARY KEY,
    key_code TEXT UNIQUE NOT NULL,
    generations_allowed INTEGER NOT NULL,
    generations_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by TEXT REFERENCES user_credits(user_id),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT TRUE,
    key_type TEXT NOT NULL DEFAULT 'STANDARD'
);

-- Create a table to track key redemptions
CREATE TABLE key_redemptions (
    id SERIAL PRIMARY KEY,
    key_id INTEGER NOT NULL REFERENCES keys(id),
    user_id TEXT NOT NULL REFERENCES user_credits(user_id),
    credits_added INTEGER NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table to track key usage
CREATE TABLE key_usage (
    id SERIAL PRIMARY KEY,
    key_id INTEGER NOT NULL REFERENCES keys(id),
    user_id TEXT NOT NULL REFERENCES user_credits(user_id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    endpoint TEXT,
    details JSONB
);

-- Create a function to handle key redemption
CREATE OR REPLACE FUNCTION redeem_key(p_user_id TEXT, p_key_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_key_id INTEGER;
    v_generations_allowed INTEGER;
    v_key_type TEXT;
    v_is_used BOOLEAN;
    v_is_active BOOLEAN;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_result JSONB;
BEGIN
    -- Check if key exists and get its details
    SELECT id, generations_allowed, key_type, is_used, is_active, expires_at
    INTO v_key_id, v_generations_allowed, v_key_type, v_is_used, v_is_active, v_expires_at
    FROM keys
    WHERE key_code = p_key_code;
    
    -- If key doesn't exist
    IF v_key_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid key code. Please check and try again.'
        );
    END IF;
    
    -- If key is already used
    IF v_is_used THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has already been used.'
        );
    END IF;
    
    -- If key is inactive
    IF NOT v_is_active THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key is inactive.'
        );
    END IF;
    
    -- If key is expired
    IF v_expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has expired.'
        );
    END IF;
    
    -- Check if user exists, create if not
    INSERT INTO user_credits (user_id, credits)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Mark key as used
    UPDATE keys
    SET is_used = TRUE,
        used_at = NOW(),
        used_by = p_user_id
    WHERE id = v_key_id;
    
    -- Add credits to user
    UPDATE user_credits 
    SET credits = credits + v_generations_allowed,
        updated_at = NOW() 
    WHERE user_id = p_user_id;
    
    -- Record the redemption
    INSERT INTO key_redemptions (key_id, user_id, credits_added)
    VALUES (v_key_id, p_user_id, v_generations_allowed);
    
    -- Get updated credit count
    SELECT jsonb_build_object(
        'success', TRUE,
        'message', 'Key redeemed successfully!',
        'credits_added', v_generations_allowed,
        'new_credits', (SELECT credits FROM user_credits WHERE user_id = p_user_id),
        'key_type', v_key_type
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to use credits
CREATE OR REPLACE FUNCTION use_credits(p_user_id TEXT, p_amount INTEGER DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
    v_credits INTEGER;
    v_new_credits INTEGER;
BEGIN
    -- Get current credits
    SELECT credits INTO v_credits FROM user_credits WHERE user_id = p_user_id;
    
    -- If user doesn't exist or not enough credits, return false
    IF v_credits IS NULL OR v_credits < p_amount THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Insufficient credits.',
            'current_credits', COALESCE(v_credits, 0)
        );
    END IF;
    
    -- Deduct credits
    UPDATE user_credits 
    SET credits = credits - p_amount, 
        updated_at = NOW() 
    WHERE user_id = p_user_id
    RETURNING credits INTO v_new_credits;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Credits used successfully.',
        'credits_used', p_amount,
        'remaining_credits', v_new_credits
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate keys with specific allowances
CREATE OR REPLACE FUNCTION generate_key(p_generations_allowed INTEGER, p_key_type TEXT DEFAULT 'STANDARD')
RETURNS TEXT AS $$
DECLARE
    v_key_code TEXT;
    v_prefix TEXT;
BEGIN
    -- Set prefix based on key type
    CASE p_key_type
        WHEN 'BASIC' THEN v_prefix := 'BAS';
        WHEN 'STANDARD' THEN v_prefix := 'STD';
        WHEN 'PREMIUM' THEN v_prefix := 'PRE';
        WHEN 'UNLIMITED' THEN v_prefix := 'UNL';
        ELSE v_prefix := 'KEY';
    END CASE;
    
    -- Generate a random key code in format XXX-XXXX-XXXX-XXXX
    v_key_code := 
        v_prefix || '-' ||
        UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' ||
        UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 5 FOR 4)) || '-' ||
        UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 9 FOR 4));
    
    -- Insert the key
    INSERT INTO keys (key_code, generations_allowed, key_type)
    VALUES (v_key_code, p_generations_allowed, p_key_type);
    
    -- Return the key
    RETURN v_key_code;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check key validity and remaining generations
CREATE OR REPLACE FUNCTION check_key(p_key_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_key RECORD;
BEGIN
    -- Get key details
    SELECT * INTO v_key FROM keys WHERE key_code = p_key_code;
    
    -- If key doesn't exist
    IF v_key IS NULL THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'Invalid key code.'
        );
    END IF;
    
    -- Return key details
    RETURN jsonb_build_object(
        'valid', TRUE,
        'key_type', v_key.key_type,
        'generations_allowed', v_key.generations_allowed,
        'generations_used', v_key.generations_used,
        'generations_remaining', v_key.generations_allowed - v_key.generations_used,
        'is_used', v_key.is_used,
        'is_active', v_key.is_active,
        'expires_at', v_key.expires_at
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to record key usage
CREATE OR REPLACE FUNCTION record_key_usage(p_key_code TEXT, p_user_id TEXT, p_endpoint TEXT DEFAULT NULL, p_details JSONB DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_key_id INTEGER;
    v_generations_allowed INTEGER;
    v_generations_used INTEGER;
    v_is_active BOOLEAN;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get key details
    SELECT id, generations_allowed, generations_used, is_active, expires_at
    INTO v_key_id, v_generations_allowed, v_generations_used, v_is_active, v_expires_at
    FROM keys
    WHERE key_code = p_key_code;
    
    -- If key doesn't exist
    IF v_key_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Invalid key code.'
        );
    END IF;
    
    -- If key is inactive
    IF NOT v_is_active THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key is inactive.'
        );
    END IF;
    
    -- If key is expired
    IF v_expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has expired.'
        );
    END IF;
    
    -- If key has reached its generation limit
    IF v_generations_used >= v_generations_allowed THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'This key has reached its generation limit.'
        );
    END IF;
    
    -- Record usage
    INSERT INTO key_usage (key_id, user_id, endpoint, details)
    VALUES (v_key_id, p_user_id, p_endpoint, p_details);
    
    -- Increment usage count
    UPDATE keys
    SET generations_used = generations_used + 1
    WHERE id = v_key_id;
    
    -- Return success
    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Key usage recorded successfully.',
        'generations_used', v_generations_used + 1,
        'generations_remaining', v_generations_allowed - (v_generations_used + 1)
    );
END;
$$ LANGUAGE plpgsql;
