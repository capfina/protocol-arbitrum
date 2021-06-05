const { task, subtask } = require('hardhat/config');
const depositEth = require('../lib/arbitrum/depositEth');
const getBlock = require('../lib/arbitrum/getBlock');
const findL2Block = require('../lib/arbitrum/findL2Block');

task('arbitrum:depositEth', 'deposit arbitrum ETH')
  .addParam("inbox", "arbitrum inbox address")
  .setAction(depositEth);

task('arbitrum:getBlock', 'fetches block')
  .addOptionalParam("number", "block number (defaults to latest)")
  .setAction(getBlock);

task('arbitrum:findL2Block', 'fetches L2 block using L1 block number')
  .addParam("number", "L1 block number")
  .setAction(findL2Block);