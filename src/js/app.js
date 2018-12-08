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

    $.getJSON('LuzonToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var LuzonTokenArtifact = data;
      App.contracts.LuzonToken = TruffleContract(LuzonTokenArtifact);

      // Set the provider for our contract.
      App.contracts.LuzonToken.setProvider(App.web3Provider);
    });    


    App.getUserName();
    return App.bindEvents();
  },
  getUserName : function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log("Current user:" + account);
      $('.currentUser').text(account);
    });
  },

  bindEvents: function() {
    $(document).on('click', '#createProviderButton', App.createProvider);
    $(document).on('click', '#createConsumerButton', App.createConsumer);
    $(document).on('click', '#checkoutButton', App.checkout);
    $(document).on('click', '#returnButton', App.returnAsset);
    console.log("init completed.");

  },

  returnAsset: function(event) {
    console.log("return asset button");
    event.preventDefault();

    var appCost = $('.appCost').text();
    var appConsumer = $('.appConsumer').text();
    var appProvider = $('.appProvider').text();

    App.contracts.AssetProvider.at(appProvider).then(function(instance) {
      assetProvider = instance;
      return assetProvider.luzon().then(function(tokenAddr){
        return App.contracts.LuzonToken.at(tokenAddr).then(function(tokenInstance){
          return tokenInstance.transfer(appConsumer, appCost);
        });
      });
    });
    window.close();


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
    App.getProviders();
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
    App.getConsumers();
  },
  getProviders: function() {

    var providerList = $('#providerList');
    var appName = getUrlParameter('appName');

    if (providerList.length || appName.length) {
    console.log('Getting providers...');
    }
    else
    {
    console.log('No providers needed.');
      return;
    }

  
  
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      console.log("enter getAccount");

      var account = accounts[0];
      var addr;
      var providerFactoryInstance;

      App.contracts.ProviderFactory.deployed().then(function(instance) {
        providerFactoryInstance = instance;

        return providerFactoryInstance.getProviders();
      }).then(function(result) {

        var providerTemplate = $('#providerTemplate');

        //reset list
        providerList.html("");

        (async function loop() {
      console.log("enter getAccount:loop, result len: " + result.length);

          for (i = 0; i < result.length; i++) {
            addr = result[i];

            console.log("Adding prov: " + addr + " iteration: " + i);
            await providerFactoryInstance.getProviderInfo(addr).then(function(provInfo) {
              var provName = provInfo[0];
              var provToken = provInfo[1];
              var provTokenSymbol = provInfo[2];
              var provOwner = provInfo[3];

              providerTemplate.find('.provOwnerAddress').text(provOwner);
              providerTemplate.find('.address').text(addr);
              providerTemplate.find('.panel-title').text(provName);
              providerTemplate.find('.panel-token').text(provToken);
              providerTemplate.find('.panel-tokenSymbol').text(provTokenSymbol);
              providerTemplate.find('.asset-details').attr("id","asset-" + addr);
              providerTemplate.find('.btn-listAssets').attr("onclick", "App.getLicenseAssets('" + addr + "','" + provName + "')");
              providerTemplate.find('.btn-createAsset').attr("onclick", "App.createLicenseAssets('" + addr + "')");
              providerTemplate.find('.btn-buyToken').attr("onclick", "App.buyTokenOverlay('" + addr + "')");

              providerTemplate.find('.LTBalance').attr("id", "LTBalance-" + addr );

              providerTemplate.find('.btn-createAssetWA').attr("onclick", "App.createLicenseAssetsWA('" + addr + "')");

              providerTemplate.find('#overlay').attr("id","overlay-" + addr);
              providerList.append(providerTemplate.html());
              return addr;
              //await App.getBalances(addr);
            }).then(function(addr) {
              App.getBalances2(addr);
            });
          }
        })();
    }).catch(function(err) {
        console.log(err.message);
      });
    });


    if (appName != undefined) {
      App.initTestApp(appName);
    }

  },

  getConsumers: function() {
    var consumerList = $('#consumerList');


    if (consumerList.length) {
      console.log('Getting consumers...');

      }
      else
      {
      console.log('No consumers needed.');
        return;
      }


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
          var consumerTemplate = $('#consumerTemplate');
        //reset list
        consumerList.html("");

        (async function loop() {
          for (i = 0; i < result.length; i++) {
            addr = result[i];
            console.log("Adding consumer: " + addr);
            await consumerFactoryInstance.getConsumerInfo(addr).then(function(conName) {
              consumerTemplate.find('.name').text(conName[0]);
              consumerTemplate.find('.address').text(addr);
              consumerTemplate.find('.ownerAddress').text(conName[1]);

              consumerTemplate.find('.btn-addUser').attr("onclick", "App.addUserOverlay('" + addr + "')");
              consumerTemplate.find('.btn-listUser').attr("onclick", "App.listUsers('" + addr + "')");
              consumerTemplate.find('.userList').attr("id", "userList-" + addr );
              consumerTemplate.find('.btn-slConsumer').attr("onclick", "App.selectConsumer('" + conName[0]  + "','"+ addr + "')");
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
            var userList = $('#userList-' + addr);
            var userTemplate = $('#userTemplate');
            //reset list
            userList.html("");
  
            for (i = 0; i < result.length; i++) {
              var userAddr = result[i];
              console.log("Adding user: " + userAddr);
              userTemplate.find('.userName').text(userAddr);
              userTemplate.find('.btn-removeUser').attr("onclick", "App.removeUser('" + addr + "','" + userAddr + "')");

              userList.append(userTemplate.html());

            }
          }).catch(function(err) {
            console.log(err.message);
          });
        });
      },

  getLicenseAssets: function(provAddr, provName) {
    console.log('Getting LicenseAssets for LicenseProvider ' + provAddr);
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var licenseProviderInstance;

      App.contracts.AssetProvider.at(provAddr).then(function(instance) {
        licenseProviderInstance = instance;

        return licenseProviderInstance.getLicenseAssets();
      }).then(function(result) {

        var licenseAssetList = $('#asset-' + provAddr);
        var licenseAssetTemplate = $('#licenseAssetTemplate');

        //reset list
        licenseAssetList.html("");

        (async function loop() {
          for (i = 0; i < result.length; i++) {
            var assetAddr = result[i];
            await licenseProviderInstance.getLicenseAsset(assetAddr).then(function(res) {
              var assetName = res[0];
              var assetCost = res[1];
              var assetId = res[2];
              
              licenseAssetTemplate.find('.laName').text(assetName);
              licenseAssetTemplate.find('.laCost').text(assetCost);
              licenseAssetTemplate.find('.btn-slAssets').attr("onclick", "App.selectAsset('" + provName  + "','"+ provAddr + "','"+ assetName +"','"+ assetCost +"','"+ assetId +"')");

              licenseAssetList.append(licenseAssetTemplate.html());

            });
          }
        })();
    }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  selectAsset : function(provName, provAddr, assetName, assetCost, assetID)
  {
    console.log("selectAsset;provName:"+ provName);
    console.log("selectAsset;provAddr:"+ provAddr);
    console.log("selectAsset;assetName:"+ assetName);
    console.log("selectAsset;assetCost:"+ assetCost);
    console.log("selectAsset;assetID:"+ assetID);

    $('.asset-panel').attr("style", "display:inline;");
    $('.assetProvider').text(provName);
    $('.assetName').text(assetName);
    $('.assetCost').text(assetCost);
    $('.providerAddress').text(provAddr);
    $('.assetID').text(assetID);

    var conName = $("#consumerName").text();
    if (conName != "empty")
    {
        $("#checkoutButton").attr("style", "display:inline;");
    }



  },
  selectConsumer : function(conName, conAddr)
  {
    console.log("selectConsumer;conName:"+ conName);
    console.log("selectConsumer;conAddr:"+ conAddr);

    $('.consumer-panel').attr("style", "display:inline;");
    $('.consumerName').text(conName);
    $('.consumerAddress').text(conAddr);

    if ($("#assetName").text() != "empty")
    {
        $("#checkoutButton").attr("style", "display:inline;");
    }

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
    //event.preventDefault();

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
    //event.preventDefault();

    var amount = $('#amount').val();
    var target = $('#target').val();

    console.log('Buy Token amount: ' + amount);

    var assetProviderInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.AssetProvider.at(addr).then(function(instance) {
        assetProviderInstance = instance;

        return assetProviderInstance.buyTokens(target, {from: account, gas: 100000, value: amount});

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
    //event.preventDefault();

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
  removeUser: function(consumerAddr, userAddr) {
    console.log('Remove User ' + userAddr + ' from Consumer ' + consumerAddr);

    var assetConsumerInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.AssetConsumer.at(consumerAddr).then(function(instance) {
        assetConsumerInstance = instance;

        return assetConsumerInstance.removeUser(userAddr);

      }).then(function(result) {
        alert('Remove Successful!');
      }).catch(function(err) {
        console.log(err.message);
      });

    });
  },  
  checkout: function(event) {
    event.preventDefault();

    var assetProvider =$('#assetProvider').text();
    var assetName =$('#assetName').text();
    var assetCost =$('#assetCost').text();
    var providerAddress =$('#providerAddress').text().valueOf();
    var assetID =$('#assetID').text();

    var consumerName =$('#consumerName').text();
    var consumerAddress = $('#consumerAddress').text().valueOf();


    console.log('Checking out!!!');

    var assetConsumerInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.AssetConsumer.at(consumerAddress).then(function(instance) {
        assetConsumerInstance = instance;
        console.log("found consumer address");
      return assetConsumerInstance.checkoutAsset(providerAddress, assetID);
      }).then(function(result) {
        alert('Checkout Successful!');
        var url = "/TestApp.html?appName=" + assetName +"&appID="+ assetID +"&appConsumer="+consumerAddress+"&appProvider=" +providerAddress + "&appCost=" + assetCost;
        window.open(encodeURI(url), "_blank");

      }).catch(function(err) {
        console.log(err.message);
      });

    });

  },  
  getBalances: function(addrProv) {
      var addrCon;
      var consumerFactoryInstance;
      var balanceList = "";

      App.contracts.ConsumerFactory.deployed().then(function(instance) {
        consumerFactoryInstance = instance;
        return consumerFactoryInstance.getConsumers();
        }).then(function(result) {

        (async function loop2() {
          for (i = 0; i < result.length; i++) {
            addrCon = result[i];
            console.log("query consumer: " + addrCon + "@provider:" + addrProv);

            var instance = await App.contracts.AssetProvider.at(addrProv);
            var res = await instance.getBalance({from: addrCon});
            var name = await consumerFactoryInstance.getConsumerInfo(addrCon);
            balanceList = balanceList + name[0] + ": " + res.c[0];
          }
          $('#LTBalance-' + addrProv).text(balanceList);
        })();
        }).catch(function(err) {
          console.log(err.message);
        });
    },



  getBalances2: function(addr) {
    console.log('Getting balances for provider ' + addr);

    var assetProviderInstance;

      App.contracts.AssetProvider.at(addr).then(function(instance) {
        assetProviderInstance = instance;

        return assetProviderInstance.getBalance();
      }).then(function(result) {
        balance = result.c[0];
        $('#LTBalance-' + addr).text(balance);
        console.log("balance: " + balance);
        return balance;
      }).catch(function(err) {
        console.log(err.message);
      });
  },
  
  initTestApp : function(appName)
  {

    console.log("initTestApp");
    var appID = getUrlParameter('appID');
    var consumerAddr = getUrlParameter('appConsumer');
    var providerAddr = getUrlParameter('appProvider').valueOf();
    var appCost = getUrlParameter('appCost');
    $('.appName').text(appName);
    $('.appID').text(appID);
    $('.appCost').text(appCost);

    $('.appConsumer').text(consumerAddr);
    $('.appProvider').text(providerAddr);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      $('.currentUser').text(account);
      var assetProviderInstance;
      var granted;

      App.contracts.AssetProvider.at('0xf2beae25b23f0ccdd234410354cb42d08ed54981').then(function(instance) {
        assetProviderInstance = instance;

        return assetProviderInstance.getBalance();
      }).then(function(result) {
        var balance = result.c[0];
       

        //var balance = App.getBalances2('0xf2beae25b23f0ccdd234410354cb42d08ed54981');

        if (balance >= appCost)
        {
          granted = "YES";
        }
        else
        {
          granted = "NO";
        }
    $('.appGranted').text(granted);


        console.log("balance: " + balance);
      }).catch(function(err) {
        console.log(err.message);
      });

    });
    




    

  }
}



$(function() {
  $(window).load(function() {
    App.init();
  });
});

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
      }
  }
};