pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

//credit https://github.com/Robin-C/CV/blob/master/src/ethereum/contract/company.sol


//implement timelock?? TokenTimelock.sol
// https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/TokenTimelock.sol

contract CompanyFactory {

    address[] public companyList;
    uint public counter = 0;
    mapping(address => string) names;

    function createCompany(string _name, string _symbol) public {
        counter = counter + 1;
        address newCompanyAddress = new Company(msg.sender, _name, _symbol, counter);
        companyList.push(newCompanyAddress);
        names[newCompanyAddress] = _name;
    }

    function getCompanies() public view returns (address[]) {
        return companyList;
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

    mapping (uint => LicenseAsset) licenseAssets;
    
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
        licenseAssets[licenseAssetCounter].ID = licenseAssetCounter;
        licenseAssets[licenseAssetCounter].name = swname;
        licenseAssets[licenseAssetCounter].cost = cost;
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

    function addCompanion(address _user) public {
        require(msg.sender == owner, "Only the owner may add user");

    }
}

