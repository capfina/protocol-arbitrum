const { isDevelopment, isLayer2 } = require('../networkUtils');
const { inquireAddress } = require('../utils');

function exitWithError(message) {
  console.error('ERROR:', message);
  process.exit(1);
}

module.exports = async function (params, { ethers, upgrades, network }) {
  const {
    capToken
  } = params;

  console.error('network:', network.name);
  const addresses = {}

  try {
    // mainnet dai and cap
    let dai;
    let cap;

    if (network.name != 'mainnet' && !isLayer2(network)) {
      // deploy dai mock
      const DaiMock = await ethers.getContractFactory('DaiMock');
      dai = await DaiMock.deploy();
      await dai.deployed();
      console.error('proxy deployed: dai');

      // deploy cap mock
      const GovernanceTokenMock = await ethers.getContractFactory('GovernanceTokenMock');
      cap = await upgrades.deployProxy(GovernanceTokenMock, ['CAP Token', 'CAP'], { unsafeAllowCustomTypes: true });
      await cap.deployed();
      console.error('proxy deployed: cap');
    } else {
      dai = { address: await inquireAddress(ethers, 'dai', 'DAI token address') };
      cap = { address: await inquireAddress(ethers, 'cap', 'CAP token address') };
    }

    Object.assign(addresses, { dai: dai.address, cap: cap.address });

    // deploy governance
    const Governance = await ethers.getContractFactory(network.name == 'mainnet' ? 'Governance' : 'GovernanceTestNet');
    const governance = await upgrades.deployProxy(Governance, [cap.address], { unsafeAllowCustomTypes: true });
    await governance.deployed();
    addresses.governance = governance.address;
    console.error('proxy deployed: governance');

    const options = { unsafeAllowCustomTypes: true }
    if (!isDevelopment(network)) {
      // don't initialize on remote networks
      options.initializer = false;
    }

    // deploy other contracts
    const Products = await ethers.getContractFactory('Products');
    const products = await upgrades.deployProxy(Products, [], options);
    await products.deployed();
    addresses.products = products.address;
    console.error('proxy deployed: products');

    const Queue = await ethers.getContractFactory('Queue');
    const queue = await upgrades.deployProxy(Queue, [], options);
    await queue.deployed();
    addresses.queue = queue.address;
    console.error('proxy deployed: queue');

    const Trading = await ethers.getContractFactory('Trading');
    const trading = await upgrades.deployProxy(Trading, [dai.address], options);
    await trading.deployed();
    addresses.trading = trading.address;
    console.error('proxy deployed: trading');

    const Treasury = await ethers.getContractFactory('Treasury');
    const treasury = await upgrades.deployProxy(Treasury, [dai.address], options);
    await treasury.deployed();
    addresses.treasury = treasury.address;
    console.error('proxy deployed: treasury');

    if (isDevelopment(network)) {
      const ORACLE_ADDRESS = '0xbcd4042de499d14e55001ccbb24a551f3b954096'; // account #10 in local node
      // local deploy, register contracts
      await queue.registerContracts(ORACLE_ADDRESS, trading.address);
      await trading.registerContracts(products.address, queue.address, treasury.address);
      await treasury.registerContracts(ORACLE_ADDRESS, trading.address);
      // register products
      const B32_BTC = ethers.utils.formatBytes32String('BTC');
      const B32_AAPL = ethers.utils.formatBytes32String('BBG000B9XRY4');
      await products.register(
        [B32_BTC, B32_AAPL],
        [10000000000, 2000000000],
        [100000, 100000],
        [2, 2]
      );
      // register currencies
      await trading.setCurrencyMin(1000000000);
    }

    if (!isDevelopment(network)) {
      // Transfer proxy admin ownership to governance
      await upgrades.admin.transferProxyAdminOwnership(governance.address);
    }
  } finally {
    // print all the deployed addresses
    console.log(JSON.stringify(addresses, null , 2));
  }

}
