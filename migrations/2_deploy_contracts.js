var Authentication = artifacts.require("./Authentication.sol");
var Election = artifacts.require("./Election.sol");

module.exports = function (deployer) {
  deployer.deploy(Authentication);
  deployer.deploy(Election);
};
