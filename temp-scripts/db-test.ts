import pool from './config/database';

async function testDatabase() {
  let connection;
  try {
    console.log('Connecting to the database...');
    connection = await pool.getConnection();
    console.log('✅ Database connected successfully.');

    console.log('\nListing all tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✅ Tables found:', tables);

    const testEmail = 'test.user@example.com';
    const testName = 'Test User';
    const updatedName = 'Test User Updated';

    console.log(`\nInserting a new user: ${testName}`);
    const [insertResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, gender, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
      [testName, testEmail, 'password123', 'voter', 'Other', '1990-01-01']
    );
    const newUserId = (insertResult as any).insertId;
    console.log(`✅ User inserted with ID: ${newUserId}`);

    console.log('\nFetching the new user...');
    const [users] = await connection.query('SELECT * FROM users WHERE userid = ?', [newUserId]);
    console.log('✅ User data:', users);

    console.log(`\nUpdating user's name to: ${updatedName}`);
    await connection.query('UPDATE users SET name = ? WHERE userid = ?', [updatedName, newUserId]);
    console.log('✅ User updated.');

    console.log('\nFetching the updated user...');
    const [updatedUsers] = await connection.query('SELECT * FROM users WHERE userid = ?', [newUserId]);
    console.log('✅ Updated user data:', updatedUsers);

    console.log('\nDeleting the test user...');
    await connection.query('DELETE FROM users WHERE userid = ?', [newUserId]);
    console.log('✅ User deleted.');
    
    console.log('\nConfirming user deletion...');
    const [deletedUser] = await connection.query('SELECT * FROM users WHERE userid = ?', [newUserId]);
    if ((deletedUser as any).length === 0) {
        console.log('✅ User successfully deleted.');
    } else {
        console.error('❌ User deletion confirmation failed.');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('\nDatabase connection released.');
    }
    pool.end();
  }
}

testDatabase(); 