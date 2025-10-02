-- Migration V14: Add simulations table for Revenue Simulator feature
-- This table stores user simulations for revenue calculations

CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
    price_per_kg DECIMAL(10,2) NOT NULL CHECK (price_per_kg >= 0),
    transport_costs DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (transport_costs >= 0),
    other_costs DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (other_costs >= 0),
    gross_revenue DECIMAL(12,2) NOT NULL GENERATED ALWAYS AS (quantity * price_per_kg) STORED,
    total_expenses DECIMAL(12,2) NOT NULL GENERATED ALWAYS AS (transport_costs + other_costs) STORED,
    net_revenue DECIMAL(12,2) NOT NULL GENERATED ALWAYS AS (quantity * price_per_kg - transport_costs - other_costs) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_simulations_user_id ON simulations(user_id);
CREATE INDEX idx_simulations_created_at ON simulations(created_at DESC);
CREATE INDEX idx_simulations_net_revenue ON simulations(net_revenue);

-- Add comments for documentation
COMMENT ON TABLE simulations IS 'Stores user revenue simulations for cashew production';
COMMENT ON COLUMN simulations.id IS 'Unique identifier for the simulation';
COMMENT ON COLUMN simulations.user_id IS 'Reference to the user who created the simulation';
COMMENT ON COLUMN simulations.quantity IS 'Quantity of cashew in kilograms';
COMMENT ON COLUMN simulations.price_per_kg IS 'Price per kilogram in FCFA';
COMMENT ON COLUMN simulations.transport_costs IS 'Transportation costs in FCFA';
COMMENT ON COLUMN simulations.other_costs IS 'Other costs (bags, labor, etc.) in FCFA';
COMMENT ON COLUMN simulations.gross_revenue IS 'Gross revenue calculated as quantity * price_per_kg';
COMMENT ON COLUMN simulations.total_expenses IS 'Total expenses calculated as transport_costs + other_costs';
COMMENT ON COLUMN simulations.net_revenue IS 'Net revenue calculated as gross_revenue - total_expenses';
COMMENT ON COLUMN simulations.created_at IS 'Timestamp when the simulation was created';
COMMENT ON COLUMN simulations.updated_at IS 'Timestamp when the simulation was last updated';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_simulations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_simulations_updated_at
    BEFORE UPDATE ON simulations
    FOR EACH ROW
    EXECUTE FUNCTION update_simulations_updated_at();

