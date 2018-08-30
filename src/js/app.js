App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('ProviderFactory.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var ProviderFactoryArtifact = data;
      App.contracts.ProviderFactory = TruffleContract(ProviderFactoryArtifact);

      // Set the provider for our contract.
      App.contracts.ProviderFactory.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.getProviders();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#createButton', App.createProvider);
  },

  createProvider: function(event) {
    event.preventDefault();

    var providerName = $('#ProviderName').val();
    var providerSymbol = $('#ProviderSymbol').val();

    console.log('Create Provider: ' + providerName + ' with symbol: ' + providerSymbol);

    var providerFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ProviderFactory.deployed().then(function(instance) {
        providerFactoryInstance = instance;

        return providerFactoryInstance.createProvider(providerName, providerSymbol);
      }).then(function(result) {
        alert('Creation Successful!');
        return App.getProviders();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getProviders: function() {
    console.log('Getting providers...');
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var addr;
      var providerFactoryInstance;

      App.contracts.ProviderFactory.deployed().then(function(instance) {
        providerFactoryInstance = instance;

        return providerFactoryInstance.getProviders();
      }).then(function(result) {

        var providerList = $('#providerList');
        var providerTemplate = $('#providerTemplate');

        //reset list
        providerList.html("");

        (async function loop() {
          for (i = 0; i < result.length; i++) {
            addr = result[i];
            await providerFactoryInstance.getName(addr).then(function(provName) {
              providerTemplate.find('.address').text(addr);
              providerTemplate.find('.panel-title').text(provName);
              providerTemplate.find('.asset-details').attr("id","asset-" + addr);
              providerTemplate.find('.btn-listAssets').attr("onclick", "getLicenseAssets(" + addr + ")")
              providerList.append(providerTemplate.html());

            });
          }
        })();
    }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getLicenseAssets: function(addr) {
    console.log('Getting LicenseAssets for LicenseProvider ' + addr);
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var licenseProviderInstance;

      App.contracts.LicenseProvider.at(addr).then(function(instance) {
        licenseProviderInstance = instance;

        return licenseProviderInstance.getLicenseAssets();
      }).then(function(result) {

        var licenseAssetList = $('#asset-' + addr);
        var licenseAssetTemplate = $('#licenseAssetTemplate');

        //reset list
        licenseAssetList.html("");

        (async function loop() {
          for (i = 0; i < result.length; i++) {
            addr = result[i];
            await licenseProviderInstance.getLicenseAsset(addr).then(function(res) {
              
              licenseAssetTemplate.find('.laID').text(res[0]);
              licenseAssetTemplate.find('.laName').text(res[1]);
              licenseAssetTemplate.find('.laCost').text(res[2]);
              licenseAssetList.append(licenseAssetTemplate.html());

            });
          }
        })();
    }).catch(function(err) {
        console.log(err.message);
      });
    });
  }  

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
