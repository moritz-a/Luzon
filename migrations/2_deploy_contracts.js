var ProviderFactory = artifacts.require("ProviderFactory");

module.exports = function(deployer) {
  deployer.deploy(ProviderFactory);
};
