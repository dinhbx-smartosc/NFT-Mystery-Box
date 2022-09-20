// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error ValueNotGreaterThanZero();
error PriceNotMet();
error NotEnoughBoxForSale();
error CancelMoreThanSelling();
error WithdrawFailed();
error NotSaleOwner();
error UpdateEndSale();

/**
 * @title Marketplace for MysteryBox Contract.
 * @author Dinh Xuan Bui.
 * @notice Box's owners can list box for sale.
 */
contract MysteryBoxMarketPlace is ERC1155Holder, Ownable {
    using Counters for Counters.Counter;

    // info of a box sale
    struct Sale {
        address seller;
        uint256 boxId;
        uint256 quantity;
        uint256 priceEach;
    }

    address public immutable MYSTERY_BOX_CONTRACT_ADDRESS;
    IERC1155 private immutable mysteryBox;

    Counters.Counter private saleIdCounter;
    // sale id to its info
    mapping(uint256 => Sale) private idToSale;
    mapping(address => uint256) private sellerToBalance;

    // Emit when seller create new box sale.
    event SaleCreated(
        address seller,
        uint256 boxId,
        uint256 amount,
        uint256 priceEach,
        uint256 saleId
    );

    // Emit when users buy box
    event BoxBought(address buyer, uint256 saleId, uint256 amount);

    // Emit when seller cancel selling amount of box
    event SaleCanceled(uint256 saleId, uint256 amount);

    // Emit when seller update price of box
    event PriceUpdated(uint256 saleId, uint256 newPrice);

    event Withdraw(address account, uint256 value);

    // Check whether passed value is greater than 0, usually used for check amount passed
    modifier greaterThanZero(uint256 value) {
        if (value < 1) revert ValueNotGreaterThanZero();
        _;
    }

    // Check whether caller is the owner of the sale
    modifier onlySaleOwner(uint256 saleId) {
        if (idToSale[saleId].seller != msg.sender) revert NotSaleOwner();
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
     * @notice Create new box sale with passed quantity and price.
     * @dev Transfer boxes of seller to the contract and create new sale.
     *
     * Requirement:
     * Seller have enough box and approved them for the contract.
     * Amount selling must be greater than 0.
     *
     * @param boxId Id of box.
     * @param amount amount of boxes want to sell.
     * @param priceEach price of each box.
     */
    function createSale(
        uint256 boxId,
        uint256 amount,
        uint256 priceEach
    ) external greaterThanZero(amount) {
        mysteryBox.safeTransferFrom(
            msg.sender,
            address(this),
            boxId,
            amount,
            ""
        );

        Sale memory newSale = Sale(msg.sender, boxId, amount, priceEach);
        idToSale[saleIdCounter.current()] = newSale;

        emit SaleCreated(
            msg.sender,
            boxId,
            amount,
            priceEach,
            saleIdCounter.current()
        );

        saleIdCounter.increment();
    }

    /**
     * @notice Buy amount of boxes from sale.
     * @dev Transfer amount of bought boxes to the buyer and update sale info.
     *
     * Requirement:
     * Amount buying must be greater than 0.
     * Buyer must send enough eth.
     * Amount buying must be smaller or equal than selling boxes.
     *
     * @param saleId Id of the sale.
     * @param amount Amount of boxes want to buy.
     */
    function buyBox(uint256 saleId, uint256 amount)
        external
        payable
        greaterThanZero(amount)
    {
        Sale storage sale = idToSale[saleId];

        if (msg.value < sale.priceEach * amount) revert PriceNotMet();
        if (amount > sale.quantity) revert NotEnoughBoxForSale();

        mysteryBox.safeTransferFrom(
            address(this),
            msg.sender,
            sale.boxId,
            amount,
            ""
        );

        sale.quantity -= amount;
        sellerToBalance[sale.seller] += msg.value;

        emit BoxBought(msg.sender, saleId, amount);
    }

    /**
     * @notice Seller cancel selling amount boxes of a sale.
     * @dev Transfer boxes back to seller and update sale info.
     *
     * Requirements:
     * Only the seller can call.
     * Amount cancelling must be greater than 0.
     * Amount cancelling must be smaller or equal than amount selling.
     *
     * @param saleId Id of the sale.
     * @param amount amount of boxes want to cancel.
     */
    function cancelSelling(uint256 saleId, uint256 amount)
        external
        onlySaleOwner(saleId)
        greaterThanZero(amount)
    {
        Sale storage sale = idToSale[saleId];

        if (sale.quantity < amount) revert CancelMoreThanSelling();

        mysteryBox.safeTransferFrom(
            address(this),
            msg.sender,
            sale.boxId,
            amount,
            ""
        );
        sale.quantity -= amount;
        emit SaleCanceled(saleId, amount);
    }

    /**
     * @notice Seller update box's price of a sale.
     *
     * Requirement:
     * only seller can call.
     *
     * @param saleId Id of the sale.
     * @param newPrice new price of this box type.
     */
    function updatePrice(uint256 saleId, uint256 newPrice)
        external
        onlySaleOwner(saleId)
    {
        if (idToSale[saleId].quantity == 0) revert UpdateEndSale();
        idToSale[saleId].priceEach = newPrice;
        emit PriceUpdated(saleId, newPrice);
    }

    /**
     *@notice seller withdraw eth of sold boxes from contract.
     */
    function withdraw() external {
        uint256 currentBalance = sellerToBalance[msg.sender];
        sellerToBalance[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: currentBalance}("");
        if (!success) revert WithdrawFailed();
        emit Withdraw(msg.sender, currentBalance);
    }

    function getSale(uint256 saleId) public view returns (Sale memory) {
        return idToSale[saleId];
    }

    function getBalance(address seller) public view returns (uint256 balance) {
        balance = sellerToBalance[seller];
    }
}
