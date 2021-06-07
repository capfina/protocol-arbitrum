function exitWithError(message) {
  console.error('ERROR:', message);
  process.exit(1);
}

// Deploys DAI and CAP mock tokens on Test Networks

module.exports = async function (params, { ethers, upgrades, network }) {

  console.error('network:', network.name);
  const addresses = {}

  if (!['kovan'].includes(network.name)) {
    exitWithError(`Invalid network ${network.name}. Expecting Testnet...`);
  }

  try {

    // deploy dai mock
    const DaiMock = await ethers.getContractFactory('DaiMock');
    dai = await DaiMock.deploy();
    await dai.deployed();
    console.error('proxy deployed: dai');
    Object.assign(addresses, { dai: dai.address });

    // deploy cap mock
    const GovernanceTokenMock = await ethers.getContractFactory('GovernanceTokenMock');
    cap = await upgrades.deployProxy(GovernanceTokenMock, ['CAP Token', 'CAP'], { unsafeAllowCustomTypes: true });
    await cap.deployed();
    console.error('proxy deployed: cap');
    Object.assign(addresses, { cap: cap.address });

  } finally {
    // print all the deployed addresses
    console.log(JSON.stringify(addresses, null , 2));
  }

}
