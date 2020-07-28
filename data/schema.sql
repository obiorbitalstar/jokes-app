DROP TABLE IF EXISTS laugh;

CREATE TABLE laugh (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255),
    setup VARCHAR(255),
    punchline VARCHAR(255)

)