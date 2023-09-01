// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x2ce7c22503d57fb9806fd358724abd90aee5b90768129a50a1afc1a9d79c66f9), uint256(0x0e39ce740d3d039f7e3fe9e9ba822ca017d280b49f5f7a1cfdae3500cde7db03));
        vk.beta = Pairing.G2Point([uint256(0x150e3b1f8ade6cf13471de126fdcba76f11157921c68a2630f327e8e0af13f6d), uint256(0x1906dc92cdc5fee1d3144157fd3faf4972604cc00faa325014c4d5f90ee843ca)], [uint256(0x0850871bd5d594b0ebf6c0d07c71d5a62983115ee1b28a83f08eb6b9c44c5dcd), uint256(0x0dfaacfc1ea784a8cb1abc7f9f3833bb1334d3c808886a17dc1dc90101d42d85)]);
        vk.gamma = Pairing.G2Point([uint256(0x0667bbb969d3a0384a6a9f197d9e41fbb5b9fd229644e5ef1fb392fb6da5017f), uint256(0x2b85b7c16d0cd9dd2c7d74e1d1e94ef648a8bb3fdd24d24177b97e6337878841)], [uint256(0x2fbc3615cae1cc6dd98882c08547bc69efa38746e98375094775069c9eec1108), uint256(0x254d40c34a18fc58dda8b88408a92d96e1aea8d7ab77e81246afbcac2c3604a2)]);
        vk.delta = Pairing.G2Point([uint256(0x15b47f7ccdc53b1f700c75c72d2ba4e427381fb0911af1b757b87662efa63e1d), uint256(0x0d7bafb58ab7e6a8ac341199547136c63ffdcfcb5a2b1c21f1e8ab7a2d838cf6)], [uint256(0x245d1afec40432daab8fe5deaf6af402d378ef80191d3f80ef8024a8f0bdb6da), uint256(0x2586c6e1ffcd94b654c33d030dc75231f139fb23617cbab2a5d68fca9a644fca)]);
        vk.gamma_abc = new Pairing.G1Point[](25);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x2f5777b9e3aed9c5ed85b30372521c33109a91ab18ea3423b3434861f7b45b66), uint256(0x231378129dedbb8f9963c2fd3427a39594e73195f2df0b4a2657eee3f626a6a5));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x045049d2c0701aa1833a25981704022efdefa9934b4c365f19b3404a2c1ab009), uint256(0x22c58252b927191ed8cdfd1a96347bfda5cec8e11cba8874ebab05a475fa96cf));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x11f375381b8139f2bd21ac433c86cdc614df67af2da9062e326ec99e62031a78), uint256(0x2b8d6074177cdd6081d1f2c21002df0af890778e34db334468f1d501dd1741ed));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x2d9fb2be275cd0e39b7fbfcda2142d2a26b9d9fe46bc68313ccd48e200f1fa92), uint256(0x1e79f05afc2f6d6efec8b1b69cb64f8d8b2357e2c57139b38517b62517fb25c6));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x172e5d957832ffeae612d6324014f071bbd0263943ec2798732458818be17681), uint256(0x0b6dd6ce0515cfb79d4f76ff6627d97ef08dcff7d38d7b4e551b5303206a5e94));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x15f399ee311d9ef4452bc4a262ce6dcaaf65c2bd27410d0b1775a898f08690d8), uint256(0x25523ee481cb36d823ba18b672856cd0839cfbe9b6fce9a3abe9475ad0c67f4d));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x104df427367a83e635be27e10b747ea0d3768a51b4bde9197570b5e16e7ae75e), uint256(0x03fcf592615e33a8c78ba72d62c0bc4c54af3088d9e7904a2828fdb394e4d4d0));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x144f7bdb15e9024b8f402439760e3445e5866524d861b573124d830a47d933b7), uint256(0x112cd5e8b0d4e516c710b142f480b1500417acb2f9e61a2570e49f9e84e8e2b1));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x0f4be07696b67cd325f0188663b46512419d3417b81d616d418da164c3a3a8f5), uint256(0x1e8da484a3594fb76286eeb5ae4bd6f3d63b09ba76a64502d7b4be8c93452dbb));
        vk.gamma_abc[9] = Pairing.G1Point(uint256(0x228583b6a754092e4e6f8e9cfde6dd74787151d513e82fb49df15a0d7a52c156), uint256(0x2bfd84e33818d7d024963bbfec12f240c1bbac5532c7b460d300384289e83cb1));
        vk.gamma_abc[10] = Pairing.G1Point(uint256(0x11066f05400002a80fa640ee817b8065620b99262e0d10d5630245dfc4bd089f), uint256(0x01502de600580ae085464e110b61aceb22aea3dd947542401f17a92fefeba0d9));
        vk.gamma_abc[11] = Pairing.G1Point(uint256(0x18d31d03a0b8fd2131d5b7eb43a1eed008f7c3c91b9ef65ef8d3fbd5257391a4), uint256(0x0f10f5d615db8b1c5d6ef5cf86e47855244179f8d32224c63439a8507a3ba4bc));
        vk.gamma_abc[12] = Pairing.G1Point(uint256(0x2fa3572c3eb8c486601b20919bb3a5853d819ff12a31eaa8920b9b2af7a57b40), uint256(0x280ac3014de3af266e7c0c79bfca5f7db7fae0033f199eba3dfb5d53d841c4da));
        vk.gamma_abc[13] = Pairing.G1Point(uint256(0x181d467b0ecfdb24b7b478f1083f642fd7feede587d01ea530dd1a3fe67c1151), uint256(0x1bebdcd8784aee5b4745a9fc4b9e9963a6ac19534e7c8270f814c45adb28cc3b));
        vk.gamma_abc[14] = Pairing.G1Point(uint256(0x20cd9e93e549727aac2307b2316485ea154f35a1da731e93760fe0b4f2c204de), uint256(0x143cfc0f17be6a53a4f0a931617d5a9a5f51a5c5d3b1a46dc50495b0e92a2218));
        vk.gamma_abc[15] = Pairing.G1Point(uint256(0x2d2353c2f9f14fbc9dca257e79de360566bf4321ac2cafd17c5b6374de95a464), uint256(0x158167d7ae60acbd5639b269cecba3e2439b96b20f49b0ab1b23cd73ee0fabc2));
        vk.gamma_abc[16] = Pairing.G1Point(uint256(0x18cb57874051e3c5b57f00794c0fdeccda0a7989f521d6bdc9bdd16af132bf8d), uint256(0x1753a1be5f631b0022018a20c97f8ad3296e6de64708e57fc46bb2d1d34e6a59));
        vk.gamma_abc[17] = Pairing.G1Point(uint256(0x22b2755cb2d9d1ca6c163742253d8e6b285f9ba35e83f5f2b19cff5b7a3559ce), uint256(0x2c605133956d042a7dcaa333c4d73a316881f6087422d03a92fc8850b4621676));
        vk.gamma_abc[18] = Pairing.G1Point(uint256(0x294aa11431584db8dca26c57e379f137bdefe355241c361a06b0030a6119edd5), uint256(0x15c0187f027ca547fef3923805619847f88f3236de6ed8fdefc67b024072dd41));
        vk.gamma_abc[19] = Pairing.G1Point(uint256(0x08be321c0b56556eb3d168dfd4b5b17f637e0247763ee7a148a36e68a3d72b07), uint256(0x267561e6d8b16214f5d24e162597ef465625073dbee1e570eff4295d0b48b970));
        vk.gamma_abc[20] = Pairing.G1Point(uint256(0x29825b8bf3eaaf7b3c94b2c009945df7214bdd53323ad66373b7eb2f7b33e0ec), uint256(0x129476b3d92bea747c059502b926ebb6e3b198f3cd8ce224e8f26dd1a0b3b668));
        vk.gamma_abc[21] = Pairing.G1Point(uint256(0x2a86fd6f1cb52abf6fec3886c22c39c2b504a24b31a9274c0927156963592626), uint256(0x03bd60723a9bd35a2cf658caa4ebcee9009089ebc9847f653e210f74cdc7eb56));
        vk.gamma_abc[22] = Pairing.G1Point(uint256(0x03dad16cc2a85f09d96f6fcfa0b31e27199066538e93cb4a0f93a45cc9e39066), uint256(0x1e2c61936983e45feb2b1d3a4b5d8937301859d020696e10723bc8b500f9e037));
        vk.gamma_abc[23] = Pairing.G1Point(uint256(0x27e384ff9753da5b340557a1b5df3f02ae37d03ea3928bd696cf02ad493f2ad4), uint256(0x2da7d2f54aa9ec321f7b4dc10cd4477b11d0616cf1fab8c3e060a66f972d4c2a));
        vk.gamma_abc[24] = Pairing.G1Point(uint256(0x2226b5d05e7f0103634e1c8e440258fc617f6ab91e6f211cc518416ac1caca4b), uint256(0x1ca7560c9c26dfa9c59d62000b13e90979b097e08afaccb9a42fb01786aa0235));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[24] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](24);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
