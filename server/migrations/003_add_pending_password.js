exports.up = function(knex) {
    return knex.schema.alterTable('users', table => {
      table.string('pending_password', 255).nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('users', table => {
      table.dropColumn('pending_password');
    });
  };