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

error MysteryBox__InsufficientBoxForOpen();
error MysteryBox__InsufficientNftInPool();
error MysteryBox__InvalidBoxTypeId();
error MysteryBox__InvalidRate();
error MysteryBox__PriceNotMet();
error MysteryBox__NotEnoughBoxForSale();
error MysteryBox__ValueNotGreaterThanZero();
error MysteryBox__CancelMoreThanSelling();
error MysteryBox__WithdrawFailed();

/**
 * @title Contrat creates ERC1155 Mystery Boxes that can open random NFTS.
 *
 * @author Dinh Xuan Bui
 *
 *
 * @notice
 * The contracts divides NFT to 3 types: common, rare, very rare
 * and keep them in separated pools.
 *
 * Owner can add NFTs to one of these pools and create boxes that
 * have diffirent open rates for NFTs' types.
 * eg: one box can have: 10% to open very rare NFT, 30% for rare and 60% for common NFT.
 *
 * Each box created is an ERC1155 token. Owner can delegate the contract to sell boxes
 * with base price or sell them as normal ERC1155 tokens. Users can directly buy delegated boxes
 * from contracts or buy them from others like normal tokens.
 *
 * User can open owned box to get an random from NFT pool of the contract.
 * Type of the received NFT is based on open rate of box type.
 */
