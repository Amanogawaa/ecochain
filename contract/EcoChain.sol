//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract EcoChain {
    struct VerifiedHandoff {
        uint256 id;
        string claimId;
        string donationId;
        address verifier;
        uint256 timestamp;
    }

    uint256 public handoffCount;
    mapping(uint256 => VerifiedHandoff) public handoffs;

    event HandoffVerified(
        uint256 indexed id,
        string claimId,
        string donationId,
        address indexed verifier,
        uint256 timestamp
    );

    function recordVerifiedHandoff(
        string memory claimId,
        string memory donationId
    ) public returns (uint256) {
        handoffCount++;

        handoffs[handoffCount] = VerifiedHandoff(
            handoffCount,
            claimId,
            donationId,
            msg.sender,
            block.timestamp
        );

        emit HandoffVerified(
            handoffCount,
            claimId,
            donationId,
            msg.sender,
            block.timestamp
        );

        return handoffCount;
    }

    function getHandoff(uint256 id)
        public
        view
        returns (VerifiedHandoff memory)
    {
        return handoffs[id];
    }

    function getLatestHandoff()
        public
        view
        returns (VerifiedHandoff memory)
    {
        require(handoffCount > 0, "No handoffs recorded yet");
        return handoffs[handoffCount];
    }
}
