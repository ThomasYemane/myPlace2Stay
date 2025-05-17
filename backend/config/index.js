module.exports = {
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres', // 👈 Add this line if it's missing
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
