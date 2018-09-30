pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Heritable.sol";

//credit https://github.com/Robin-C/CV/blob/master/src/ethereum/contract/company.sol


//implement timelock?? TokenTimelock.sol
// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/TokenTimelock.sol

contract ProviderFactory {

    address[] public providerList;
    uint public counter = 0;
    //mapping(address => string) names;
    mapping(address => AssetProvider) public assetStructs;

    function createProvider(string _name, string _symbol) public {
        counter = counter + 1;
        address providerAddress = new AssetProvider(msg.sender, _name, _symbol, counter);
        providerList.push(providerAddress);
        //names[providerAddress] = _name;
        assetStructs[providerAddress] = AssetProvider(providerAddress);
    }

    function getProviders() public view returns (address[]) {
        return providerList;
    }

    function getProviderInfo(address _addr) public view returns (string providerName, string tokenName, string tokenSymbol){
        AssetProvider p = assetStructs[_addr];
        //return (names[_addr], _addr.token.symbol);
        //return (p.name, p.token.symbol);
        LuzonToken t = LuzonToken(p.token());
        return (p.name(), t.name(), t.symbol());

    }
}

contract LuzonToken is StandardToken {

    string public name;
    string public symbol;
    uint8 public decimals = 0;
    uint public INITIAL_SUPPLY = 12000;

    constructor(string _name, string _symbol) public {
        name = string(abi.encodePacked(_name, "Token"));
        symbol = _symbol;
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }


}

contract AssetProvider {
    uint public ID;
    address public owner;
    string public name;
    uint public date; // registrationDate
    uint public licenseAssetCounter;
    address public token;

    mapping (uint => LicenseAsset) licenseAssets;
    uint[] public licenseAssetsLUT;


    struct LicenseAsset {
        uint ID;
        string name;
        uint8 cost;
    }

    constructor (address _creator, string _providerName, string _providerSymbol, uint _counter) public {
        owner = _creator;
        name = _providerName;
        ID = _counter;
        licenseAssetCounter = 0;
        date = now;
        
        //token
        token = new LuzonToken(_providerName, _providerSymbol);
        
    }

    function addLicenseAsset(string swname, uint8 cost) public {
        require(msg.sender == owner, "Only the provider owner can add license assets");
        licenseAssetCounter++;
        LicenseAsset storage laAddress = licenseAssets[licenseAssetCounter];
        laAddress.ID = licenseAssetCounter;
        laAddress.name = swname;
        laAddress.cost = cost;

        licenseAssetsLUT.push(licenseAssetCounter);
    }

    function getLicenseAsset(uint _num) public view returns (string _name, uint8 _cost) {
        return (licenseAssets[_num].name, licenseAssets[_num].cost);
    }

    function getLicenseAssets() public view returns (uint[]) {
        return licenseAssetsLUT;
    }

    function getTokens(uint amount) public {
        //token.transfer(msg.sender, amount);
    }
    function getBalanceOf(address _addr) public view returns (uint)
    {
        LuzonToken t = LuzonToken(token);
        return t.balanceOf(_addr);
    }
}

contract ConsumerFactory {

    address[] public consumerList;
    uint public counter = 0;
    mapping(address => string) names;

    function createConsumer(string _name) public {
        counter = counter + 1;
        address consumerAddress = new AssetConsumer( _name, msg.sender, counter);
        consumerList.push(consumerAddress);
        names[consumerAddress] = _name;
    }

    function getConsumers() public view returns (address[]) {
        return consumerList;
    }

    function getName(address _addr) public view returns (string) {
        return names[_addr];
    }
}

contract AssetConsumer {
    address[] public userList;
    mapping (address => string) users;
    address public owner;
    string public name;
    uint public userCounter = 0;
    uint public id;

    constructor (string _name, address _creator, uint _id) public {
        owner = _creator;
        name = _name;
        id = _id;
        userCounter = 0;
    }

    function addUser(address _user) public {
        require(msg.sender == owner, "Only the owner may add user");
        userCounter++;
        //address userAddress = new 
        userList.push(_user);
    }

    function getUsers() public view returns (address[]) {
        return userList;
    }    

    function removeUser(address _user) public {
        require(msg.sender == owner, "Only the owner may remove user");
        
        for (uint i = 0; i<userList.length; i++) {
            if(userList[i] == _user)
            {
                userCounter--;
                userList[i] = 0x0000000000000000000000000000000000000099;
                return;
            }
        }
    }

}