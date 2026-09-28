-- Add nullable cost data without assigning invented values to historical orders.
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS unit_cost numeric(10, 2);

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS unit_cost_snapshot numeric(10, 2);
