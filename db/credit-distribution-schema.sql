-- Create tables for credit distribution system

-- Drop existing tables if needed for clean setup
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS distribution_keys CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;

-- Table for user credits
CREATE TABLE IF NOT EXISTS user_credits (
    user_id TEXT PRIMARY KEY,
    credits INTEGER NOT NULL DEFAULT 0,
    total_credits_received INTEGER NOT NULL DEFAULT 0,
    total_credits_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for distribution keys
CREATE TABLE IF NOT EXISTS distribution_keys (
    id SERIAL PRIMARY KEY,
    key_code TEXT UNIQUE NOT NULL,
    credits_value INTEGER NOT NULL DEFAULT 0,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    used_by TEXT REFERENCES user_credits(user_id),
    created_by TEXT,
    key_type TEXT NOT NULL DEFAULT 'STANDARD',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table for credit transactions (audit trail)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_credits(user_id),
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    key_code TEXT REFERENCES distribution_keys(key_code),
    admin_id TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Function to generate a new distribution key
CREATE OR REPLACE FUNCTION generate_distribution_key(
    p_credits_value INTEGER,
    p_key_type TEXT DEFAULT 'STANDARD',
    p_admin_id TEXT DEFAULT NULL
) RETURNS TEXT AS $$
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
    
    -- Generate a unique key code
    LOOP
        v_key_code := v_prefix || '-' || 
                      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4)) || '-' ||
                      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 5 FOR 4)) || '-' ||
                      UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 9 FOR 4));
                      
        -- Check if key already exists
        IF NOT EXISTS (SELECT 1 FROM distribution_keys WHERE key_code = v_key_code) THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Insert the new key
    INSERT INTO distribution_keys (
        key_code,
        credits_value,
        key_type,
        created_by
    ) VALUES (
        v_key_code,
        p_credits_value,
        p_key_type,
        p_admin_id
    );
    
    RETURN v_key_code;
END;
$$ LANGUAGE plpgsql;

-- Function to assign credits to a user using a key (atomic operation)
CREATE OR REPLACE FUNCTION assign_credits_with_key(
    p_user_id TEXT,
    p_key_code TEXT,
    p_admin_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_key_id INTEGER;
    v_key_type TEXT;
    v_credits_value INTEGER;
    v_is_active BOOLEAN;
    v_is_used BOOLEAN;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_current_credits INTEGER;
    v_new_credits INTEGER;
BEGIN
    -- Start transaction to ensure atomicity
    BEGIN
        -- Check if key exists and get its details
        SELECT id, key_type, credits_value, is_active, is_used, expires_at
        INTO v_key_id, v_key_type, v_credits_value, v_is_active, v_is_used, v_expires_at
        FROM distribution_keys
        WHERE key_code = p_key_code
        FOR UPDATE; -- Lock the row to prevent concurrent modifications
        
        -- If key doesn't exist
        IF v_key_id IS NULL THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'message', 'Invalid key code. Please check and try again.'
            );
        END IF;
        
        -- If key is not active
        IF NOT v_is_active THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'message', 'This key is not active.'
            );
        END IF;
        
        -- If key is already used
        IF v_is_used THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'message', 'This key has already been used.'
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
        INSERT INTO user_credits (user_id, credits, total_credits_received, total_credits_used)
        VALUES (p_user_id, 0, 0, 0)
        ON CONFLICT (user_id) 
        DO NOTHING;
        
        -- Get current user credits
        SELECT credits INTO v_current_credits
        FROM user_credits
        WHERE user_id = p_user_id
        FOR UPDATE; -- Lock the row to prevent concurrent modifications
        
        -- Add credits to user
        v_new_credits := v_current_credits + v_credits_value;
        
        UPDATE user_credits
        SET credits = v_new_credits,
            total_credits_received = total_credits_received + v_credits_value,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Mark key as used
        UPDATE distribution_keys
        SET is_used = TRUE,
            used_at = NOW(),
            used_by = p_user_id
        WHERE id = v_key_id;
        
        -- Record the transaction
        INSERT INTO credit_transactions (
            user_id,
            amount,
            transaction_type,
            key_code,
            admin_id,
            description
        ) VALUES (
            p_user_id,
            v_credits_value,
            'KEY_REDEMPTION',
            p_key_code,
            p_admin_id,
            'Credits assigned using key ' || p_key_code
        );
        
        -- Return success
        RETURN jsonb_build_object(
            'success', TRUE,
            'message', 'Credits assigned successfully!',
            'credits_added', v_credits_value,
            'new_credits', v_new_credits,
            'key_type', v_key_type
        );
    EXCEPTION WHEN OTHERS THEN
        -- Handle any errors
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'An error occurred: ' || SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to directly assign credits to a user by admin
CREATE OR REPLACE FUNCTION admin_assign_credits(
    p_user_id TEXT,
    p_amount INTEGER,
    p_admin_id TEXT,
    p_description TEXT DEFAULT 'Admin credit assignment'
) RETURNS JSONB AS $$
DECLARE
    v_current_credits INTEGER;
    v_new_credits INTEGER;
