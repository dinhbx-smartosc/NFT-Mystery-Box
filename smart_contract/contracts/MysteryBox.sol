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

error MysteryBox__InvalidOpenAmount();
error MysteryBox__InsufficientNftInPool();
error MysteryBox__InvalidBoxTypeId();
error MysteryBox__InvalidRate();

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

    struct BoxType {
        uint16 commonRate;
        uint16 rareRate;
        uint16 veryRareRate;
        uint256 numberOfBox;
    }

    struct OpenInfo {
        address opener;
        uint256 boxTypeId;
    }

    enum NftType {
        COMMON,
        RARE,
        VERY_RARE
    }

    uint64 private vrfSubscriptionId;
    bytes32 private vrfKeyHash;
    uint32 immutable callbackGasLimit = 100000;
    uint16 immutable requestConfirmations = 3;
    VRFCoordinatorV2Interface private vrfCoordinator;

    Counters.Counter boxTypeCounter;
    mapping(uint256 => BoxType) idToBoxType;
    mapping(NftType => NFT[]) nftPool;
    mapping(uint256 => OpenInfo) requestIdToOpenInfo;

    constructor(
        address coordinatorAddress,
        uint64 subsctiptionId,
        bytes32 keyHash
    ) ERC1155("") VRFConsumerBaseV2(coordinatorAddress) {
        vrfSubscriptionId = subsctiptionId;
        vrfKeyHash = keyHash;
        vrfCoordinator = VRFCoordinatorV2Interface(coordinatorAddress);
    }

    modifier validBoxType(uint256 boxTypeId) {
        if (boxTypeId >= boxTypeCounter.current())
            revert MysteryBox__InvalidBoxTypeId();
        _;
    }

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

    function addNftToPool(
        address contractAddress,
        uint256 tokenId,
        NftType nftType
    ) external onlyOwner {
        IERC721(contractAddress).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );
        NFT memory newNFT = NFT(contractAddress, tokenId);
        nftPool[nftType].push(newNFT);
    }

    function createBoxType(
        uint16 commonRate,
        uint16 rareRate,
        uint16 veryRareRate
    ) external onlyOwner {
        if (commonRate + rareRate + veryRareRate != 100)
            revert MysteryBox__InvalidRate();
        BoxType memory newBoxType = BoxType(
            commonRate,
            rareRate,
            veryRareRate,
            0
        );
        idToBoxType[boxTypeCounter.current()] = newBoxType;
        boxTypeCounter.increment();
    }

    function createBox(uint256 boxTypeId, uint256 amount)
        external
        onlyOwner
        validBoxType(boxTypeId)
    {
        if (!canCreateBox(boxTypeId, amount))
            revert MysteryBox__InsufficientNftInPool();
        idToBoxType[boxTypeId].numberOfBox += amount;
        _mint(msg.sender, boxTypeId, amount, "");
    }

    function openBox(uint256 boxTypeId, uint32 amount)
        external
        validBoxType(boxTypeId)
    {
        if (balanceOf(msg.sender, boxTypeId) < amount)
            revert MysteryBox__InvalidOpenAmount();
        _burn(msg.sender, boxTypeId, amount);
        uint256 requestId = vrfCoordinator.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            requestConfirmations,
            callbackGasLimit,
            amount
        );
        OpenInfo memory newOpen = OpenInfo(msg.sender, amount);
        requestIdToOpenInfo[requestId] = newOpen;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        virtual
        override
    {
        _onGetRandomWords(requestId, randomWords);
    }

    function _onGetRandomWords(uint256 requestId, uint256[] memory randomWords)
        private
    {
        OpenInfo memory openInfo = requestIdToOpenInfo[requestId];
        BoxType memory boxType = idToBoxType[openInfo.boxTypeId];
        for (uint256 i = 0; i < randomWords.length; i++) {
            uint256 randomResult = randomWords[i] % 100;
            uint256 nftRandom = uint256(
                keccak256(abi.encode(randomWords[i], i))
            );
            if (randomResult < boxType.veryRareRate) {
                _getNftFromPool(nftRandom, NftType.VERY_RARE, openInfo.opener);
            } else if (randomResult < boxType.veryRareRate + boxType.rareRate) {
                _getNftFromPool(nftRandom, NftType.RARE, openInfo.opener);
            } else {
                _getNftFromPool(nftRandom, NftType.COMMON, openInfo.opener);
            }
        }
    }

    function _getNftFromPool(
        uint256 randomWord,
        NftType nftType,
        address receiver
    ) private {
        NFT[] storage pool = nftPool[nftType];
        uint256 nftIndex = randomWord % pool.length;
        IERC721(pool[nftIndex].contractAddress).transferFrom(
            address(this),
            receiver,
            pool[nftIndex].tokenId
        );
        pool[nftIndex] = pool[pool.length - 1];
        pool.pop();
    }

    function getCreatableBoxs(uint256 boxTypeId)
        public
        view
        validBoxType(boxTypeId)
        returns (uint256 creatableBoxs)
    {
        (
            uint256 boxedCommon,
            uint256 boxedRare,
            uint256 boxedVeryRare
        ) = getBoxedNft();
        uint256 availableCommon = nftPool[NftType.COMMON].length - boxedCommon;
        uint256 availableRare = nftPool[NftType.RARE].length - boxedRare;
        uint256 availableVeryRare = nftPool[NftType.VERY_RARE].length -
            boxedVeryRare;
        creatableBoxs = availableCommon;
        if (availableRare < creatableBoxs) {
            creatableBoxs = availableRare;
        }
        if (availableVeryRare < creatableBoxs) {
            creatableBoxs = availableVeryRare;
        }
    }

    function canCreateBox(uint256 boxTypeId, uint256 amount)
        public
        view
        validBoxType(boxTypeId)
        returns (bool)
    {
        (
            uint256 boxedCommon,
            uint256 boxedRare,
            uint256 boxedVeryRare
        ) = getBoxedNft();
        BoxType memory boxType = idToBoxType[boxTypeId];
        if (
            boxType.commonRate > 0 &&
            boxedCommon + amount > nftPool[NftType.COMMON].length
        ) {
            return false;
        }
        if (
            boxType.rareRate > 0 &&
            boxedRare + amount > nftPool[NftType.RARE].length
        ) {
            return false;
        }
        if (
            boxType.veryRareRate > 0 &&
            boxedVeryRare + amount > nftPool[NftType.VERY_RARE].length
        ) {
            return false;
        }
        return true;
    }

    function getBoxedNft()
        public
        view
        returns (
            uint256 boxedCommon,
            uint256 boxedRare,
            uint256 boxedVeryRare
        )
    {
        uint256 currentCounter = boxTypeCounter.current();
        for (uint256 i = 0; i < currentCounter; i++) {
            BoxType memory boxType = idToBoxType[i];
            if (boxType.commonRate > 0) {
                boxedCommon += boxType.numberOfBox;
            }
            if (boxType.rareRate > 0) {
                boxedRare += boxType.numberOfBox;
            }
            if (boxType.veryRareRate > 0) {
                boxedVeryRare += boxType.numberOfBox;
            }
        }
    }

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
}
