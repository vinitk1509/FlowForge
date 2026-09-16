-- FlowForge Service Databases Initialization
CREATE DATABASE auth_db;
CREATE DATABASE workflow_db;
CREATE DATABASE execution_db;
CREATE DATABASE credential_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE workflow_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE execution_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE credential_db TO postgres;
