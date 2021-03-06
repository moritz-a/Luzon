const ProviderFactory = artifacts.require("ProviderFactory");
const ConsumerFactory = artifacts.require("ConsumerFactory");
const AssetProvider = artifacts.require("AssetProvider");
const AssetConsumer = artifacts.require("AssetConsumer");
const LuzonToken = artifacts.require("LuzonToken");



contract('Luzon Tests', async (accounts) => {
    let provFactoryInstance;
    let conFactoryInstance;
    let account1 = accounts[0]; //provider account
    let account2 = accounts[1]; //consumer account
    let account3 = accounts[2]; //user account
    let account4 = accounts[3]; //user account

    let provider1;
    let provAddr1;
    let consumer1;
    let con1addr;
    let token;


  it("TC1-REQ1: should find no Providers on inital deploy", async () => {
    provFactoryInstance = await ProviderFactory.deployed();
     len = await provFactoryInstance.counter();
     assert.equal(len, 0, "Expected zero, but found " + len+ " Providers in Factory");
  });

  it("TC2-REQ1: should find one Providers after create", async () => {
    //let instance = await ProviderFactory.deployed();
    await provFactoryInstance.createProvider("TestProvider", "TestSymbol").length;
    len = await provFactoryInstance.counter();
    assert.equal(len, 1, "Expected one, but found " + len+ " Providers in Factory");


    let result = await provFactoryInstance.getProviders();
    assert.equal(result.length, 1, "unequality of counters!");
            
    for (i = 0; i < result.length; i++) {
        provAddr1 = result[i];
        await provFactoryInstance.getProviderInfo(provAddr1).then(function(provInfo) {
            var provName = provInfo[0];
            var provToken = provInfo[1];
            var provTokenSymbol = provInfo[2];
            assert.equal(provName, "TestProvider");
            assert.equal(provToken, "TestProviderToken");
            assert.equal(provTokenSymbol, "TestSymbol");
        });

        provider1 = await AssetProvider.at(provAddr1);
        let ownerProv = await provider1.owner();
        assert.equal(ownerProv, account1);
    }

     });
     it("TC3-REQ1: should find one Providers on second step", async () => {
        //let instance = await ProviderFactory.deployed();
        len = await provFactoryInstance.counter();
        assert.equal(len, 1, "Expected one, but found " + len+ " Providers in Factory");
     });

     it("TC4-REQ2: add/get license assets", async () => {
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

     it("TC5-REQ4: test consumer factory/ownership", async () => {
        conFactoryInstance = await ConsumerFactory.deployed();
        await conFactoryInstance.createConsumer("TestConsumer", { from: account2 });
        let consumers = await conFactoryInstance.getConsumers();
        con1addr = consumers[0];
        let consumer1Name = await conFactoryInstance.getConsumerInfo(con1addr);
        assert.equal(consumer1Name[0], "TestConsumer");

        await conFactoryInstance.createConsumer("TestConsumer2");
        consumers = await conFactoryInstance.getConsumers();
        con2addr = consumers[1];
        consumer2 = await conFactoryInstance.getConsumerInfo(con2addr);
        assert.equal(consumer2[0], "TestConsumer2");

        consumer1 = await AssetConsumer.at(con1addr);
        let con1owner = await consumer1.owner();
        assert.equal(con1owner, account2);

        let instance2 = await AssetConsumer.at(con2addr);
        let con2owner = await instance2.owner();
        assert.equal(con2owner, account1);
     });

     it("TC6-REQ6: test buy token", async () => {
        let initialBalanceAcc1 = await provider1.getBalance({ from: account1});
        let initialBalanceAcc2 = await provider1.getBalance({ from: account2});
        assert.equal(initialBalanceAcc1.toNumber(), 0);
        assert.equal(initialBalanceAcc2.toNumber(), 0);

        await provider1.buyTokens(con1addr, { from: account2, gas: 100000, value: 100});

        let balance2Acc2 = await provider1.getBalance({ from: con1addr});
        assert.equal(balance2Acc2.toNumber(), 100);

        let balance2Acc1 = await provider1.getBalance({ from: account1});
        assert.equal(balance2Acc1.toNumber(), 0);

        //TODO: check if Acc1 is richer and Acc2 poorer... BigInt mess :-/
     });


     it("TC7-REQ7: add user to consumer", async () => {
         await consumer1.addUser(account3, {from: account2});
         let users = await consumer1.getUsers();
         assert.equal (users[0], account3);

         /*let debug2Token = await consumer1._debug2Token();
         let debug2User = await consumer1._debug2User();
         console.log("debug2Token:" + debug2Token);
         console.log("debug2User:" + debug2User);
         */

         
         await consumer1.addUser(account4, {from: account2});
         users = await consumer1.getUsers();
         assert.equal (users[1], account4);
     });

     it("TC8-REQ9: checkout software", async () => {
        let result = await provider1.getLicenseAsset(1);
        var assetName = result[0];
        var assetCost = result[1];
        var assetId = result[2];
        assert.equal(assetName, "TestSoftware");
        assert.equal(assetCost, 10);
        assert.equal(assetId, 1);

        let balanceAcc1 = await provider1.getBalance({ from: account1});
        let balanceAcc2 = await provider1.getBalance({ from: account2});
        let balanceAcc3 = await provider1.getBalance({ from: account3});
        let balanceProv1 = await provider1.getBalance({ from: provAddr1});
        let balanceCon1 = await provider1.getBalance({ from: con1addr});
        assert.equal(balanceAcc1, 0);
        assert.equal(balanceAcc2, 0);
        assert.equal(balanceAcc3, 0);
        assert.equal(balanceProv1, 11900);
        assert.equal(balanceCon1, 100);

        token =  await consumer1.checkoutAsset(provAddr1, 1, {from: account3, gas: 1000000});
        
         balanceAcc1 = await provider1.getBalance({ from: account1});
         balanceAcc2 = await provider1.getBalance({ from: account2});
         balanceAcc3 = await provider1.getBalance({ from: account3});
         balanceProv1 = await provider1.getBalance({ from: provAddr1});
         balanceCon1 = await provider1.getBalance({ from: con1addr});

         assert.equal(balanceAcc1, 0);
         assert.equal(balanceAcc2, 0);
         assert.equal(balanceAcc3, 10);
         assert.equal(balanceProv1, 11900);
         assert.equal(balanceCon1, 90);


        await consumer1.checkoutAsset(provAddr1, 1, {from: account3, gas: 1000000});

         balanceAcc1 = await provider1.getBalance({ from: account1});
         balanceAcc2 = await provider1.getBalance({ from: account2});
         balanceAcc3 = await provider1.getBalance({ from: account3});
         balanceProv1 = await provider1.getBalance({ from: provAddr1});
         balanceCon1 = await provider1.getBalance({ from: con1addr});
         assert.equal(balanceAcc1, 0);
         assert.equal(balanceAcc2, 0);
         assert.equal(balanceAcc3, 20);
         assert.equal(balanceProv1, 11900);
         assert.equal(balanceCon1, 80);

     });

     it("TC9-REQ10: return software", async () => {
        let result = await provider1.getLicenseAsset(1);
        var assetName = result[0];
        var assetCost = result[1];
        var assetId = result[2];
        assert.equal(assetName, "TestSoftware");
        assert.equal(assetCost, 10);
        assert.equal(assetId, 1);



        let balanceAcc1 = await provider1.getBalance({ from: account1});
        let balanceAcc2 = await provider1.getBalance({ from: account2});
        let balanceAcc3 = await provider1.getBalance({ from: account3});
        let balanceProv1 = await provider1.getBalance({ from: provAddr1});
        let balanceCon1 = await provider1.getBalance({ from: con1addr});
         assert.equal(balanceAcc1, 0);
         assert.equal(balanceAcc2, 0);
         assert.equal(balanceAcc3, 20);
         assert.equal(balanceProv1, 11900);
         assert.equal(balanceCon1, 80);

        let tokenAdr = await provider1.luzon();
        let tokenInstance = await LuzonToken.at(tokenAdr);

        await tokenInstance.transfer(con1addr, 10, {from: account3, gas: 1000000});

        balanceAcc1 = await provider1.getBalance({ from: account1});
        balanceAcc2 = await provider1.getBalance({ from: account2});
        balanceAcc3 = await provider1.getBalance({ from: account3});
        balanceProv1 = await provider1.getBalance({ from: provAddr1});
        balanceCon1 = await provider1.getBalance({ from: con1addr});
        assert.equal(balanceAcc1, 0);
        assert.equal(balanceAcc2, 0);
        assert.equal(balanceAcc3, 10);
        assert.equal(balanceProv1, 11900);
        assert.equal(balanceCon1, 90);        



    });



});