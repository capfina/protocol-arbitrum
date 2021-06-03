const { task, subtask } = require('hardhat/config');
const depositEth = require('../lib/arbitrum/depositEth');

task('arbitrum:depositEth', 'deposit arbitrum ETH')
  .addParam("inbox", "arbitrum inbox address")
  .setAction(depositEth);