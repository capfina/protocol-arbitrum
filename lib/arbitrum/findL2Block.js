const util = require('util');
const { findL2BlockNumber } = require('../networkUtils');

module.exports = async function (params, { web3, artifacts }) {

	const l2BlockNumber = await findL2BlockNumber(params.number, { web3 });
	const block = await web3.eth.getBlock(l2BlockNumber);

	console.log(util.inspect(block, false, null, true));

}
