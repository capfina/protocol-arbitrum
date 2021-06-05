const util = require('util');
const inquirer = require('inquirer');
const { defaults } = require('../constants');
const { selectAccount, inquireAddress, validate_uint256 } = require('../utils');
const { findL2BlockNumber } = require('../networkUtils');

module.exports = async function (params, { web3, artifacts }) {

	const l2BlockNumber = await findL2BlockNumber(params.number, { web3 });
	const latestBlock = await web3.eth.getBlock(l2BlockNumber);

	console.log(util.inspect(latestBlock, false, null, true));

}
