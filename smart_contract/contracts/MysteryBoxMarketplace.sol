// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error ValueNotGreaterThanZero();
error PriceNotMet();
error NotEnoughBoxForSale();
error CancelMoreThanSelling();
error WithdrawFailed();

/**
 * @title Marketplace for MysteryBox Contract.
 * @author Dinh Xuan Bui.
 * @notice Owner can delegate contract sell boxes at a fixed base price.
 */
contract MysteryBoxMarketPlace is ERC1155Holder, Ownable {
    // Selling information for a box type.
    struct SellingInfo {
        uint256 quantity;
        uint256 basePrice;
    }

    address public immutable MYSTERY_BOX_CONTRACT_ADDRESS;
    IERC1155 private immutable mysteryBox;

    // boxTypeId to selling info
    mapping(uint256 => SellingInfo) sellingInfos;

    // Emit when owner adds new box to the contract for sale
    event SellBox(uint256 boxTypeId, uint256 amount);

    // Emit when users buy box from contract
    event BuyBox(address buyer, uint256 boxTypeId, uint256 amount);

    // Emit when owner cancel selling of box
    event CancelSelling(uint256 boxTypeId, uint256 amount);

    // Emit when owner changes base price of a box type
    event UpdatePrice(uint256 boxTypeId, uint256 newPrice);

    // Check whether passed value is greater than 0, usually used for check amount passed
    modifier greaterThanZero(uint256 value) {
        if (value < 1) revert ValueNotGreaterThanZero();
        _;
    }

    /**
     * @param mysteryBoxContractAddress address of MysteryBox Contract used for selling.
     */
    constructor(address mysteryBoxContractAddress) {
        MYSTERY_BOX_CONTRACT_ADDRESS = mysteryBoxContractAddress;
        mysteryBox = IERC1155(mysteryBoxContractAddress);
    }

    /**
     * @notice Add new amount of boxes to the contract for sale.
     * @dev tranfer boxes of owner to the contract and update selling
     * info of this box type.
     *
     * Requirement:
     * Only for the owner.
     * amount selling must be greater than 0.
     *
     * @param boxTypeId Id of box type.
     * @param amount amount of boxes want to sell.
     */
    function addSellingBox(uint256 boxTypeId, uint256 amount)
        external
        onlyOwner
        greaterThanZero(amount)
    {
        mysteryBox.safeTransferFrom(
            msg.sender,
            address(this),
            boxTypeId,
            amount,
            ""
        );
        sellingInfos[boxTypeId].quantity += amount;
        emit SellBox(boxTypeId, amount);
    }

    /**
     * @notice buy amount of boxes from contract.
     *
     * Requirement:
     * amount buying must be greater than 0.
     * sender must send enough eth.
     * amount buying must be smaller or equal than selling boxes.
     *
     * @param boxTypeId Id of box type.
     * @param amount amount of boxes want to buy.
     */
    function buyBox(uint256 boxTypeId, uint256 amount)
        external
        payable
        greaterThanZero(amount)
    {
        if (msg.value < sellingInfos[boxTypeId].basePrice * amount)
            revert PriceNotMet();
        if (amount > sellingInfos[boxTypeId].quantity)
            revert NotEnoughBoxForSale();

        mysteryBox.safeTransferFrom(
            address(this),
            msg.sender,
            boxTypeId,
            amount,
            ""
        );

        sellingInfos[boxTypeId].quantity -= amount;

        emit BuyBox(msg.sender, boxTypeId, amount);
    }

    /**
     * @notice owner cancel selling amount boxes of a box type
     *
     * Requirements:
     * only owner can call.
     * amount cancelling must be greater than 0.
     * amount cancelling must be smaller or equal than amount selling.
     *
     * @param boxTypeId Id of box type.
     * @param amount amount of boxes want to cancel.
     */
    function cancelSelling(uint256 boxTypeId, uint256 amount)
        external
        onlyOwner
        greaterThanZero(amount)
    {
        if (sellingInfos[boxTypeId].quantity < amount)
            revert CancelMoreThanSelling();
        mysteryBox.safeTransferFrom(
            address(this),
            msg.sender,
            boxTypeId,
            amount,
            ""
        );
        sellingInfos[boxTypeId].quantity -= amount;
        emit CancelSelling(boxTypeId, amount);
    }

    /**
     * @notice owner update price of a box type.
     *
     * Requirement:
     * only owner can call.
     *
     * @param boxTypeId Id of box type.
     * @param newPrice new price of this box type.
     */
    function updatePrice(uint256 boxTypeId, uint256 newPrice)
        external
        onlyOwner
    {
        sellingInfos[boxTypeId].basePrice = newPrice;
        emit UpdatePrice(boxTypeId, newPrice);
    }

    /**
     *@notice owner withdraw eth of sold boxes from contract.
     */
    function withdraw() external onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) revert WithdrawFailed();
    }
}
