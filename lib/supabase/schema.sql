-- =====================================================
-- LOOKAL MARKETPLACE - CLEAN SETUP
-- =====================================================
-- This script safely handles existing tables and policies

-- =====================================================
-- DROP EXISTING POLICIES (if they exist)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all operations on messages" ON messages;
DROP POLICY IF EXISTS "Allow all operations on store_settings" ON store_settings;

-- =====================================================
-- CREATE TABLES (IF NOT EXISTS)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_name TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped')),
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name TEXT NOT NULL,
  buyer_image TEXT NOT NULL,
  last_message TEXT NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('buyer', 'seller')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  store_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES (IF NOT EXISTS)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE POLICIES (Fresh)
-- =====================================================
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- CREATE TRIGGERS (IF NOT EXISTS)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default store settings (only if empty)
INSERT INTO store_settings (store_name, store_description)
SELECT 'TechStore', 'Premium electronics and accessories'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- Insert sample products (only if empty)
INSERT INTO products (name, price, image, description, stock)
SELECT * FROM (VALUES
  ('Wireless Headphones', 89.99, '/wireless-headphones.png', 'High-quality wireless headphones with noise cancellation', 45),
  ('USB-C Cable', 14.99, '/usb-c-cable.jpg', 'Durable USB-C charging cable, 2 meters', 120),
  ('Phone Stand', 24.99, '/phone-stand.jpg', 'Adjustable phone stand for desk', 78),
  ('Bluetooth Speaker', 59.99, '/bluetooth-speaker.jpg', 'Portable Bluetooth speaker with 12-hour battery', 32)
) AS v(name, price, image, description, stock)
WHERE NOT EXISTS (SELECT 1 FROM products);

-- Insert sample conversations (only if empty)
INSERT INTO conversations (buyer_name, buyer_image, last_message, last_message_at, unread)
SELECT * FROM (VALUES
  ('Maria Santos', '👩‍🦱', 'Great! I''ll place an order soon.', NOW() - INTERVAL '10 minutes', false),
  ('Juan Dela Cruz', '👨‍💼', 'Do you have this in stock?', NOW() - INTERVAL '30 minutes', true),
  ('Ana Rodriguez', '👩', 'Thank you for the fast delivery!', NOW() - INTERVAL '2 hours', false)
) AS v(buyer_name, buyer_image, last_message, last_message_at, unread)
WHERE NOT EXISTS (SELECT 1 FROM conversations);

-- Insert messages for conversations
DO $$
DECLARE
  conv1_id UUID;
  conv2_id UUID;
  conv3_id UUID;
BEGIN
  -- Only insert if messages table is empty
  IF NOT EXISTS (SELECT 1 FROM messages) THEN
    SELECT id INTO conv1_id FROM conversations WHERE buyer_name = 'Maria Santos' LIMIT 1;
    SELECT id INTO conv2_id FROM conversations WHERE buyer_name = 'Juan Dela Cruz' LIMIT 1;
    SELECT id INTO conv3_id FROM conversations WHERE buyer_name = 'Ana Rodriguez' LIMIT 1;

    IF conv1_id IS NOT NULL THEN
      INSERT INTO messages (conversation_id, sender, text, created_at) VALUES
        (conv1_id, 'buyer', 'Hi, do you have any discounts for bulk orders?', NOW() - INTERVAL '1 hour'),
        (conv1_id, 'seller', 'Yes! We offer 10% off for orders over 10 items.', NOW() - INTERVAL '30 minutes'),
        (conv1_id, 'buyer', 'Great! I''ll place an order soon.', NOW() - INTERVAL '10 minutes');
    END IF;

    IF conv2_id IS NOT NULL THEN
      INSERT INTO messages (conversation_id, sender, text, created_at) VALUES
        (conv2_id, 'buyer', 'Hi! Do you have the wireless headphones?', NOW() - INTERVAL '1 hour'),
        (conv2_id, 'seller', 'Yes, we have 45 units in stock.', NOW() - INTERVAL '40 minutes'),
        (conv2_id, 'buyer', 'Do you have this in stock?', NOW() - INTERVAL '30 minutes');
    END IF;

    IF conv3_id IS NOT NULL THEN
      INSERT INTO messages (conversation_id, sender, text, created_at) VALUES
        (conv3_id, 'buyer', 'How much for 5 USB cables?', NOW() - INTERVAL '3 hours'),
        (conv3_id, 'seller', 'That would be 74.95 with the bulk discount.', NOW() - INTERVAL '2.5 hours'),
        (conv3_id, 'buyer', 'Thank you for the fast delivery!', NOW() - INTERVAL '2 hours');
    END IF;
  END IF;
END $$;

-- Insert sample orders
DO $$
DECLARE
  product1_id UUID;
  product2_id UUID;
  product3_id UUID;
BEGIN
  -- Only insert if orders table is empty
  IF NOT EXISTS (SELECT 1 FROM orders) THEN
    SELECT id INTO product1_id FROM products WHERE name = 'Wireless Headphones' LIMIT 1;
    SELECT id INTO product2_id FROM products WHERE name = 'Bluetooth Speaker' LIMIT 1;
    SELECT id INTO product3_id FROM products WHERE name = 'Phone Stand' LIMIT 1;

    IF product1_id IS NOT NULL THEN
      INSERT INTO orders (order_number, buyer_name, product_id, product_name, quantity, price, status, order_date) VALUES
        ('ORD-001', 'Maria Santos', product1_id, 'Wireless Headphones', 2, 89.99, 'pending', NOW() - INTERVAL '1 day');
    END IF;

    IF product2_id IS NOT NULL THEN
      INSERT INTO orders (order_number, buyer_name, product_id, product_name, quantity, price, status, order_date) VALUES
        ('ORD-002', 'Juan Dela Cruz', product2_id, 'Bluetooth Speaker', 1, 59.99, 'confirmed', NOW() - INTERVAL '2 days');
    END IF;

    IF product3_id IS NOT NULL THEN
      INSERT INTO orders (order_number, buyer_name, product_id, product_name, quantity, price, status, order_date) VALUES
        ('ORD-003', 'Rosa Garcia', product3_id, 'Phone Stand', 3, 24.99, 'pending', NOW() - INTERVAL '3 days');
    END IF;
  END IF;
END $$;
