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
    address public tokenAddress;

    //mapping (address => LicenseAsset) licenseAssets;
    address[] public licenseAssetsLUT;


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
        tokenAddress = new LuzonToken(_providerName, _providerSymbol);
        
    }

    function addLicenseAsset(string swname, uint8 cost) public {
        require(msg.sender == owner, "Only the provider owner can add license assets");
        licenseAssetCounter++;
        LicenseAsset memory laAddress;
        laAddress.ID = licenseAssetCounter;
        laAddress.name = swname;
        laAddress.cost = cost;

        //licenseAssets[licenseAssetCounter] = laAddress;
        licenseAssetsLUT.push(laAddress);
    }

    function getLicenseAsset(address _addr) public returns (string _name, uint8 _cost) {
        return (licenseAssetsLUT[_addr].name, licenseAssetsLUT[_addr].cost);
    }

    function getLicenseAssets() public view returns (address[]) {
        return licenseAssetsLUT;
    }

    /*functions getTokens(uint amount) public payable {

    }*/
}

contract AssetConsumer {
    address[] public users;
    address public owner;
    uint userCounter;

    constructor (address _creator) public {
        owner = _creator;
        userCounter = 0;
    }

    function addUser(address _user) public {
        require(msg.sender == owner, "Only the owner may add user");
        userCounter++;
        users[userCounter] = new User(100);
    }
}

contract User is Heritable {

  event Sent(address indexed payee, uint256 amount, uint256 balance);
  event Received(address indexed payer, uint256 amount, uint256 balance);


  constructor(uint256 _heartbeatTimeout) Heritable(_heartbeatTimeout) public {}

  /**
   * @dev wallet can receive funds.
   */
  function () external payable {
    emit Received(msg.sender, msg.value, address(this).balance);
  }

  /**
   * @dev wallet can send funds
   */
  function sendTo(address _payee, uint256 _amount) public onlyOwner {
    require(_payee != address(0) && _payee != address(this));
    require(_amount > 0);
    _payee.transfer(_amount);
    emit Sent(_payee, _amount, address(this).balance);
}

}