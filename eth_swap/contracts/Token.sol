// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Gtoken is ERC20, Ownable {
    constructor() ERC20("Gtoken", "GTK") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
}
