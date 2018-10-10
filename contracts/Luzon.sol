pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Heritable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

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
        LuzonToken t = p.luzon();
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
    using SafeMath for uint256;    
    uint public ID;
    address public owner;
    string public name;
    uint public date; // registrationDate
    uint public licenseAssetCounter;
    //address public token;
    LuzonToken public luzon;
    uint256 private _rate = 1;

    mapping (uint => LicenseAsset) licenseAssets;
    uint[] public licenseAssetsLUT;

      event TokensPurchased(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
);

event PreTransfer(address executer, address user, address token, uint balance);


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
        luzon = new LuzonToken(_providerName, _providerSymbol);
        
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

    function getLicenseAsset(uint _num) public view returns (string _name, uint8 _cost, uint _ID) {
        return (licenseAssets[_num].name, licenseAssets[_num].cost, licenseAssets[_num].ID);
    }

    function getLicenseAssets() public view returns (uint[]) {
        return licenseAssetsLUT;
    }

    function buyTokens() public payable {
        //LuzonToken t = LuzonToken(token);

        uint256 weiAmount = msg.value;
        _preValidatePurchase(msg.sender, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        luzon.transfer(msg.sender, tokens);
        owner.transfer(msg.value);

        emit TokensPurchased(
            msg.sender,
            msg.sender,
            weiAmount,
            tokens
            );

    }
    function getBalance() public view returns (uint)
    {
        //LuzonToken t = LuzonToken(token);
        return luzon.balanceOf(msg.sender);
    }
    function approve(address userAddr) public
    {
        //LuzonToken t = LuzonToken(token);
        luzon.approve(userAddr, 9999);
    }
    function transferTokens(address userAddr, uint256 amount) public returns (uint)
    {
            //    LuzonToken t = LuzonToken(token);
        emit PreTransfer(this, userAddr, address(0), 0);

        //return luzon.balanceOf(this);

        /*LuzonToken t = LuzonToken(token);
        emit PreTransfer(this, userAddr);*/
        luzon.transfer(userAddr, amount);
    }
    function _preValidatePurchase(
        address beneficiary,
        uint256 weiAmount
    ) pure
        internal
    {
        require(beneficiary != address(0));
        require(weiAmount != 0);
    }
    function _getTokenAmount(uint256 weiAmount)
    internal view returns (uint256)
    {
        return weiAmount.mul(_rate);
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
    mapping (address => bool) users;
    address public owner;
    string public name;
    uint public userCounter = 0;
    uint public id;
    address public _debugOwner;
    address public _debugMsgSender;
    address public _debugToken;
    address public _debug2Token = 0x66;
    address public _debug2User = 0x66;

          event UserAdded(
    address  owner,
    address  user,
    address  token,
    address  assetProv
);

    constructor (string _name, address _creator, uint _id) public {
        owner = _creator;
        name = _name;
        id = _id;
        userCounter = 0;
    }

    function addUser(address userAddr, address ap) public {
        require(msg.sender == owner, "Only the owner may add user");
        AssetProvider prov = AssetProvider(ap);
        //LuzonToken t = LuzonToken(prov.token());
        //t.approve(userAddr, 1234);
        prov.approve(userAddr);

       emit UserAdded(msg.sender, userAddr, 0, ap);

        userCounter++;
        //address userAddress = new 
        userList.push(userAddr);
        users[userAddr] = true;

        //_debug2Token = prov.token();
        _debug2User = userAddr;
    }

    function getUsers() public view returns (address[]) {
        return userList;
    }    

    function removeUser(address _user) public {
        require(msg.sender == owner, "Only the owner may remove user");
        
        users[_user] = false;
        //LuzonToken t = LuzonToken(token);

        //t.approve(_user, 0);

        for (uint i = 0; i<userList.length; i++) {
            if(userList[i] == _user)
            {
                userCounter--;
                userList[i] = 0x0000000000000000000000000000000000000099;
                return;
            }
        }
    }



    function checkout(address assetProv, uint assetID) public returns (uint)
    {
        require(msg.sender != owner, "The software user cannot be the same account as the software consumer");
        require(users[msg.sender], "User must be approved by the consumer");
        AssetProvider ap = AssetProvider(assetProv);
       // var (string assetName, uint8 cost, uint id) = ap.getLicenseAsset(assetID);
        uint cost;
        (, cost, ) = ap.getLicenseAsset(assetID);

        //LuzonToken lt = LuzonToken(ap.token());
        //_debugToken = ap.token();
        _debugOwner = owner;
        _debugMsgSender = msg.sender;
        return ap.transferTokens(msg.sender, cost);
        //lt.transferFrom(owner, msg.sender, 10);
        //require (lt.transferFrom(this, msg.sender, cost), "didn't receive the necessary asset tokens!");
    }

}