var localhost = "http://127.0.0.1:8545"
var Web3 = require("web3")
var web3 = new Web3(new Web3.providers.HttpProvider(localhost))

var account_1 = "0xdAC5bC729247fAc1F2982f6621B60608a3E9d500"
var contractAddress = "0x719f2a7208aA2cc95461f8d51C1e3e17dDEf9760"
var contractABI = [
	{
		"inputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "X",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "Y",
								"type": "uint256"
							}
						],
						"internalType": "struct Pairing.G1Point",
						"name": "a",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "uint256[2]",
								"name": "X",
								"type": "uint256[2]"
							},
							{
								"internalType": "uint256[2]",
								"name": "Y",
								"type": "uint256[2]"
							}
						],
						"internalType": "struct Pairing.G2Point",
						"name": "b",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "X",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "Y",
								"type": "uint256"
							}
						],
						"internalType": "struct Pairing.G1Point",
						"name": "c",
						"type": "tuple"
					}
				],
				"internalType": "struct Verifier.Proof",
				"name": "proof",
				"type": "tuple"
			},
			{
				"internalType": "uint256[24]",
				"name": "input",
				"type": "uint256[24]"
			}
		],
		"name": "fortest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "X",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "Y",
								"type": "uint256"
							}
						],
						"internalType": "struct Pairing.G1Point",
						"name": "a",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "uint256[2]",
								"name": "X",
								"type": "uint256[2]"
							},
							{
								"internalType": "uint256[2]",
								"name": "Y",
								"type": "uint256[2]"
							}
						],
						"internalType": "struct Pairing.G2Point",
						"name": "b",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "X",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "Y",
								"type": "uint256"
							}
						],
						"internalType": "struct Pairing.G1Point",
						"name": "c",
						"type": "tuple"
					}
				],
				"internalType": "struct Verifier.Proof",
				"name": "proof",
				"type": "tuple"
			},
			{
				"internalType": "uint256[24]",
				"name": "input",
				"type": "uint256[24]"
			}
		],
		"name": "verifyTx",
		"outputs": [
			{
				"internalType": "bool",
				"name": "r",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

var Verify_Contract = new web3.eth.Contract(contractABI, contractAddress)
var myDate = new Date();
var time1 = myDate.getMilliseconds();
console.log("time1：" + time1);
var last ;
	
for (var i = 1; i <= 10; i++) {
    Verify_Contract.methods.fortest([["0x1712a59ec9c5f4fa12033827973b1595c5f3c73473142961b1ec770e9feaf897","0x222638d7357e48953067aa991e980a2142c2ed3d9a40c57c9e1a6c037bc1bf8e"],[["0x110bb677ab909a452f574cd61d9739b9194d5e75cff42db3e9f61c35358f597d","0x2bc614e4a0eeb505463bbbcdd897237b300eb5c3b2942f5a50b9e0434e980922"],["0x233ff755396c54537770a850dfdb2aa1005efa17b806c55dd6488cf79bd5199d","0x0c1ad659ab350b82e984c15bfb8635b2488ca3362b9faa04b28e2244e3d73bbe"]],["0x26d467e61708622cc19251ef6df27a4cd1d15ac7c598e124c29ec9fcafc9502c","0x13897f9e5bc76e260d177da89901371f1eacf11deaa3b66bfd17ac53dde6eb82"]],["0x0000000000000000000000000000000000000000000000000000000080e26577","0x00000000000000000000000000000000000000000000000000000000aef23f7f","0x00000000000000000000000000000000000000000000000000000000bfa2e3d0","0x00000000000000000000000000000000000000000000000000000000e8899377","0x00000000000000000000000000000000000000000000000000000000da8ae92b","0x000000000000000000000000000000000000000000000000000000003ce61384","0x0000000000000000000000000000000000000000000000000000000002f8a9bd","0x00000000000000000000000000000000000000000000000000000000c1364190","0x0000000000000000000000000000000000000000000000000000000003821329","0x000000000000000000000000000000000000000000000000000000007598b31d","0x000000000000000000000000000000000000000000000000000000000c1976cd","0x00000000000000000000000000000000000000000000000000000000182c5f4c","0x00000000000000000000000000000000000000000000000000000000203053f0","0x00000000000000000000000000000000000000000000000000000000484a1b55","0x000000000000000000000000000000000000000000000000000000000df1b0df","0x00000000000000000000000000000000000000000000000000000000a2275de7","0x000000000000000000000000000000000000000000000000000000008c78f68d","0x00000000000000000000000000000000000000000000000000000000f9c420ec","0x00000000000000000000000000000000000000000000000000000000459c91f0","0x0000000000000000000000000000000000000000000000000000000029fce36a","0x00000000000000000000000000000000000000000000000000000000da494711","0x0000000000000000000000000000000000000000000000000000000055d14a6a","0x00000000000000000000000000000000000000000000000000000000fbb522d0","0x00000000000000000000000000000000000000000000000000000000c6dc013f"]).send({ from : account_1}, function (error, result) {
    console.log("结果_store：" + result);

	var myDate = new Date();
    var time2 = myDate.getMilliseconds();
	if (i==1){
		last = time1;
	} 
	console.log("last:" + last);
    console.log("time2:" + time2);
	console.log("time2-last:" + (time2-last));
	last=time2;
})

}


