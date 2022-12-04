// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "./filecoinMockAPIs/typeLibraries/MarketTypes.sol";
import "./filecoinMockAPIs/MarketAPI.sol";
import "./addressOracle/AddressOracle.sol";

contract StoremateBounty {
    struct Bounty {
        uint256 amount;
        int64 startAfter;
        bool claimed;
        address creator;
    }
    mapping(string => Bounty[]) bounties;
    mapping(address => Bounty[]) addressMap;
    uint256 minimumBounty = 1000000000000000;
    MarketAPI _marketAPI;
    AddressOracle _addressOracle;

    constructor(address addressOracle, address marketAPI) {
        _addressOracle = AddressOracle(addressOracle);
        _marketAPI = MarketAPI(marketAPI);
    }

    function createBounty(string memory cid, int64 startAfter) public {
        bounties[cid].push(Bounty(0, startAfter, false, msg.sender));
    }

    function claimBounty(string memory cid, uint256 index, uint64 dealId) public {
        require(bounties[cid][index].claimed == false);
        bytes32 receiverHash = keccak256(abi.encodePacked(_addressOracle.getF0Address(msg.sender)));
        bytes32 clientHash = keccak256(abi.encodePacked(_marketAPI.get_deal_client(MarketTypes.GetDealClientParams(dealId)).client));
        int64 startData = _marketAPI.get_deal_term(MarketTypes.GetDealTermParams(dealId)).start;
        require(receiverHash == clientHash && block.number > uint256(uint64(startData)));
        bounties[cid][index].claimed = true;
    }

    function getBountiesForCid(string memory cid) public view returns (Bounty[] memory) {
        Bounty[] memory cidBounties = bounties[cid];
        return cidBounties;
    }
}
