CREATE OR REPLACE FUNCTION deduct_credit(p_user_id TEXT, p_amount INTEGER)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER) AS $$
DECLARE
    v_current_credits INTEGER;
BEGIN
    -- Get the current credits
    SELECT credits INTO v_current_credits
    FROM user_credits
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock the row to prevent race conditions
    
    -- Check if user exists
    IF NOT FOUND THEN
        -- Create user with 0 credits if they don't exist
        INSERT INTO user_credits (user_id, credits)
        VALUES (p_user_id, 0);
        
        v_current_credits := 0;
    END IF;
    
    -- Check if user has enough credits
    IF v_current_credits < p_amount THEN
        RETURN QUERY SELECT FALSE AS success, v_current_credits AS new_balance;
        RETURN;
    END IF;
    
    -- Deduct credits
    UPDATE user_credits
    SET 
        credits = credits - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Return success and new balance
    RETURN QUERY 
    SELECT TRUE AS success, (v_current_credits - p_amount) AS new_balance;
END;
$$ LANGUAGE plpgsql;
