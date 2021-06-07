const util = require('util');

module.exports = async function (params, { web3, artifacts }) {

	const currentBlock = await web3.eth.getBlockNumber();
	const block = await web3.eth.getBlock(params.number || currentBlock);

	console.log(util.inspect(block, false, null, true));

}
