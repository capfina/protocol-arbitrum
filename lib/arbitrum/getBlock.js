const util = require('util');
const inquirer = require('inquirer');
const { defaults } = require('../constants');
const { selectAccount, inquireAddress, validate_uint256 } = require('../utils');

module.exports = async function (params, { web3, artifacts }) {

	const currentBlock = await web3.eth.getBlockNumber();
	const latestBlock = await web3.eth.getBlock(params.number || currentBlock);

	console.log(util.inspect(latestBlock, false, null, true));

}
