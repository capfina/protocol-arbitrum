const { PROPOSAL_STATES } = require('./constants');
const { isArbitrum, l1BlockNumber } = require('./networkUtils');

// Utility to replace Governance.proposalState on clients due to Arbitrum block.number bug in eth_call
// https://github.com/OffchainLabs/arbitrum/issues/1005
const computeProposalState = async (params) => {
	const {
		governance,
		proposal,
		blockNumber
	} = params;

	const {
		canceled,
		executed,
		expedited
	} = proposal;

	const startBlock = BigInt(proposal.startBlock);
	const endBlock = BigInt(proposal.endBlock)
	const expirationBlock = BigInt(proposal.expirationBlock)
	const forVotes = BigInt(proposal.forVotes)
	const againstVotes = BigInt(proposal.againstVotes)

	const FOR_VOTES_THRESHOLD = BigInt( await governance.methods.forVotesThreshold().call() );
	const FOR_VOTES_EXPEDITED_THRESHOLD = BigInt( await governance.methods.forVotesExpeditedThreshold().call() );

	if (canceled) return PROPOSAL_STATES.indexOf('Canceled');
	if (executed) return PROPOSAL_STATES.indexOf('Executed');
	if (blockNumber < startBlock) return PROPOSAL_STATES.indexOf('Pending');
	if (blockNumber <= endBlock) {
		if (expedited && forVotes > againstVotes && forVotes > FOR_VOTES_EXPEDITED_THRESHOLD) return PROPOSAL_STATES.indexOf('Executable');
		return PROPOSAL_STATES.indexOf('Active');
	}
	if (forVotes < againstVotes || forVotes < FOR_VOTES_THRESHOLD) return PROPOSAL_STATES.indexOf('Rejected');
	if (blockNumber < expirationBlock) return PROPOSAL_STATES.indexOf('Executable');
	return PROPOSAL_STATES.indexOf('Expired');
}


exports.proposalState = async (params) => {
	const {
		proposalId,
		hre
	} = params;

	if (isArbitrum(network)) {
		// fetch L1 block number
		const blockNumber = await l1BlockNumber(hre);

		// calculate state on the client side due to the arbitrum issue https://github.com/OffchainLabs/arbitrum/issues/1005
		return await computeProposalState(Object.assign({}, params, { blockNumber }));
	}
	return await governance.methods.proposalState(proposalId).call();
}
