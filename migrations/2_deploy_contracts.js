var Authentication = artifacts.require("./Authentication.sol");
var Election = artifacts.require("./Election.sol");

module.exports = function (deployer) {
  deployer.deploy(Authentication);
  deployer.deploy(Election, {gas: '4700000',
  value: web3.utils.toWei('3','ether')
});
};
