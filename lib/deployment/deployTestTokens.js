function exitWithError(message) {
  console.error('ERROR:', message);
  process.exit(1);
}

module.exports = async function (params, { ethers, upgrades, network }) {

  console.error('network:', network.name);
  const addresses = {}

  if (!['arbitrum_l1', 'kovan', 'arbitrum_kovan'].includes(network.name)) {
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
