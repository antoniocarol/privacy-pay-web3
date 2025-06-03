// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AVAXConverter - wrapper para AVAX nativo que habilita operações "shielded" (privadas)
 * @author Adaptado de EERC20Converter
 *
 * MVP simplificado para o seu "PayPal web3" usando AVAX nativo.
 * • shield()          – depósito de AVAX nativo (via msg.value) → cria commitment zk-proof
 * • privateTransfer() – transfere valor dentro do pool privado, ofuscando remetente/valor
 * • unshield()        – resgata AVAX nativo de volta ao remetente
 *
 * Notas:
 * 1. Verificação ZK: mantida off-chain por enquanto (relayer ou SDK).
 * 2. gas payer: funções privateTransfer/unshield restritas ao relayer p/ esconder msg.sender.
 */

contract AVAXConverter {
    // --------------------------------------------------
    // Storage
    // --------------------------------------------------
    address public relayer;               // relayer autorizado
    mapping(bytes32 => bool) public nullifiers;

    // --------------------------------------------------
    // Events
    // --------------------------------------------------
    event Shield(bytes32 indexed commitment, uint256 amount);
    event PrivateTransfer(bytes32 indexed nullifier, bytes32 indexed newCommitment);
    event Unshield(bytes32 indexed nullifier, address indexed to, uint256 amount);

    // --------------------------------------------------
    // Constructor
    // --------------------------------------------------
    constructor() {
        relayer = msg.sender;
    }

    // --------------------------------------------------
    // Admin
    // --------------------------------------------------
    function setRelayer(address _relayer) external {
        require(msg.sender == relayer, "only relayer");
        require(_relayer != address(0), "relayer zero");
        relayer = _relayer;
    }

    // --------------------------------------------------
    // Core
    // --------------------------------------------------
    function shield(bytes32 commitment) external payable {
        require(msg.value > 0, "amount zero");
        // msg.value é o AVAX enviado com a transação
        emit Shield(commitment, msg.value);
    }

    function privateTransfer(bytes32 nullifier, bytes32 newCommitment) external {
        require(msg.sender == relayer, "only relayer");
        require(!nullifiers[nullifier], "nullifier used");
        nullifiers[nullifier] = true;
        emit PrivateTransfer(nullifier, newCommitment);
    }

    function unshield(bytes32 nullifier, address to, uint256 amount) external {
        require(msg.sender == relayer, "only relayer");
        require(!nullifiers[nullifier], "nullifier used");
        require(to != address(0), "to zero");
        require(address(this).balance >= amount, "insufficient balance"); 
        nullifiers[nullifier] = true;
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "transfer failed");
        emit Unshield(nullifier, to, amount);
    }
} 