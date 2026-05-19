-- GingiAI PostgreSQL Schema
-- HIPAA-style: minimal PHI, audit fields, encrypted-at-rest assumed at infra layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (synced with Clerk external_id)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'admin', 'clinician')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- Screening sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    current_section VARCHAR(10),
    current_question_index INT DEFAULT 0,
    conversation_json JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    ip_hash VARCHAR(64),
    user_agent_hash VARCHAR(64)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_started_at ON sessions(started_at DESC);

-- Raw screening responses
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    section VARCHAR(10) NOT NULL,
    question_key VARCHAR(100) NOT NULL,
    question_text TEXT,
    answer_value TEXT NOT NULL,
    answer_type VARCHAR(50) DEFAULT 'choice',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, question_key)
);

CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);

-- ML predictions
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    has_gingivitis BOOLEAN NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('none', 'mild', 'moderate', 'severe')),
    severity_score DECIMAL(5, 2),
    confidence DECIMAL(5, 4) NOT NULL,
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    feature_importance JSONB,
    model_version VARCHAR(50) DEFAULT 'rf_v1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_session_id ON predictions(session_id);
CREATE INDEX idx_predictions_severity ON predictions(severity);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);

-- Generated reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) DEFAULT 'Gingivitis Screening Report',
    summary TEXT,
    recommendations JSONB,
    pdf_path VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_session_id ON reports(session_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);

-- Audit log for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
