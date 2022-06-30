const path = require("path");
const HDWalletProvider = require('./client/node_modules/@truffle/hdwallet-provider');
require('./client/node_modules/dotenv').config();

const MNEMONIC = process.env.REACT_APP_MNEMONIC;
const INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 5777
    },
    ropsten: {
      provider: function(){
        return new HDWalletProvider(
          MNEMONIC,
          `https://ropsten.infura.io/v3/${INFURA_API_KEY}`
        )
      },
      gas_price: 25000000,
      network_id: 3
    }
  },
  compilers: {
    solc: {
      version: "0.8.6"
    }
  }

};
