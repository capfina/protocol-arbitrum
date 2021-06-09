require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-web3');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-gas-reporter');

require('./tasks/accounts');
require('./tasks/deployment');
require('./tasks/governance');
require('./tasks/capToken');
require('./tasks/trading');
require('./tasks/arbitrum');

const ropsten_secrets = require('./.secrets/ropsten.json');
const mainnet_secrets = require('./.secrets/mainnet.json');
const kovan_secrets = require('./.secrets/kovan.json');
const rinkeby_secrets = require('./.secrets/rinkeby.json');
const arbitrum_kovan_secrets = require('./.secrets/arbitrum_kovan.json');
const arbitrum_rinkeby_secrets = require('./.secrets/arbitrum_rinkeby.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "development",
  networks: {
    // Ethereum Local Network
    development: {
      url: 'http://127.0.0.1:8545',
      hardfork: "istanbul"
    },
    // Ethereum Test Networks
    ropsten: {
      url: ropsten_secrets.url,
      accounts: ropsten_secrets.accounts
    },
    kovan: {
      url: kovan_secrets.url,
      accounts: kovan_secrets.accounts
    },
    rinkeby: {
      url: rinkeby_secrets.url,
      accounts: rinkeby_secrets.accounts
    },
    // Ethereum Main Networks
    mainnet: {
      url: mainnet_secrets.url,
      accounts: mainnet_secrets.accounts
    },
    // Arbitrum Local Networks
    arbitrum_l1_development: {
      url: 'http://127.0.0.1:7545'
    },
    arbitrum_l2_development: {
      url: 'http://127.0.0.1:8547',
      l1_network: 'arbitrum_l1',
      accounts: {
        mnemonic: 'jar deny prosper gasp flush glass core corn alarm treat leg smart'
      }
    },
    // Arbitrum Test Networks
    arbitrum_kovan: {
      url: 'https://kovan5.arbitrum.io/rpc',
      l1_network: 'kovan',
      accounts: arbitrum_kovan_secrets.accounts
    },
    arbitrum_rinkeby: {
      url: 'https://rinkeby.arbitrum.io/rpc',
      l1_network: 'rinkeby',
      accounts: arbitrum_rinkeby_secrets.accounts
    }
  },
  solidity: {
    compilers: [{
      version: "0.7.3",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }]
  }
};

