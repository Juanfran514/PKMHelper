-- ====================================================================
-- 1. TABLAS INDEPENDIENTES (Sin dependencias)
-- ====================================================================

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR,
    password VARCHAR,
    email VARCHAR,
    "sdName" VARCHAR,
    "lastOnline" TIMESTAMP
);

CREATE TABLE pokedex (
    id INTEGER PRIMARY KEY,
    name VARCHAR UNIQUE,
    showdown_name VARCHAR,
    hp INTEGER,
    atk INTEGER,
    def INTEGER,
    "spAtk" INTEGER,
    "spDef" INTEGER,
    spe INTEGER,
    sprite VARCHAR,
    abilities JSONB
);


-- ====================================================================
-- 2. TABLAS QUE DEPENDEN DIRECTAMENTE DE LAS ANTERIORES
-- ====================================================================

CREATE TABLE "userStats" (
    id SERIAL PRIMARY KEY,
    "playerId" INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    format VARCHAR,
    elo INTEGER,
    matches_played INTEGER,
    wins INTEGER,
    losses INTEGER,
    updated_at TIMESTAMP,
    UNIQUE("playerId", format)
);

CREATE TABLE teams (
    id VARCHAR PRIMARY KEY,
    team_group_id VARCHAR,
    version INTEGER,
    user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    team_name VARCHAR,
    publicity VARCHAR,
    archetype VARCHAR,
    is_scrapped BOOLEAN,
    pokemon_list JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE pikalytics_stats (
    id SERIAL PRIMARY KEY,
    pokemon_name VARCHAR,
    usage_percent VARCHAR,
    set_data JSONB,
    updated_at TIMESTAMP,
    UNIQUE(pokemon_name)
);

-- ====================================================================
-- 3. TABLAS QUE DEPENDEN DE LOS EQUIPOS
-- ====================================================================


CREATE TABLE team_pokemon_stats (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR REFERENCES teams(id) ON DELETE CASCADE,
    pokemon_name VARCHAR,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    UNIQUE(team_id, pokemon_name)
);

CREATE TABLE team_move_stats (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR REFERENCES teams(id) ON DELETE CASCADE,
    pokemon_name VARCHAR,
    move_name VARCHAR,
    times_used INTEGER DEFAULT 0,
    UNIQUE(team_id, pokemon_name, move_name)
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    team_id VARCHAR REFERENCES teams(id) ON DELETE SET NULL,
    opponent_name VARCHAR,
    result VARCHAR,
    log_raw JSONB,
    played_at TIMESTAMP
);