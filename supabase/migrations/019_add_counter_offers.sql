-- Add counter_amount_gbp to offers table
alter table offers add column if not exists counter_amount_gbp decimal(10,2);
alter table offers add column if not exists accepted_at timestamptz;
