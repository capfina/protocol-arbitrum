const util = require('util');
const inquirer = require('inquirer');
const { PROPOSAL_STATES } = require('../constants');
const { proposalState } = require('../governanceUtils');
const { isLayer2, findL2BlockNumber } = require('../networkUtils');

module.exports = async function (params, hre) {
  const { web3, network, artifacts } = hre;

  const { proposalId } = params.proposalId || await inquirer.prompt([
    {
      type: 'number',
      name: 'proposalId',
      message: 'proposal id'
    }
  ]);

  const Governance = await artifacts.readArtifact('Governance');
  const governance = new web3.eth.Contract(Governance.abi, params.governance);

  const proposal = await governance.methods.proposals(proposalId).call();
  const state = await proposalState({ proposalId, proposal, governance, hre });

  let startBlock = proposal.startBlock;
  if (isLayer2(network)) {
    startBlock = await findL2BlockNumber(proposal.startBlock, hre);
  }

  const events = await governance.getPastEvents('ProposalCreated', {
    filter: { id: [ proposalId ] },
    fromBlock: (startBlock - 50000) < 0 ? 'earliest' : startBlock - 50000,
    toBlock: startBlock + 1000
  })

  const event = events[0].returnValues;

  const transactions = event.signatures.map((signature, i) => {
    const paramTypes = signature.match(/^[^(]+\(([^)]*)\)$/)[1].split(',');
    let params;
    if (paramTypes.length == 1 && paramTypes[0] == '') {
      params = []
    } else {
      const decodedParams = web3.eth.abi.decodeParameters(paramTypes, event.calldatas[i]);
      params = paramTypes.map((p, i) => ({type: p, value: decodedParams[`${i}`]}));
    }

    return {
      contract: event.contracts[i],
      signature,
      params
    }    
  })

  const result = {
    proposalId,
    description: event.description,
    state: PROPOSAL_STATES[state],
    stateDetails: {
      startBlock: proposal.startBlock,
      endBlock: proposal.endBlock,
      expirationBlock: proposal.expirationBlock
    },
    forVotes: Number(BigInt(proposal.forVotes) / BigInt(1e18)),
    againstVotes: Number(BigInt(proposal.againstVotes) / BigInt(1e18)),
    proposer: proposal.proposer,
    transactions
  }

  console.log(util.inspect(result, false, null, true));

}