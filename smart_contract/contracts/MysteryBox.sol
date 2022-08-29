// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "hardhat/console.sol";

error InsufficientBoxForOpen();
error InsufficientNftInPool();
error InvalidBoxId();
error InvalidRate();
error ValueNotGreaterThanZero();
error AddressesAndTokenIdsMismatch();

/**
 * @title Contrat creates ERC1155 Mystery Boxes that can open random NFTS.
 *
 * @author Dinh Xuan Bui
 *
 * @notice Owner can use NFTs to create mystery boxes.
 * Used NFTs will be boxed and generate the number of 
 * boxes equal to the number of NFTs.
 * Each box can open a random NFT from boxed NFTs.
 * Opened NFT will be remove from boxed NFTs of the box.
 */
contract MysteryBox is
    ERC1155,
    ERC1155Holder,
    IERC721Receiver,
    VRFConsumerBaseV2,
    Ownable
{
    using Counters for Counters.Counter;

    struct NFT {
        address contractAddress;
        uint256 tokenId;
    }

    struct OpenInfo {
        address opener;
        uint256 boxId;
        uint32 amount;
    }

    // Chainlink VRF's related variables
    uint64 private vrfSubscriptionId;
    bytes32 private vrfKeyHash;
    uint32 immutable callbackGasLimit = 200000;
    uint16 immutable requestConfirmations = 3;
    VRFCoordinatorV2Interface private vrfCoordinator;

    Counters.Counter private boxTypeCounter;
    mapping(uint256 => NFT[]) private idToBoxedNFT; /* boxId (tokenID) to its properties */
    mapping(uint256 => OpenInfo) private requestIdToOpenInfo; /* VRF requestId to requester's box openning info */

    // Emit when owner create new box
    event BoxCreated(
        uint256 boxId,
        address[] nftContractAddresses,
        uint256[] nftTokenIDs
    );

    // Emit when user send request to open box
    event OpenBoxRequested(
        uint256 requestId,
        address opener,
        uint256 boxId,
        uint256 amount
    );

    // Emit when VRFCoordinator calls fulfilRandomWords and finish box opening request
    event NFTReceived(
        uint256 requestId,
        address[] nftAddresses,
        uint256[] tokenIds
    );

    // Check whether passed boxId is valid
    modifier validBoxId(uint256 boxId) {
        if (boxId >= boxTypeCounter.current()) revert InvalidBoxId();
        _;
    }

    // Check whether passed value is greater than 0, usually used for check amount passed
    modifier greaterThanZero(uint256 value) {
        if (value < 1) revert ValueNotGreaterThanZero();
        _;
    }

    /**
     * @param coordinatorAddress Chainlink VRFv2 Coordinator contract address
     * @param subscriptionId Subscription id for Chainlink VRF
     * @param keyHash keyHash for Chainlink VRF
     */
    constructor(
        address coordinatorAddress,
        uint64 subscriptionId,
        bytes32 keyHash
    ) ERC1155("") VRFConsumerBaseV2(coordinatorAddress) {
        vrfSubscriptionId = subscriptionId;
        vrfKeyHash = keyHash;
        vrfCoordinator = VRFCoordinatorV2Interface(coordinatorAddress);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC1155Receiver)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC1155).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Owner creates new box type with NFTs.
     * @dev Transfer NFTs to the contract, store boxed NFT's info.
     * Mint new amount of boxes equal to the number of NFTs with new tokenId and
     * transfer them for the owner.
     *
     * @param nftAddresses addresses of NFTs will be boxed as reward of boxes.
     * @param tokenIds tokenIds of NFTs correspond with nftAddress.
     * Eg: [addr1, addr2], [tokenId1, tokenId2] => NFT(addr1, tokenId1), NFT(addr2, tokenId2)
     *
     * Emit {BoxCreated} event.
     *
     * Requirement:
     * Caller must be the owner.
     * Boxed NFT must be greater than 0.
     * nftAddresses and tokenIds must correspond to each other.
     * Owner must own NFTs and approved them for the contract.
     */
    function createBox(address[] memory nftAddresses, uint256[] memory tokenIds)
        external
        onlyOwner
    {
        if (nftAddresses.length != tokenIds.length)
            revert AddressesAndTokenIdsMismatch();
        if (nftAddresses.length < 1) revert ValueNotGreaterThanZero();

        NFT[] storage boxedNft = idToBoxedNFT[boxTypeCounter.current()];

        for (uint256 i = 0; i < nftAddresses.length; i++) {
            IERC721(nftAddresses[i]).transferFrom(
                msg.sender,
                address(this),
                tokenIds[i]
            );
            NFT memory addedNft = NFT(nftAddresses[i], tokenIds[i]);
            boxedNft.push(addedNft);
        }

        _mint(msg.sender, boxTypeCounter.current(), nftAddresses.length, "");
        emit BoxCreated(boxTypeCounter.current(), nftAddresses, tokenIds);

        boxTypeCounter.increment();
    }

    /**
     * @notice User send request to open owned boxes.
     *
     * @dev Burn the opener's amount of boxes and create a Chainlink VRF request, save info of the open with requestId
     * to execute when receive respond from VRF node.
     *
     * @param boxId Id of the box want to open.
     * @param amount Amount of boxes want to open.
     *
     * Emit {OpenBoxRequested} event.
     *
     * Requirements:
     * boxId is valid
     * amount open is greater than 0
     * amount open is smaller or equal to owned boxes
     */
    function openBox(uint256 boxId, uint32 amount)
        external
        validBoxId(boxId)
        greaterThanZero(amount)
    {
        if (balanceOf(msg.sender, boxId) < amount)
            revert InsufficientBoxForOpen();

        _burn(msg.sender, boxId, amount);

        uint256 requestId = vrfCoordinator.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            requestConfirmations,
            callbackGasLimit,
            amount
        );

        OpenInfo memory newOpen = OpenInfo(msg.sender, boxId, amount);
        requestIdToOpenInfo[requestId] = newOpen;
        emit OpenBoxRequested(requestId, msg.sender, boxId, amount);
    }

    /**
     * @dev Chainlink oracle call this function to respond randomWords for open box request.See {https://docs.chain.link/docs/chainlink-vrf/}.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        virtual
        override
    {
        _onGetRandomWords(requestId, randomWords);
    }

    /**
     * @dev Handle randomWords respond of VRF oracle.
     * Receive randomWords, use them to calculate which NFTs the opener will be received.
     * NFT received is randomly taken from boxed NFTs of the box type.
     *
     * Emit {NFTReceived} event.
     */
    function _onGetRandomWords(uint256 requestId, uint256[] memory randomWords)
        public
    {
        OpenInfo memory openInfo = requestIdToOpenInfo[requestId];
        NFT[] storage boxedNfts = idToBoxedNFT[openInfo.boxId];
        address[] memory receivedNftAddresses = new address[](openInfo.amount);
        uint256[] memory receivedNftTokenIds = new uint256[](openInfo.amount);

        for (uint256 i = 0; i < openInfo.amount; i++) {
            uint256 randomResult = randomWords[i] % boxedNfts.length;
            NFT memory receivedNft = boxedNfts[randomResult];

            boxedNfts[randomResult] = boxedNfts[boxedNfts.length - 1];
            boxedNfts.pop();

            IERC721(receivedNft.contractAddress).transferFrom(
                address(this),
                openInfo.opener,
                receivedNft.tokenId
            );
            receivedNftAddresses[i] = receivedNft.contractAddress;
            receivedNftTokenIds[i] = receivedNft.tokenId;
        }

        emit NFTReceived(requestId, receivedNftAddresses, receivedNftTokenIds);
    }

    /**
     * @dev Need for contract to receive ERC721 token. See {ERC721 - safeTransferFrom()}.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }

    function getBoxInfo(uint256 boxId) public view returns (NFT[] memory) {
        return idToBoxedNFT[boxId];
    }

    function getOpenInfo(uint256 requestId)
        public
        view
        returns (OpenInfo memory)
    {
        return requestIdToOpenInfo[requestId];
    }
}
