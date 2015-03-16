CREATE TABLE bigcommerce_token
(
  id bigserial NOT NULL,
  uid uuid,
  access_token text,
  scope text,
  user_id text,
  username text,
  email text,
  context text,
  created_by uuid,
  modified_at timestamp with time zone,
  created_at timestamp with time zone,
  modified_by uuid,
  deleted boolean DEFAULT false,
  store_hash text,
  hour integer,
  min integer,
  feed_url text,
  CONSTRAINT bigcommerce_token_pkey PRIMARY KEY (id),
  CONSTRAINT bigcommerce_token_uid_key UNIQUE (uid)
);



CREATE TABLE export_history
(
  uid uuid,
  created_at text,
  file_url text,
  deleted boolean,
  id bigint NOT NULL DEFAULT nextval('bigcommerce_token_id_seq'::regclass),
  user_id text,
  CONSTRAINT id PRIMARY KEY (id)
);