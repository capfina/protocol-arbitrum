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
const arbitrum_kovan_secrets = require('./.secrets/arbitrum_kovan.json');

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
    // L1 Ethereum
    development: {
      url: 'http://127.0.0.1:8545',
      hardfork: "istanbul"
    },
    ropsten: {
      url: ropsten_secrets.url,
      accounts: ropsten_secrets.accounts
    },
    kovan: {
      url: kovan_secrets.url,
      accounts: kovan_secrets.accounts
    },
    mainnet: {
      url: mainnet_secrets.url,
      accounts: mainnet_secrets.accounts
    },
    // Arbitrum
    arbitrum_l1: {
      url: 'http://127.0.0.1:7545'
    },
    arbitrum: {
      url: 'http://127.0.0.1:8547',
      l1_network: 'arbitrum_l1',
      accounts: {
        mnemonic: 'jar deny prosper gasp flush glass core corn alarm treat leg smart'
      }
    },
    arbitrum_kovan: {
      url: 'https://kovan5.arbitrum.io/rpc',
      l1_network: 'kovan',
      accounts: arbitrum_kovan_secrets.accounts
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

