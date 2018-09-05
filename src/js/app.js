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

      return App.getProviders();
    });

    $.getJSON('AssetProvider.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var AssetProviderArtifact = data;
      App.contracts.AssetProvider = TruffleContract(AssetProviderArtifact);

      // Set the provider for our contract.
      App.contracts.AssetProvider.setProvider(App.web3Provider);
    });    
    $.getJSON('AssetConsumer.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var AssetConsumerArtifact = data;
      App.contracts.AssetConsumer = TruffleContract(AssetConsumerArtifact);

      // Set the provider for our contract.
      App.contracts.AssetConsumer.setProvider(App.web3Provider);
    });    


    $.getJSON('ConsumerFactory.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var ConsumerFactoryArtifact = data;
      App.contracts.ConsumerFactory = TruffleContract(ConsumerFactoryArtifact);

      // Set the provider for our contract.
      App.contracts.ConsumerFactory.setProvider(App.web3Provider);
      return App.getConsumers();
    });      

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#createProviderButton', App.createProvider);
    $(document).on('click', '#createConsumerButton', App.createConsumer);
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

  createConsumer: function(event) {
    event.preventDefault();

    var consumerName = $('#ConsumerName').val();

    console.log('Create Consumer: ' + consumerName);

    var consumerFactoryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.ConsumerFactory.deployed().then(function(instance) {
        consumerFactoryInstance = instance;

        return consumerFactoryInstance.createConsumer(consumerName);
      }).then(function(result) {
        alert('Creation Successful!');
        return App.getConsumers();
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
            console.log("Adding prov: " + addr);
            await providerFactoryInstance.getName(addr).then(function(provName) {
              providerTemplate.find('.address').text(addr);
              providerTemplate.find('.panel-title').text(provName);
              providerTemplate.find('.asset-details').attr("id","asset-" + addr);
              providerTemplate.find('.btn-listAssets').attr("onclick", "App.getLicenseAssets('" + addr + "')");
              providerTemplate.find('.btn-createAsset').attr("onclick", "App.createLicenseAssets('" + addr + "')");
              providerTemplate.find('.btn-buyToken').attr("onclick", "App.buyTokenOverlay('" + addr + "')");

              providerTemplate.find('.LTBalance').attr("id", "LTBalance-" + addr );

              //providerTemplate.find('.btn-createAssetWA').attr("onclick", "App.createLicenseAssetsWA('" + addr + "')");
              //providerTemplate.find('#overlay').attr("id","overlay-" + addr);
              providerList.append(providerTemplate.html());
              App.getBalances(addr);
            });
          }
        })();
    }).catch(function(err) {
        console.log(err.message);
      });
    });

  },

  getConsumers: function() {
    console.log('Getting consumers...');
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var addr;
      var consumerFactoryInstance;

      App.contracts.ConsumerFactory.deployed().then(function(instance) {
        consumerFactoryInstance = instance;
        return consumerFactoryInstance.getConsumers();
        }).then(function(result) {
          var consumerList = $('#consumerList');
          var consumerTemplate = $('#consumerTemplate');
        //reset list
        consumerList.html("");

        (async function loop() {
          for (i = 0; i < result.length; i++) {
            addr = result[i];
            console.log("Adding consumer: " + addr);
            await consumerFactoryInstance.getName(addr).then(function(conName) {
              consumerTemplate.find('.name').text(conName);
              consumerTemplate.find('.address').text(addr);
              consumerTemplate.find('.btn-addUser').attr("onclick", "App.addUserOverlay('" + addr + "')");
              consumerTemplate.find('.btn-listUser').attr("onclick", "App.listUsers('" + addr + "')");
              consumerList.append(consumerTemplate.html());
            });
          }
        })();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },


    listUsers: function(addr) {
      console.log('Getting users...');
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var assetConsumerInstance;
  
        App.contracts.AssetConsumer.at(addr).then(function(instance) {
          assetConsumerInstance = instance;
          return assetConsumerInstance.getUsers();
          }).then(function(result) {
            var userList = $('#userList');
            var userTemplate = $('#userTemplate');
            //reset list
            userList.html("");
  
            for (i = 0; i < result.length; i++) {
              addr = result[i];
              console.log("Adding user: " + addr);
              userTemplate.find('.userName').text(addr);
            }
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

      App.contracts.AssetProvider.at(addr).then(function(instance) {
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
              
              licenseAssetTemplate.find('.laName').text(res[0]);
              licenseAssetTemplate.find('.laCost').text(res[1]);
              licenseAssetList.append(licenseAssetTemplate.html());

            });
          }
        })();
    }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  createLicenseAssets: function(addr) {
    console.log('overlay LicenseAssets for LicenseProvider ' + addr);

    $('#overlayCreateAsset').find('.btn-createAssetWA').attr("onclick", "App.createLicenseAssetsWA('" + addr + "')");


    $('#overlayCreateAsset').fadeIn(300);  
    
    $('#close').click(function() {
      $('#overlayCreateAsset').fadeOut(300);
    });

  },
  buyTokenOverlay: function(addr) {
    console.log('overlay BuyToken for LicenseProvider ' + addr);

    $('#overlayBuyToken').find('.btn-buyToken').attr("onclick", "App.buyTokenWA('" + addr + "')");


    $('#overlayBuyToken').fadeIn(300);  
    
    $('#close').click(function() {
      $('#overlayBuyToken').fadeOut(300);
    });

  },  
  addUserOverlay: function(addr) {
    console.log('overlay AddUser for Consumer ' + addr);

    $('#overlayAddUser').find('.btn-addUserWA').attr("onclick", "App.addUserWA('" + addr + "')");


    $('#overlayAddUser').fadeIn(300);  
    
    $('#close').click(function() {
      $('#overlayAddUser').fadeOut(300);
    });

  },    
  createLicenseAssetsWA: function(addr) {
    console.log('Creating LicenseAssets WA for LicenseProvider ' + addr);
    event.preventDefault();

    var assetCost = $('#swCost').val();
    var assetName = $('#swName').val();

    console.log('Create asset: ' + assetName + ' with cost: ' + assetCost);

    var assetProviderInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.AssetProvider.at(addr).then(function(instance) {
        assetProviderInstance = instance;

        return assetProviderInstance.addLicenseAsset(assetName, assetCost);
      }).then(function(result) {
        alert('Creation Successful!');
        return App.getProviders();
      }).catch(function(err) {
        console.log(err.message);
      });
      $('#overlayCreateAsset').fadeOut(300);

    });
  },  
  buyTokenWA: function(addr) {
    console.log('BuyToken WA for LicenseProvider ' + addr);
    event.preventDefault();

    var amount = $('#amount').val();

    console.log('Buy Token amount: ' + amount);

    var assetProviderInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.AssetProvider.at(addr).then(function(instance) {
        assetProviderInstance = instance;

        return assetProviderInstance.getTokens(amount, {from: account, gas: 100000});

      }).then(function(result) {
        alert('Buy Successful!');
        return App.getProviders();
      }).catch(function(err) {
        console.log(err.message);
      });
      $('#overlayBuyToken').fadeOut(300);

    });
  },   
  addUserWA: function(addr) {
    console.log('AddUser WA for Consumer ' + addr);
    event.preventDefault();

    var user = $('#userAddress').val();

    console.log('User Address: ' + user);

    var assetConsumerInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.AssetConsumer.at(addr).then(function(instance) {
        assetConsumerInstance = instance;

        return assetConsumerInstance.addUser(user);

      }).then(function(result) {
        alert('Add Successful!');
      }).catch(function(err) {
        console.log(err.message);
      });
      $('#overlayAddUser').fadeOut(300);

    });
  },  
  getBalances: function(addr) {
    console.log('Getting balances for provider ' + addr);

    var assetProviderInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.AssetProvider.at(addr).then(function(instance) {
        assetProviderInstance = instance;

        return assetProviderInstance.getBalanceOf(account);
      }).then(function(result) {
        balance = result.c[0];

        $('#LTBalance-' + addr).text(balance);
        console.log("balance: " + balance);
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