exports.isDevelopment = (network) => {
	return network.name.toLowerCase().includes('development')
}

exports.isLayer2 = (network) => {
	return !!network.config.l1_network
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

const bigIntMax = (...args) => args.reduce((m, e) => e > m ? e : m);
const bigIntMin = (...args) => args.reduce((m, e) => e < m ? e : m);

exports.findL2BlockNumber = async (l1BlockNumber, hre) => {
	const { web3 } = hre;
	const latest = await web3.eth.getBlockNumber()

	l1BlockNumber = BigInt(l1BlockNumber);

	const calculateSections = async (min, max) => {
		// estimate the target L2 block number based on the L1 block number
		const l1DistanceToMin = l1BlockNumber - min.l1BlockNumber;
		const l1Range = max.l1BlockNumber - min.l1BlockNumber;
		const l2Range = max.l2BlockNumber - min.l2BlockNumber;
		const estimatedBlockNumber = min.l2BlockNumber + l1DistanceToMin * l2Range / l1Range;

		// take a 20% range around each side of the estimate and split it into equal sections
		const rangeBeginning = bigIntMax(min.l2BlockNumber, estimatedBlockNumber - l2Range / 5n)
		const rangeEnd = bigIntMin(max.l2BlockNumber, estimatedBlockNumber + l2Range / 5n)

		// split the range into N sections
		const step_size = 5n;
		const section_size = bigIntMax(1n, (rangeEnd - rangeBeginning) / step_size);
		const sections = [];
		for (i=0n; i <= step_size; i++) {
			const l2BlockNumber = rangeBeginning + section_size * i;
			if (l2BlockNumber == max.l2BlockNumber) break;
			sections.push({l2BlockNumber: l2BlockNumber})
		}

		const blocks = await Promise.all(sections.map(item => web3.eth.getBlock(item.l2BlockNumber.toString())));

		return sections.map((item, index) => Object.assign({}, item, {l1BlockNumber: BigInt(blocks[index].l1BlockNumber)}) )
	}

	let min = { l2BlockNumber: 1n, l1BlockNumber: BigInt((await web3.eth.getBlock(1)).l1BlockNumber) };
	let max = { l2BlockNumber: BigInt(latest), l1BlockNumber: BigInt((await web3.eth.getBlock(latest)).l1BlockNumber) };

	while (true) {
		// console.log({ l1_target: l1BlockNumber, min, max });
		if (min.l1BlockNumber >= l1BlockNumber) return Number(min.l2BlockNumber);
		if (max.l1BlockNumber <= l1BlockNumber) return Number(max.l2BlockNumber);
		if (min.l2BlockNumber == max.l2BlockNumber - 1n) {
			// return the closest
			return l1BlockNumber - min.l1BlockNumber < max.l1BlockNumber - l1BlockNumber ? Number(min.l2BlockNumber) : Number(max.l2BlockNumber);
		}
		// split range into sections for quick lookup
		const sections = await calculateSections(min, max);
		// console.log([min, ...sections, max]);
		for (section of sections) {
			if (section.l1BlockNumber == l1BlockNumber) return Number(section.l2BlockNumber);
			if (section.l1BlockNumber < l1BlockNumber) {
				min = section
			} else {
				max = section
				break;
			}
		}
	}
}