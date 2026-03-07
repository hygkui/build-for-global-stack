-- 出海黄金组合 数据库迁移
-- user_id 存储 Neon Auth 的用户 ID（字符串）

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,              -- 'template-code' | 'mvp-service'
  product_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,         -- 价格（分）
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | processing | completed | cancelled
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  -- 技术栈选择（JSON）
  tech_stack JSONB,
  -- $20 代码包下载链接
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,
  -- $200 需求收集
  requirements TEXT,
  requirements_submitted_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 技术栈配置保存（用户可保存自己的配置）
CREATE TABLE IF NOT EXISTS saved_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tech_stack JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_saved_stacks_updated_at
  BEFORE UPDATE ON saved_stacks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_saved_stacks_user_id ON saved_stacks(user_id);