BEGIN
    -- Start transaction to ensure atomicity
    BEGIN
        -- Check if user exists, create if not
        INSERT INTO user_credits (user_id, credits, total_credits_received, total_credits_used)
        VALUES (p_user_id, 0, 0, 0)
        ON CONFLICT (user_id) 
        DO NOTHING;
        
        -- Get current user credits
        SELECT credits INTO v_current_credits
        FROM user_credits
        WHERE user_id = p_user_id
        FOR UPDATE; -- Lock the row to prevent concurrent modifications
        
        -- Add credits to user
        v_new_credits := v_current_credits + p_amount;
        
        UPDATE user_credits
        SET credits = v_new_credits,
            total_credits_received = total_credits_received + p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Record the transaction
        INSERT INTO credit_transactions (
            user_id,
            amount,
            transaction_type,
            admin_id,
            description
        ) VALUES (
            p_user_id,
            p_amount,
            'ADMIN_ASSIGNMENT',
            p_admin_id,
            p_description
        );
        
        -- Return success
        RETURN jsonb_build_object(
            'success', TRUE,
            'message', 'Credits assigned successfully!',
            'credits_added', p_amount,
            'new_credits', v_new_credits
        );
    EXCEPTION WHEN OTHERS THEN
        -- Handle any errors
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'An error occurred: ' || SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to use credits
CREATE OR REPLACE FUNCTION use_credits(
    p_user_id TEXT,
    p_amount INTEGER DEFAULT 1,
    p_description TEXT DEFAULT 'Image generation'
) RETURNS JSONB AS $$
DECLARE
    v_current_credits INTEGER;
    v_new_credits INTEGER;
BEGIN
    -- Start transaction to ensure atomicity
    BEGIN
        -- Get current user credits
        SELECT credits INTO v_current_credits
        FROM user_credits
        WHERE user_id = p_user_id
        FOR UPDATE; -- Lock the row to prevent concurrent modifications
        
        -- If user doesn't exist or not enough credits
        IF v_current_credits IS NULL THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'message', 'User not found.',
                'current_credits', 0
            );
        END IF;
        
        IF v_current_credits < p_amount THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'message', 'Insufficient credits.',
                'current_credits', v_current_credits,
                'required_credits', p_amount
            );
        END IF;
        
        -- Deduct credits
        v_new_credits := v_current_credits - p_amount;
        
        UPDATE user_credits
        SET credits = v_new_credits,
            total_credits_used = total_credits_used + p_amount,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Record the transaction
        INSERT INTO credit_transactions (
            user_id,
            amount,
            transaction_type,
            description
        ) VALUES (
            p_user_id,
            -p_amount,
            'CREDIT_USAGE',
            p_description
        );
        
        -- Return success
        RETURN jsonb_build_object(
            'success', TRUE,
            'message', 'Credits used successfully.',
            'credits_used', p_amount,
            'remaining_credits', v_new_credits
        );
    EXCEPTION WHEN OTHERS THEN
        -- Handle any errors
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'An error occurred: ' || SQLERRM
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credits(
    p_user_id TEXT
) RETURNS JSONB AS $$
DECLARE
    v_user_record RECORD;
