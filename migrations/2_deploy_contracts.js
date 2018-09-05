var ProviderFactory = artifacts.require("ProviderFactory");
var ConsumerFactory = artifacts.require("ConsumerFactory");

module.exports = function(deployer) {
  deployer.deploy(ProviderFactory);
  deployer.deploy(ConsumerFactory);
};
