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

exports.findL2BlockNumber = async (l1BlockNumber, hre) => {
	const { web3 } = hre;
	const latest = await web3.eth.getBlockNumber()

	l1BlockNumber = BigInt(l1BlockNumber);

	const calculateMid = async (min, max) => {
		const l1DistanceToMin = l1BlockNumber - min.l1BlockNumber;
		const l1Range = max.l1BlockNumber - min.l1BlockNumber;
		const l2Range = BigInt(max.l2BlockNumber - min.l2BlockNumber);

		let midBlockNumber = Number(BigInt(min.l2BlockNumber) + l1DistanceToMin * l2Range / l1Range);
		// take real middle in case it's too close
		if (midBlockNumber == min.l2BlockNumber || midBlockNumber == max.l2BlockNumber) {
			midBlockNumber = Math.floor((max.l2BlockNumber + min.l2BlockNumber) / 2)
		}

		const mid = {
			l2BlockNumber: midBlockNumber,
			l1BlockNumber: BigInt((await web3.eth.getBlock(midBlockNumber)).l1BlockNumber)
		}
		// console.log({ mid });
		return mid;
	}

	let min = { l2BlockNumber: 1, l1BlockNumber: BigInt((await web3.eth.getBlock(1)).l1BlockNumber) };
	let max = { l2BlockNumber: latest, l1BlockNumber: BigInt((await web3.eth.getBlock(latest)).l1BlockNumber) };


	while (true) {
		// console.log({ l1_target: l1BlockNumber, min, max });
		if (min.l1BlockNumber >= l1BlockNumber) return min.l2BlockNumber;
		if (max.l1BlockNumber <= l1BlockNumber) return max.l2BlockNumber;
		if (min.l2BlockNumber == max.l2BlockNumber - 1) {
			// return the closest
			return l1BlockNumber - min.l1BlockNumber < max.l1BlockNumber - l1BlockNumber ? min.l2BlockNumber : max.l2BlockNumber;
		}
		// calculate mid
		const mid = await calculateMid(min, max);
		if (mid.l1BlockNumber == l1BlockNumber) return mid.l2BlockNumber;
		if (mid.l1BlockNumber < l1BlockNumber) {
			min = mid
		} else {
			max = mid
		}
	}
}