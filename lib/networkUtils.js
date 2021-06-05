exports.isArbitrum = async (network) => {
	return network.name.toLowerCase().includes('arbitrum')
}

const networkByName = (name, { config }) => {
	return config.networks[network.config.l1_network];
}

exports.l1BlockNumber = async (hre) => {
	const {
		ethers,
		network,
		config
	} = hre;

	// get L1 network config
	const l1_network = networkByName(network.config.l1_network, { config });

	// read-only provider
	const provider = ethers.getDefaultProvider(l1_network.url);

	return await provider.getBlockNumber();
}