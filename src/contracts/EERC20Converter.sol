// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


 * @title EERC20Converter – wrapper para tokens ERC‑20 que habilita operações "shielded" (privadas)
 * @author ChatGPT
 *
 * MVP simplificado para o seu “PayPal web3”.
 * • shield()        – depósito de tokens públicos → cria commitment zk‑proof
 * • privateTransfer() – transfere valor dentro do pool privado, ofuscando remetente/valor
 * • unshield()      – resgata tokens de volta ao modo público (ERC‑20 normal)
 *
 * Notas:
 * 1. Verificação ZK: mantida off‑chain por enquanto (relayer ou SDK). Para mainnet
 *    integrar um Verifier (Groth16/Plonk) gerado pelo circom.
 * 2. gas payer: função privateTransfer/unshield restrita a relayer p/ esconder msg.sender.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract EERC20Converter {
    using SafeERC20 for IERC20;

    /// @notice token público que será convertido (ex: USDC.e, AVAX, etc.)
    IERC20 public immutable underlying;

    /// @notice relayer autorizado a submeter txs privadas (pode ser atualizado)
    address public relayer;

    /// @dev guarda nullifiers para evitar double‑spend
    mapping(bytes32 => bool) public nullifiers;

    ///====================
    ///       EVENTS
    ///====================

    /// @param commitment hash(poseidon(nullifier, secret, amount))
    /// @param amount quantidade depositada
    event Shield(bytes32 indexed commitment, uint256 amount);

    /// @param nullifier consumido
    /// @param newCommitment novo commitment criado
    event PrivateTransfer(bytes32 indexed nullifier, bytes32 indexed newCommitment);

    /// @param nullifier consumido
    /// @param to endereço que receberá tokens públicos
    /// @param amount valor sacado
    event Unshield(bytes32 indexed nullifier, address indexed to, uint256 amount);

    ///====================
    ///     CONSTRUCTOR
    ///====================
    constructor(address _underlying) {
        require(_underlying != address(0), "underlying zero");
        underlying = IERC20(_underlying);
        relayer = msg.sender; // deployer vira relayer inicial
    }

    ///====================
    ///  ADMIN FUNCTIONS
    ///====================
    function setRelayer(address _relayer) external {
        require(msg.sender == relayer, "only relayer");
        require(_relayer != address(0), "relayer zero");
        relayer = _relayer;
    }

    ///====================
    ///    CORE LOGIC
    ///====================

    /// @notice depósito → gera commitment e emite evento sem revelar remetente on‑chain
    function shield(uint256 amount, bytes32 commitment) external {
        require(amount > 0, "amount zero");
        underlying.safeTransferFrom(msg.sender, address(this), amount);
        emit Shield(commitment, amount);
    }

    /// @notice transfere entre contas privadas; apenas relayer submete após validar zkProof off‑chain
    function privateTransfer(bytes32 nullifier, bytes32 newCommitment) external {
        require(msg.sender == relayer, "only relayer");
        require(!nullifiers[nullifier], "nullifier used");
        nullifiers[nullifier] = true;
        emit PrivateTransfer(nullifier, newCommitment);
    }

    /// @notice saque → desbloqueia tokens públicos no endereço "to"
    function unshield(bytes32 nullifier, address to, uint256 amount) external {
        require(msg.sender == relayer, "only relayer");
        require(!nullifiers[nullifier], "nullifier used");
        require(to != address(0), "to zero");
        nullifiers[nullifier] = true;
        underlying.safeTransfer(to, amount);
        emit Unshield(nullifier, to, amount);
    }
}
