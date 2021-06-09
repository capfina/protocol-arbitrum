const { task, subtask } = require('hardhat/config');
const faucetRequest = require('../lib/capToken/faucetRequest');
const getBalance = require('../lib/capToken/getBalance');
const approve = require('../lib/capToken/approve');
const transfer = require('../lib/capToken/transfer');

task('capToken:faucetRequest', 'makes faucet request for CAP')
  .addParam("cap", "cap contract address")
  .setAction(faucetRequest);

task('capToken:getBalance', 'gets CAP balance')
  .addParam("cap", "cap contract address")
  .setAction(getBalance);

task('capToken:approve', 'gets CAP balance')
  .addParam("cap", "cap contract address")
  .addOptionalParam("gas", "gas limit")
  .addOptionalParam("gasprice", "gas price")
  .setAction(approve);

task('capToken:transfer', 'transfer CAP to account')
  .addParam("cap", "cap contract address")
  .addOptionalParam("gas", "gas limit")
  .addOptionalParam("gasprice", "gas price")
  .setAction(transfer);