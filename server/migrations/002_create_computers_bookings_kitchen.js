exports.up = function(knex) {
    return knex.schema
      .createTable('computers', table => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('type', 50).notNullable(); // Standard, VIP, PS5
        table.json('specs'); // { videocard: 'RTX4060', processor: 'Ryzen 7 7500x', ram: '16GB', monitor: '144Hz' }
        table.decimal('price_per_hour', 10, 2).notNullable();
        table.boolean('is_available').defaultTo(true);
      })
      .createTable('bookings', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.integer('computer_id').unsigned().references('id').inTable('computers').onDelete('CASCADE');
        table.date('booking_date').notNullable();
        table.time('start_time').notNullable();
        table.time('end_time').notNullable();
        table.json('kitchen_items'); // массив id выбранных блюд
        table.string('status', 20).defaultTo('active'); // active, cancelled
        table.timestamps(true, true);
      })
      .createTable('kitchen', table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.decimal('price', 10, 2).notNullable();
      })
      .createTable('price_rates', table => {
        table.increments('id').primary();
        table.string('computer_type', 50).notNullable().unique();
        table.decimal('price', 10, 2).notNullable();
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('price_rates')
      .dropTableIfExists('kitchen')
      .dropTableIfExists('bookings')
      .dropTableIfExists('computers');
  };