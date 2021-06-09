const { task, subtask } = require('hardhat/config');
const util = require('util');
const inquirer = require('inquirer');
const { selectAccount, inquireAddress, validate_uint256 } = require('../lib/utils');

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

task('transfer', 'Sends ETH to account', async (_, { ethers, network }) => {
  // select account
  const account = await selectAccount(web3);
  const recipient = await inquireAddress(web3, 'recipient', 'contract or wallet to receive token');

  const { amount } = await inquirer.prompt([
    {
      type: 'input',
      name: 'amount',
      message: 'amount to transfer',
      validate: validate_uint256,
      default: BigInt(1e18).toString()
    }
  ]);

  const receipt = await web3.eth.sendTransaction({
    from: account,
    to: recipient,
    value: amount
  });

  console.log(util.inspect(receipt, false, null, true));
});