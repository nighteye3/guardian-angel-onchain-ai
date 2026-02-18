// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GuardianAngel
 * @dev This contract demonstrates an AI-Agent controlled security system.
 * The AI Agent (assigned GUARDIAN_ROLE) can monitor transactions off-chain
 * and trigger emergencyPause() or emergencyWithdraw() if it detects malicious activity.
 */
contract GuardianAngel is AccessControl, Pausable {
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    event EmergencyActionTriggered(string reason, address triggeredBy);
    event FundsRescued(address token, uint256 amount, address to);

    constructor(address _admin, address _aiAgent) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(GUARDIAN_ROLE, _aiAgent);
    }

    /**
     * @dev Called by the AI Agent when it detects a threat.
     * Pauses the contract to prevent further damage.
     * @param reason Description of the threat detected by AI.
     */
    function triggerEmergencyPause(string memory reason) external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit EmergencyActionTriggered(reason, msg.sender);
    }

    /**
     * @dev Admin can unpause after manual review.
     */
    function resolveEmergency() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Example function that would be protected by the Guardian.
     */
    function protectedAction() external whenNotPaused {
        // Logic for critical business operation
    }

    /**
     * @dev In case of a critical confirmed hack, the Guardian (AI) can move funds to cold storage.
     */
    function rescueFunds(address token, address to, uint256 amount) external onlyRole(GUARDIAN_ROLE) {
        require(token != address(0), "Invalid token");
        require(to != address(0), "Invalid recipient");
        
        bool success = IERC20(token).transfer(to, amount);
        require(success, "Transfer failed");
        
        emit FundsRescued(token, amount, to);
    }
}
