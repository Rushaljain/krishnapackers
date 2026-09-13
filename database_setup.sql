-- Create the products table based on the KP_SKU_List Excel file
CREATE TABLE IF NOT EXISTS public.products (
    sku_code TEXT PRIMARY KEY,
    product_category TEXT,
    product_name TEXT,
    bag_type TEXT,
    capacity TEXT,
    construction TEXT,
    material TEXT,
    application TEXT,
    status TEXT
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products" 
ON public.products
FOR SELECT
TO public
USING (true);

-- Create the rfq_leads table
CREATE TABLE IF NOT EXISTS public.rfq_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    target_product_sku TEXT,
    estimated_qty TEXT,
    message TEXT
);

-- Enable RLS for rfq_leads
ALTER TABLE public.rfq_leads ENABLE ROW LEVEL SECURITY;

-- Allow public insert access to rfq_leads
CREATE POLICY "Allow public insert to rfq_leads" 
ON public.rfq_leads
FOR INSERT
TO public
WITH CHECK (true);

-- Add status column to rfq_leads if not exists
ALTER TABLE public.rfq_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New';

-- Allow authenticated users to view all leads
CREATE POLICY "Allow auth read access to rfq_leads" ON public.rfq_leads FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update leads
CREATE POLICY "Allow auth update to rfq_leads" ON public.rfq_leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
