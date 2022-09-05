// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SampleNFT is ERC721 {
    constructor() ERC721("Sample Token", "ST") {
        for (uint256 i = 0; i < 20; i++) {
            _safeMint(msg.sender, i);
        }
    }
}
