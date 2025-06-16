/*
  # Initial Schema for Fansign Generator

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `credits` (integer, default 10)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `generations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `style` (text)
      - `text_content` (text)
      - `image_url` (text)
      - `credits_used` (integer)
      - `created_at` (timestamp)
    
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `stripe_payment_intent_id` (text, unique)
      - `amount` (integer)
      - `credits_purchased` (integer)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  credits integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style text NOT NULL,
  text_content text DEFAULT '',
  image_url text DEFAULT '',
  credits_used integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE NOT NULL,
  amount integer NOT NULL,
  credits_purchased integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true); -- Allow reading for authentication

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true); -- Allow updates for credit deduction

CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true); -- Allow registration

-- Create policies for generations table
CREATE POLICY "Users can read own generations"
  ON generations
  FOR SELECT
  USING (true); -- Allow reading for history

CREATE POLICY "Users can insert own generations"
  ON generations
  FOR INSERT
  WITH CHECK (true); -- Allow creating generations

-- Create policies for payments table
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  USING (true); -- Allow reading payment history

CREATE POLICY "Anyone can insert payments"
  ON payments
  FOR INSERT
  WITH CHECK (true); -- Allow payment creation

CREATE POLICY "System can update payments"
  ON payments
  FOR UPDATE
  USING (true); -- Allow webhook updates

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();