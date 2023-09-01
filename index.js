var localhost = "http://127.0.0.1:8545"
var Web3 = require("web3")
var web3 = new Web3(new Web3.providers.HttpProvider(localhost))
web3.eth.getAccounts(function (error, result) {
    console.log("账户列表地址：");
    console.log(result);
});

var account_1 = "0x3b622B0185112122f21B0BAf53753a44618E64DB"
var contractAddress = "0xBD33CD9Dc52390ABe9533eB4Cd8A4a7A668b372F"
var contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "retrieve",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

var Storage_Contract = new web3.eth.Contract(contractABI, contractAddress)
// Storage_Contract.options.data = data;
Storage_Contract.methods.store(10).send({ from : account_1}, function (error, result) {
    console.log("结果_store：" + result);
})


Storage_Contract.methods.retrieve().call({ from : account_1}, function(error, result) {
    console.log("结果_retrieve： " + result);
})