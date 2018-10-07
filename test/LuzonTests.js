const ProviderFactory = artifacts.require("ProviderFactory");
const ConsumerFactory = artifacts.require("ConsumerFactory");
const AssetProvider = artifacts.require("AssetProvider");
const AssetConsumer = artifacts.require("AssetConsumer");


contract('Luzon Tests', async (accounts) => {
    let provFactoryInstance;
    let conFactoryInstance;
    let account1 = accounts[0]; //provider account
    let account2 = accounts[1]; //consumer account
    let account3 = accounts[2]; //user account
    let provider1;
    let consumer1;


  it("should find no Providers on inital deploy", async () => {
    provFactoryInstance = await ProviderFactory.deployed();
     len = await provFactoryInstance.counter();
     assert.equal(len, 0, "Expected zero, but found " + len+ " Providers in Factory");
  });

  it("should find one Providers after create", async () => {
    //let instance = await ProviderFactory.deployed();
    await provFactoryInstance.createProvider("TestProvider", "TestSymbol").length;
    len = await provFactoryInstance.counter();
    assert.equal(len, 1, "Expected one, but found " + len+ " Providers in Factory");


    let result = await provFactoryInstance.getProviders();
    assert.equal(result.length, 1, "unequality of counters!");
            
    for (i = 0; i < result.length; i++) {
        addr = result[i];
        await provFactoryInstance.getProviderInfo(addr).then(function(provInfo) {
            var provName = provInfo[0];
            var provToken = provInfo[1];
            var provTokenSymbol = provInfo[2];
            assert.equal(provName, "TestProvider");
            assert.equal(provToken, "TestProviderToken");
            assert.equal(provTokenSymbol, "TestSymbol");
        });

        provider1 = await AssetProvider.at(addr);
        let ownerProv = await provider1.owner();
        assert.equal(ownerProv, account1);
    }

     });
     it("should find one Providers on second step", async () => {
        //let instance = await ProviderFactory.deployed();
        len = await provFactoryInstance.counter();
        assert.equal(len, 1, "Expected one, but found " + len+ " Providers in Factory");
     });

     it("should find one Providers on second step", async () => {
        len = await provFactoryInstance.counter();
        assert.equal(len, 1, "Expected one, but found " + len+ " Providers in Factory");
     });
     it("add/get license assets", async () => {
        let result = await provFactoryInstance.getProviders();
        let provAddr = result[0];
        let instance = await AssetProvider.at(provAddr);
        let name = await instance.name();
        assert.equal(name, "TestProvider");

        await instance.addLicenseAsset("TestSoftware", 10);
        let result2 = await instance.getLicenseAsset(1);
        var assetName = result2[0];
        var assetCost = result2[1];
        var assetId = result2[2];
        assert.equal(assetName, "TestSoftware");
        assert.equal(assetCost, 10);
        assert.equal(assetId, 1);

        await instance.addLicenseAsset("SchrottSoftware", 5);
        result2 = await instance.getLicenseAsset(2);
        assetName = result2[0];
        assetCost = result2[1];
        assetId = result2[2];
        assert.equal(assetName, "SchrottSoftware");
        assert.equal(assetCost, 5);
        assert.equal(assetId, 2);


     });

     it("test consumer factory/ownership", async () => {
        conFactoryInstance = await ConsumerFactory.deployed();
        await conFactoryInstance.createConsumer("TestConsumer", { from: account2 });
        let consumers = await conFactoryInstance.getConsumers();
        let con1addr = consumers[0];
        consumer1 = await conFactoryInstance.getName(con1addr);
        assert.equal(consumer1, "TestConsumer");

        await conFactoryInstance.createConsumer("TestConsumer2");
        consumers = await conFactoryInstance.getConsumers();
        con2addr = consumers[1];
        consumer2 = await conFactoryInstance.getName(con2addr);
        assert.equal(consumer2, "TestConsumer2");

        let instance = await AssetConsumer.at(con1addr);
        let con1owner = await instance.owner();
        assert.equal(con1owner, account2);

        let instance2 = await AssetConsumer.at(con2addr);
        let con2owner = await instance2.owner();
        assert.equal(con2owner, account1);
     });

     it("test buy token", async () => {
        //let tokenAddr = await provider1.token();
        //let token = await LuzonToken.at(tokenAddr);
        let initialBalanceAcc1 = await provider1.getBalance({ from: account1});
        let initialBalanceAcc2 = await provider1.getBalance({ from: account2});
        assert.equal(initialBalanceAcc1, 0);
        assert.equal(initialBalanceAcc2, 0);

        await provider1.buyTokens(account2, { from: account2, gas: 100000, value: 100});

        let balance2Acc2 = await provider1.getBalance({ from: account2});
        assert.equal(balance2Acc2.toNumber(), 100);

        let balance2Acc1 = await provider1.getBalance({ from: account1});
        assert.equal(balance2Acc1.toNumber(), 0);

        //TODO: check if Acc1 is richer and Acc2 poorer... BigInt mess :-/
     });

     

});