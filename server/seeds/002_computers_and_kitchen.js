exports.seed = async function(knex) {
    // Очищаем таблицы
    await knex('bookings').del();
    await knex('computers').del();
    await knex('kitchen').del();
    await knex('price_rates').del();
  
    // Вставляем компьютеры (20 Standard, 15 VIP, 3 PS5)
    const computers = [];
    // Standard (места 1-20)
    for (let i = 1; i <= 20; i++) {
      computers.push({
        name: `PC-Standard ${i}`,
        type: 'Standard',
        specs: JSON.stringify({
          videocard: 'RTX4060',
          processor: 'Ryzen 7 7500x',
          ram: '16GB',
          monitor: '144Hz'
        }),
        price_per_hour: 150.00
      });
    }
    // VIP (места 21-35)
    for (let i = 21; i <= 35; i++) {
      computers.push({
        name: `PC-VIP ${i}`,
        type: 'VIP',
        specs: JSON.stringify({
          videocard: 'RTX5060',
          processor: 'Ryzen 9 7500X3D',
          ram: '32GB',
          monitor: '280Hz'
        }),
        price_per_hour: 250.00
      });
    }
    // PS5 (места 36-38)
    for (let i = 1; i <= 3; i++) {
      computers.push({
        name: `PlayStation 5 ${i}`,
        type: 'PS5',
        specs: JSON.stringify({
          videocard: 'AMD RDNA 2',
          processor: 'AMD Ryzen Zen 2',
          ram: '16GB',
          monitor: '8K'
        }),
        price_per_hour: 75.00
      });
    }
    await knex('computers').insert(computers);
  
    // Вставляем кухню
    await knex('kitchen').insert([
      { name: 'Наггетсы', price: 55 },
      { name: 'Чебупица', price: 55 },
      { name: 'Энергетик "Lit Energy"', price: 75 },
      { name: 'Вода 0.5л', price: 25 },
      { name: 'Своя еда/вода', price: 180 }
    ]);
  
    // Цены по типам (можно менять админом)
    await knex('price_rates').insert([
      { computer_type: 'Standard', price: 150 },
      { computer_type: 'VIP', price: 250 },
      { computer_type: 'PS5', price: 75 }
    ]);
  };