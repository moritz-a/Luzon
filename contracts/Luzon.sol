pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Heritable.sol";

//credit https://github.com/Robin-C/CV/blob/master/src/ethereum/contract/company.sol


//implement timelock?? TokenTimelock.sol
// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/TokenTimelock.sol

contract ProviderFactory {

    address[] public providerList;
    uint public counter = 0;
    mapping(address => string) names;

    function createProvider(string _name, string _symbol) public {
        counter = counter + 1;
        address providerAddress = new AssetProvider(msg.sender, _name, _symbol, counter);
        providerList.push(providerAddress);
        names[providerAddress] = _name;
    }

    function getProviders() public view returns (address[]) {
        return providerList;
    }

    function getName(address _addr) public view returns (string) {
        return names[_addr];
    }
}

contract LuzonToken is StandardToken {

    string public name;
    string public symbol;
    uint8 public decimals = 0;
    uint public INITIAL_SUPPLY = 12000;

    constructor(string _name, string _symbol) public {
        //name = _name + "Token";
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
    LuzonToken public token;

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
        token.transfer(msg.sender, amount);
    }
    function getBalanceOf(address _addr) public view returns (uint256)
    {
        return token.balanceOf(_addr);
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
    address[] public users;
    address public owner;
    string public name;
    uint userCounter;
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
        users[userCounter] = _user;
    }

    function getUsers() public view returns (address[]) {
        return users;
    }    
}