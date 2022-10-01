// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

contract VRFCoordinator is VRFCoordinatorV2Mock {
    address public linkTokenAddress;

    constructor(
        uint96 _baseFee,
        uint96 _gasPriceLink,
        address _linkTokenAddress
    ) VRFCoordinatorV2Mock(_baseFee, _gasPriceLink) {
        linkTokenAddress = _linkTokenAddress;
    }

    function onTokenTransfer(
        address, /* sender */
        uint256 amount,
        bytes calldata data
    ) external {
        if (msg.sender != linkTokenAddress) {
            revert();
        }
        require(msg.sender == linkTokenAddress, "OnlyCallableFromLink");
        require(data.length == 32, "InvalidCalldata");
        uint64 subId = abi.decode(data, (uint64));
        require(
            s_subscriptions[subId].owner != address(0),
            "InvalidSubscription"
        );

        // We do not check that the msg.sender is the subscription owner,
        // anyone can fund a subscription.
        s_subscriptions[subId].balance += uint96(amount);
    }
}
