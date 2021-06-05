const util = require('util');
const inquirer = require('inquirer');
const { defaults } = require('../constants');
const { selectAccount, inquireAddress, validate_uint256 } = require('../utils');

const ARBITRUM_INBOX_ABI = [
  {
    type: 'function',
    name: 'depositEth',
    inputs: [ {name: 'destAddr', type: 'address'}],
    outputs: [ {internalType: 'uint256', type: 'uint256'} ],
    stateMutability: 'payable'
  }
]

module.exports = async function (params, { web3, artifacts }) {

  // select account
  const account = await selectAccount(web3);
  const receiver = await inquireAddress(web3, 'receiver', 'L2 contract or wallet to receive ETH amount');

  const { amount } = await inquirer.prompt([
    {
      type: 'input',
      name: 'amount',
      message: 'amount to deposit',
      validate: validate_uint256,
      default: BigInt(1e18).toString()
    }
  ]);

  const arbitrum_inbox = new web3.eth.Contract(ARBITRUM_INBOX_ABI, params.inbox);

  const receipt = await arbitrum_inbox.methods.depositEth(receiver).send({
    from: account,
    value: amount,
    gas: params.gas || defaults.GAS,
    gasPrice: params.gasprice || defaults.GAS_PRICE
  });

  console.log(util.inspect(receipt, false, null, true));

}