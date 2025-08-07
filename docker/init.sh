#!/bin/bash
set -e

echo "POSTGRES USER: $POSTGRES_USER"

# Connect to the default 'postgres' database to execute the SQL command
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE DATABASE auraai;
EOSQL