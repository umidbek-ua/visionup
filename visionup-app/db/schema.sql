CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TABLE zoom_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    zoom_type VARCHAR(40) NOT NULL DEFAULT 'FULL_SCREEN',
    max_zoom_percent INTEGER NOT NULL DEFAULT 300,
    smooth_zoom_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    fast_zoom_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT zoom_type_check CHECK (
        zoom_type IN ('FULL_SCREEN', 'PICTURE_IN_PICTURE', 'ZOOM_WINDOW')
    ),

    CONSTRAINT max_zoom_percent_check CHECK (
        max_zoom_percent BETWEEN 100 AND 1000
    )
);

CREATE TABLE reading_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    text_size INTEGER NOT NULL DEFAULT 24,
    line_height NUMERIC(3, 1) NOT NULL DEFAULT 1.7,
    letter_spacing NUMERIC(4, 2) NOT NULL DEFAULT 0.04,
    reading_width INTEGER NOT NULL DEFAULT 720,
    background_mode VARCHAR(30) NOT NULL DEFAULT 'DARK',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT background_mode_check CHECK (
        background_mode IN ('DARK', 'SEPIA', 'HIGH_CONTRAST')
    )
);

CREATE TABLE shortcut_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shortcut_scope VARCHAR(40) NOT NULL,
    action_key VARCHAR(80) NOT NULL,
    default_shortcut VARCHAR(120) NOT NULL,
    custom_shortcut VARCHAR(120) NULL,
    is_customizable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT shortcut_scope_check CHECK (
        shortcut_scope IN ('ZOOM', 'PROFILE', 'READING', 'SETTINGS', 'APP')
    )
);

CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accessibility_integration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    start_on_login BOOLEAN NOT NULL DEFAULT FALSE,
    default_ui_scale INTEGER NOT NULL DEFAULT 100,
    high_contrast_ui BOOLEAN NOT NULL DEFAULT TRUE,
    reduce_motion BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT default_ui_scale_check CHECK (
        default_ui_scale BETWEEN 90 AND 160
    )
);

CREATE TABLE profile_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
    action_type VARCHAR(40) NOT NULL,
    action_note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT action_type_check CHECK (
        action_type IN ('CREATED', 'UPDATED', 'DELETED', 'IMPORTED', 'EXPORTED')
    )
);}