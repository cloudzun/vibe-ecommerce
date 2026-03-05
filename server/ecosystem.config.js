module.exports = {
  apps: [{
    name: 'vibe-shop-api',
    script: 'app.js',
    cwd: '/home/chengzh/projects/vibe-ecommerce/server',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: '7TbqSfn1iQCO/QVp154w9uYZyVM+cfN7wHgUgS2KOSoH7FqGkWMOKkSA2YzkkHUf'
    }
  }]
};
