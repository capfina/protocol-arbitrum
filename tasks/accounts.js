const { task, subtask } = require('hardhat/config');

task('accounts', 'Prints the list of accounts', async (_, { ethers }) => {
  const accounts = await ethers.getSigners();
  console.log(accounts.map(acc => acc.address));
});

task('balance', 'Prints the balance', async (_, { ethers, network }) => {
  const accounts = await ethers.getSigners();
  const account = accounts[0];

  console.log('network:', network.config.url);
  console.log('account:', account.address);
  const provider = ethers.getDefaultProvider(network.config.url);
  const balance = await provider.getBalance(account.address);
  console.log('balance:', balance.toString());
});