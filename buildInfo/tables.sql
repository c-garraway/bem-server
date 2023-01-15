CREATE TABLE users
(id BIGSERIAL PRIMARY KEY NOT NULL,
name VARCHAR(200) NOT NULL,
email VARCHAR(200) NOT NULL,
password VARCHAR(200),
useroauthid VARCHAR(200),
UNIQUE (email));

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");


CREATE TABLE entities (
  id SERIAL PRIMARY KEY,
  user_id bigint REFERENCES users(id),
  name VARCHAR(200),
  address VARCHAR(200),
  date_created date,
  status VARCHAR(20),
  corp_id VARCHAR(20)
);

CREATE TABLE corporate_jurisdictions (
  id SERIAL PRIMARY KEY,
  entity integer REFERENCES entities(id),
  jurisdiction VARCHAR(20),
  status VARCHAR(20),
  start_date date,
  end_date date
);

CREATE TABLE corporate_filings (
  id SERIAL PRIMARY KEY,
  entity integer REFERENCES entities(id),
  jurisdiction VARCHAR(20),
  submitter_name VARCHAR(20),
  due_date date,
  confirmation VARCHAR(20)
);

CREATE TABLE directors_officers (
  id SERIAL PRIMARY KEY,
  entity integer REFERENCES entities(id),
  name VARCHAR(200),
  position VARCHAR(200),
  status VARCHAR(20),
  start_date date,
  address VARCHAR(200),
  phone VARCHAR(20),
  email VARCHAR(50),
  end_date date
);

CREATE TABLE business_names (
  id SERIAL PRIMARY KEY,
  entity integer REFERENCES entities(id),
  business_name VARCHAR(200),
  jurisdiction VARCHAR(20),
  address VARCHAR(200),
  creation_date date,
  status VARCHAR(20),
  close_date date
);


CREATE TABLE business_name_filings (
  id SERIAL PRIMARY KEY,
  entity integer REFERENCES entities(id),
  business_name VARCHAR(200),
  jurisdiction VARCHAR(20),
  submitter_name VARCHAR(20),
  due_date date,
  confirmation VARCHAR(20)
);

