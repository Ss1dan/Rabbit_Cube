exports.up = function(knex) {
    return knex.schema
      .createTable('users', table => {
        table.increments('id').primary();
        table.string('login', 255).notNullable().unique();
        table.string('email', 255).notNullable().unique();
        table.string('phone', 20).defaultTo('');
        table.string('password', 255).notNullable();
        table.string('avatar', 255).defaultTo('default.png');
        table.string('mood', 255).defaultTo('Готов разваливать БОТов');
        table.text('about').defaultTo('');
        table.boolean('confirmed').defaultTo(false);
        table.timestamps(true, true);
      })
      .createTable('roles', table => {
        table.increments('id').primary();
        table.string('name', 50).notNullable().unique();
      })
      .createTable('user_roles', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE');
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('user_roles')
      .dropTableIfExists('roles')
      .dropTableIfExists('users');
  };