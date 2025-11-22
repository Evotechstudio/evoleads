-- Add Safepay-related fields to user_plans table
ALTER TABLE user_plans
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS safepay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_error TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_plans_subscription_id ON user_plans(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_subscription_status ON user_plans(subscription_status);

-- Add comment
COMMENT ON COLUMN user_plans.subscription_id IS 'Safepay subscription ID';
COMMENT ON COLUMN user_plans.safepay_customer_id IS 'Safepay customer ID';
COMMENT ON COLUMN user_plans.subscription_status IS 'Status: inactive, active, payment_failed, cancel_at_period_end, cancelled';
