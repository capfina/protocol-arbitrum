const util = require('util');
const inquirer = require('inquirer');
const { defaults } = require('../constants');
const { selectAccount, inquireAddress, validate_uint256 } = require('../utils');

module.exports = async function (params, { web3, artifacts }) {

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

  const GovernanceTokenMock = await artifacts.readArtifact('GovernanceTokenMock');
  const cap = new web3.eth.Contract(GovernanceTokenMock.abi, params.cap);

  const receipt = await cap.methods.transfer(recipient, amount).send({
    from: account,
    gas: params.gas || defaults.GAS,
    gasPrice: params.gasPrice || defaults.GAS_PRICE
  });

  console.log(util.inspect(receipt, false, null, true));

}