contract MysteryBox is
    ERC1155,
    ERC1155Holder,
    IERC721Receiver,
    VRFConsumerBaseV2,
    Ownable
{
    using Counters for Counters.Counter;

    // 3 types of NFT
    enum NftType {
        COMMON,
        RARE,
        VERY_RARE
    }

    struct NFT {
        address contractAddress;
        uint256 tokenId;
    }

    struct BoxType {
        uint16 commonRate; /* open rate for common NFTs */
        uint16 rareRate; /* open rate for rare NFTs */
        uint16 veryRareRate; /* open rate for very rare NFTs */
        uint256 numberOfBox; /* number of existing boxs */
    }

    struct OpenInfo {
        address opener;
        uint256 boxTypeId;
    }

    // Chainlink VRF's related variables
    uint64 private vrfSubscriptionId;
    bytes32 private vrfKeyHash;
    uint32 immutable callbackGasLimit = 100000;
    uint16 immutable requestConfirmations = 3;
    VRFCoordinatorV2Interface private vrfCoordinator;

    Counters.Counter boxTypeCounter;
    mapping(uint256 => BoxType) idToBoxType; /* boxTypeId (tokenID) to its properties */
    mapping(NftType => NFT[]) nftPool;
    mapping(uint256 => OpenInfo) requestIdToOpenInfo; /* VRF requestId to requester's box openning info */

    // Emit when owner add NFT to pool with specified type.
    event AddNFT(
        address contractAddress, /* NFT's contract address */
        uint256 tokenId, /* NFT tokenId in contract */
        NftType nftType
    );

    // Emit when owner create new box type
    event CreateBoxType(
        uint16 commonRate,
        uint16 rareRate,
        uint16 veryRareRate
    );

    // Emit when owner creates new boxes
    event CreateBox(uint256 boxTypeId, uint256 amount);

    // Emit when user send request to open box
    event RequestOpenBox(
        uint256 requestId,
        address opener,
        uint256 boxTypeId,
        uint256 amount
    );

    // Emit when VRFCoordinator calls fulfilRandomWords and finish box opening request
    event ReceiveNFT(
        uint256 requestId,
        address[] nftAddresses,
        uint256[] tokenIds
    );

    // Emit when owner adds new box to the contract for sale
    event SellBox(uint256 boxTypeId, uint256 amount);

    // Emit when users buy box from contract
    event BuyBox(address buyer, uint256 boxTypeId, uint256 amount);

    // Emit when owner cancel selling of box
    event CancelSelling(uint256 boxTypeId, uint256 amount);

    // Emit when owner changes base price of a box type
    event UpdatePrice(uint256 boxTypeId, uint256 newPrice);

    // Check whether passed boxTypeId is valid
    modifier validBoxType(uint256 boxTypeId) {
        if (boxTypeId >= boxTypeCounter.current())
            revert MysteryBox__InvalidBoxTypeId();
        _;
    }

    // Check whether passed value is greater than 0, usually used for check amount passed
    modifier greaterThanZero(uint256 value) {
        if (value < 1) revert MysteryBox__ValueNotGreaterThanZero();
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
     * @notice Owner add an NFT to a specified pool.
     * @param contractAddress Address of the NFT contract.
     * @param tokenId tokenId of the NFT in contract.
     *
     * Emit {AddNFT} event
     *
     * Requirement:
     * Caller must be the owner of the contract.
     * nftType must be valid.
     * NFT must be approved to the contract.
     */
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
        emit AddNFT(contractAddress, tokenId, nftType);
    }

    /**
     * @notice Owner creates new box type.
     * @param commonRate open rate of common NFT type.
     * @param rareRate open rate of rare NFT type.
     * @param veryRareRate open rate of very rare NFT type.
     *
     * Emit {CreateBoxType} event.
     *
     * Requirement:
     * Caller must be the owner.
     * Sum of rates must be 100.
     */
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
        emit CreateBoxType(commonRate, rareRate, veryRareRate);
    }

    /**
     * @notice Owner create new amount of boxes and mint amount of ERC1155 tokens represent for these boxes.
     *
     * @param boxTypeId ID of the box type owner want to create.
     * @param amount Amount of boxes want to create.
     *
     * Emit {CreateBox} event.
     *
     * Requirement
     * Caller is the owner of contract.
     * boxTypeId passed is valid.
     * Amount created is greater than 0.
     * Amount created must be correspond to the number of NFTs in pool. See {canCreateBox()} function.
     */
    function createBox(uint256 boxTypeId, uint256 amount)
        external
        onlyOwner
        validBoxType(boxTypeId)
        greaterThanZero(amount)
    {
        if (!canCreateBox(boxTypeId, amount))
            revert MysteryBox__InsufficientNftInPool();
        idToBoxType[boxTypeId].numberOfBox += amount;
        _mint(msg.sender, boxTypeId, amount, "");

        emit CreateBox(boxTypeId, amount);
    }

    /**
     * @notice User send request to open owned boxes.
     *
     * @dev Create a Chainlink VRF request, save infos of the open with requestId
     * to execute when receive respond from VRF node.
     *
     * @param boxTypeId Id of the box type want to open.
     * @param amount Amount of boxes want to open.
     *
     * Emit {RequestOpenBox} event.
     *
     * Requirements:
     * boxTypeId is valid
     * amount open is greater than 0
     * amount open is smaller or equal to owned boxes
     */
    function openBox(uint256 boxTypeId, uint32 amount)
        external
        validBoxType(boxTypeId)
        greaterThanZero(amount)
    {
        if (balanceOf(msg.sender, boxTypeId) < amount)
            revert MysteryBox__InsufficientBoxForOpen();
        _burn(msg.sender, boxTypeId, amount);
        uint256 requestId = vrfCoordinator.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            requestConfirmations,
            callbackGasLimit,
            amount
        );
        OpenInfo memory newOpen = OpenInfo(msg.sender, boxTypeId);
        requestIdToOpenInfo[requestId] = newOpen;
        emit RequestOpenBox(requestId, msg.sender, boxTypeId, amount);
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
     * Receive randomWords, use a random word for each box open and
     * calculate type of NFT received base on rates of box type.
     * NFT received is randomly taken from calculated pool, see {_getNftFromPool}.
     *
     * Emit {ReceiveNFT} event.
     */
    function _onGetRandomWords(uint256 requestId, uint256[] memory randomWords)
        private
    {
        OpenInfo memory openInfo = requestIdToOpenInfo[requestId];
        BoxType memory boxType = idToBoxType[openInfo.boxTypeId];
        address[] memory receivedNftAddresses = new address[](
            randomWords.length
        );
        uint256[] memory receivedNftTokenIds = new uint256[](
            randomWords.length
        );
        for (uint256 i = 0; i < randomWords.length; i++) {
            uint256 randomResult = randomWords[i] % 100;
            uint256 nftRandom = uint256(
                keccak256(abi.encode(randomWords[i], i))
            );
            NFT memory receivedNft;
            if (randomResult < boxType.veryRareRate) {
                receivedNft = _getNftFromPool(
                    nftRandom,
                    NftType.VERY_RARE,
                    openInfo.opener
                );
            } else if (randomResult < boxType.veryRareRate + boxType.rareRate) {
                receivedNft = _getNftFromPool(
                    nftRandom,
                    NftType.RARE,
                    openInfo.opener
                );
            } else {
                receivedNft = _getNftFromPool(
                    nftRandom,
                    NftType.COMMON,
                    openInfo.opener
                );
            }
            receivedNftAddresses[i] = receivedNft.contractAddress;
            receivedNftTokenIds[i] = receivedNft.tokenId;
        }
        emit ReceiveNFT(requestId, receivedNftAddresses, receivedNftTokenIds);
    }

    /**
     * @dev Take an NFT from pool and transfer it to the opener.
     * NFT opened will be removed from pool.
     *
     * @param randomWord random word for choosing NFT from pool.
     * @param nftType Type of pool that NFT is taken from.
     * @param receiver The owner of the openned box.
     *
     * @return receivedNft info of received NFT from pool.
     */
    function _getNftFromPool(
        uint256 randomWord,
        NftType nftType,
        address receiver
    ) private returns (NFT memory receivedNft) {
        NFT[] storage pool = nftPool[nftType];
        uint256 nftIndex = randomWord % pool.length;
        receivedNft = pool[nftIndex];
        IERC721(receivedNft.contractAddress).transferFrom(
            address(this),
            receiver,
            receivedNft.tokenId
        );

        // Set index of opened NFT with the last NFT in pool and remove the last NFT.
        pool[nftIndex] = pool[pool.length - 1];
        pool.pop();
    }

    /**
     * @dev get number of NFTs of each NFT type that are boxed in boxes.
     * If a box can open NFT of a type, the boxed NFT of this type will increase 1,
     * and the creable box that can open this NFT type will be decrease 1.
     *
     * @return boxedCommon the number of boxed NFT of common NFT type.
     * @return boxedRare the number of boxed NFT of rare NFT type.
     * @return boxedVeryRare the number of boxed NFT of very rare NFT type.
     */
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

    /**
     * @notice Get the number of creatable boxes for a specified box type.
     *
     * @param boxTypeId Id of the box type.
     *
     * @dev The number of creatable boxes is the minimum of available NFTs in each pool. See {getBoxedNft()}.
     * Eg: very rare pool have 5 nfts, rare pool have 10, common pool have 8.
     * 3 boxes with rates 10% very rare, 20% rare, 70% common
     * 2 boxes with rates 0% very rare, 10% rare, 90% common
     * So the creatable boxes of type 20% very rare, 30% rare, 60% common is min(5 - 3 - 0, 10 - 3 - 2, 8 - 3 - 2) = 2.
     *
     * @param boxTypeId Ids of the box type.
     *
     * @return creatableBoxes the number of creatable boxes for then box type.
     *
     * Requirements:
     * boxTypeId is valid.
     */
    function getCreatableBoxs(uint256 boxTypeId)
        public
        view
        validBoxType(boxTypeId)
        returns (uint256 creatableBoxes)
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
        creatableBoxes = availableCommon;
        if (availableRare < creatableBoxes) {
            creatableBoxes = availableRare;
        }
        if (availableVeryRare < creatableBoxes) {
            creatableBoxes = availableVeryRare;
        }
    }

    /**
     * @dev check whether owner can create new amount boxes of a box type.
     *
     * @param boxTypeId Id of the box type.
     * @param amount the number of boxes want to create.
     *
     * Requirement:
     * The boxTypeId must be valide.
     *
     * @return false if creatable boxes is smaller than amount want to create.
     */
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

    function getNftInPool(NftType nftType)
        public
        view
        returns (NFT[] memory nfts)
    {
        nfts = nftPool[nftType];
    }
}
