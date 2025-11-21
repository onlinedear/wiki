import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION attachments_tsvector_trigger() RETURNS trigger AS $$
        begin
            new.tsv :=
                      setweight(to_tsvector('english', f_unaccent(coalesce(new.file_name, ''))), 'A') ||
                      setweight(to_tsvector('english', f_unaccent(coalesce(new.text_content, ''))), 'B');
            return new;
        end;
        $$ LANGUAGE plpgsql;`.execute(db);

  await sql`CREATE OR REPLACE TRIGGER attachments_tsvector_update BEFORE INSERT OR UPDATE
                ON attachments FOR EACH ROW EXECUTE FUNCTION attachments_tsvector_trigger();`.execute(
    db,
  );

  // Update existing attachments to populate tsv field
  await sql`UPDATE attachments SET tsv = 
    setweight(to_tsvector('english', f_unaccent(coalesce(file_name, ''))), 'A') ||
    setweight(to_tsvector('english', f_unaccent(coalesce(text_content, ''))), 'B')
    WHERE tsv IS NULL;`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS attachments_tsvector_update ON attachments`.execute(db);
  await sql`DROP FUNCTION IF EXISTS attachments_tsvector_trigger`.execute(db);
}