BEGIN
    -- Get user credits
    SELECT * INTO v_user_record
    FROM user_credits
    WHERE user_id = p_user_id;
    
    -- If user doesn't exist
    IF v_user_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', TRUE,
            'user_id', p_user_id,
            'credits', 0,
            'total_received', 0,
            'total_used', 0,
            'exists', FALSE
        );
    END IF;
    
    -- Return user credits
    RETURN jsonb_build_object(
        'success', TRUE,
        'user_id', p_user_id,
        'credits', v_user_record.credits,
        'total_received', v_user_record.total_credits_received,
        'total_used', v_user_record.total_credits_used,
        'created_at', v_user_record.created_at,
        'updated_at', v_user_record.updated_at,
        'exists', TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get credit transaction history for a user
CREATE OR REPLACE FUNCTION get_user_transactions(
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE(
    id INTEGER,
    amount INTEGER,
    transaction_type TEXT,
    key_code TEXT,
    admin_id TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.amount,
        t.transaction_type,
        t.key_code,
        t.admin_id,
        t.description,
        t.created_at,
        t.metadata
    FROM credit_transactions t
    WHERE t.user_id = p_user_id
    ORDER BY t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to validate a key without using it
CREATE OR REPLACE FUNCTION validate_key(
    p_key_code TEXT
) RETURNS JSONB AS $$
DECLARE
    v_key RECORD;
BEGIN
    -- Get key details
    SELECT * INTO v_key
    FROM distribution_keys
    WHERE key_code = p_key_code;
    
    -- If key doesn't exist
    IF v_key IS NULL THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'Invalid key code.'
        );
    END IF;
    
    -- Check if key is active
    IF NOT v_key.is_active THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'This key is not active.',
            'key_type', v_key.key_type,
            'credits_value', v_key.credits_value
        );
    END IF;
    
    -- Check if key is used
    IF v_key.is_used THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'This key has already been used.',
            'key_type', v_key.key_type,
            'credits_value', v_key.credits_value,
            'used_by', v_key.used_by,
            'used_at', v_key.used_at
        );
    END IF;
    
    -- Check if key is expired
    IF v_key.expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'message', 'This key has expired.',
            'key_type', v_key.key_type,
            'credits_value', v_key.credits_value,
            'expires_at', v_key.expires_at
        );
    END IF;
    
    -- Return key details
    RETURN jsonb_build_object(
        'valid', TRUE,
        'message', 'Key is valid.',
        'key_type', v_key.key_type,
        'credits_value', v_key.credits_value,
        'expires_at', v_key.expires_at,
        'created_at', v_key.created_at
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate multiple keys with specific credit values
CREATE OR REPLACE FUNCTION generate_multiple_keys(
    p_admin_id TEXT,
    p_key_counts JSONB
) RETURNS JSONB AS $$
DECLARE
    v_key_code TEXT;
    v_keys JSONB := '[]'::JSONB;
    v_key_type TEXT;
    v_credits INTEGER;
    v_count INTEGER;
    v_key_pair RECORD;
BEGIN
    -- Process each key type and count
    FOR v_key_pair IN 
        SELECT * FROM jsonb_each(p_key_counts)
    LOOP
        v_key_type := v_key_pair.key;
        v_count := (v_key_pair.value->>'count')::INTEGER;
        v_credits := (v_key_pair.value->>'credits')::INTEGER;
        
        -- Generate the specified number of keys
        FOR i IN 1..v_count LOOP
            v_key_code := generate_distribution_key(v_credits, v_key_type, p_admin_id);
            v_keys := v_keys || jsonb_build_object(
                'key_code', v_key_code,
                'key_type', v_key_type,
                'credits', v_credits
            );
        END LOOP;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'keys', v_keys
    );
END;
$$ LANGUAGE plpgsql;
