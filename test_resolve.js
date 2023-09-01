var localhost = "http://127.0.0.1:8545"
var Web3 = require("web3")
var web3 = new Web3(new Web3.providers.HttpProvider(localhost))

var account_1 = "0xdAC5bC729247fAc1F2982f6621B60608a3E9d500"
var contractAddress = "0x8F7EB4F6df532268565f3163dF3B06C14235F88a"
var contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "identityIdentifier",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "expiredTime",
				"type": "uint256"
			}
		],
		"name": "registerIdentity",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "resolveIdentity",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

var Identity_Contract = new web3.eth.Contract(contractABI, contractAddress)
var myDate = new Date();
var time1 = myDate.getMilliseconds();
console.log("time1：" + time1);
var last ;
	
var n =12000 ;
for (var i = 1; i <= 1000; i++) {

    Identity_Contract.methods.registerIdentity("pku","pk",6677).send({ from : account_1}, function (error, result) {
		n = n+1;
		console.log("n：" + n); 
	    console.log("结果_store：" + result); 
})
}


for (var i = 1; i <= 20; i++) {
    Identity_Contract.methods.resolveIdentity("10000").send({ from : account_1}, function (error, result) {
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


