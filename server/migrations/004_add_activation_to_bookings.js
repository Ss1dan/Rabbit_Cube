exports.up = async function(knex) {
    await knex.schema.alterTable('bookings', table => {
      table.string('activation_code', 10).nullable();
      table.timestamp('expires_at').nullable();
    });
    await knex.raw("ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending'");
  };
  
  exports.down = async function(knex) {
    await knex.schema.alterTable('bookings', table => {
      table.dropColumn('activation_code');
      table.dropColumn('expires_at');
    });
    await knex.raw("ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'active'");
  };