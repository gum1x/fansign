/*
  # Add missing payment columns

  1. Changes
    - Add oxapay_track_id column to payments table
    - Add order_id column to payments table
    - Remove stripe_payment_intent_id column (not used)
    - Update indexes for new columns

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to payments table
DO $$
BEGIN
  -- Add oxapay_track_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'oxapay_track_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN oxapay_track_id text;
  END IF;

  -- Add order_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN order_id text;
  END IF;

  -- Remove stripe_payment_intent_id column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE payments DROP COLUMN stripe_payment_intent_id;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_payments_oxapay_track_id ON payments(oxapay_track_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);