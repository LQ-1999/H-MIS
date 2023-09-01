const SHA256 = require('crypto-js/sha256')
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const depth = 3
const TxNum = 4

class User {
    constructor(username, identityIdentifier, registerTime, expiredTime) {
        this.username = username
        this.identityIdentifier = identityIdentifier
        this.registerTime = registerTime
        this.expiredTime = expiredTime
    }

    getHashValue() {
        let hashValue = SHA256(JSON.stringify(this))
        for (let i = 0; i < 8; i ++) {
            hashValue['words'][i] = hashValue['words'][i] >>> 0
        }
        return hashValue['words']
    }
}

class Witness {
    constructor (preRoot, neRoot, directionSelector, path, origin, changed) {
        this.preRoot = preRoot
        this.neRoot = neRoot
        this.directionSelector = directionSelector
        this.path = path
        this.origin = origin
        this.changed = changed
    }
}

class MerkleTree {
    constructor () {
        this.leafNum = 0;
        this.maxNum = 2 ** (depth-1)
        this.del_set = new Set()
        this.ptr = 0
        this.Txs = []

        this.tree = new Array(depth)
        for (let i = 0; i < depth; i++) {
            this.tree[i] = new Array(2 ** i).fill(new Array(8).fill(0))
        }

        for (let i = depth - 2; i >= 0; i--) {
            for (let j = 0; j < 2 ** i; j++) {
                this.tree[i][j] = this.pedersen(this.tree[i + 1][2 * j], this.tree[i + 1][2 * j + 1])
            }
        }
    }

    updateIdx(idx) {
        if (idx % 2 == 1)
            return idx / 2 - 0.5
        return idx / 2
    }

    getDirectionSelector(idx) {
        if (idx % 2 == 1) return true
        return false
    }

    pedersen(a, b) {
        const Http = new XMLHttpRequest();
        const url='http://124.220.81.155:9999/?a=' + JSON.stringify(a) + '&b=' + JSON.stringify(b)
        // console.log(url)
        Http.open("GET", url,false)
        Http.send()
        // console.log("response: " + Http.responseText)
        return JSON.parse(Http.responseText)
    }

    insert(a) {
        if (this.leafNum == this.maxNum) return false

        let preRoot = this.tree[0][0]
        let neRoot
        let directionSelector = []
        let path = []
        let origin
        let changed = a

        let idx = -1

        if (this.del_set.size != 0) {
            let min_idx = this.maxNum
            for (let i of this.del_set) {
                if (min_idx > i) {
                    min_idx = i
                }
            }
            idx = min_idx
            this.del_set.delete(min_idx)
        } else {
            idx = this.ptr
            this.ptr ++
        }

        origin = this.tree[depth - 1][idx]
        this.tree[depth - 1][idx] = a
        directionSelector.push(this.getDirectionSelector(idx))
        if (this.getDirectionSelector(idx)) {
            path.push(this.tree[depth - 1][idx - 1])
        } else {
            path.push(this.tree[depth-1][idx + 1])
        }
        idx = this.updateIdx(idx)

        // console.log("a:" + a + " idx:" + idx)
        for (let i = depth - 2; i >= 0; i--) {

            this.tree[i][idx] = this.pedersen(this.tree[i + 1][2 * idx], this.tree[i + 1][2 * idx + 1])
            if (i != 0) {
                directionSelector.push(this.getDirectionSelector(idx))
                if (this.getDirectionSelector(idx)) {
                    path.push(this.tree[i][idx - 1])
                } else {
                    path.push(this.tree[i][idx + 1])
                }
            }
            idx = this.updateIdx(idx)
        }

        this.leafNum ++
        neRoot = this.tree[0][0]

        this.Txs.push(new Witness(preRoot, neRoot, directionSelector, path, origin, changed))
        if (this.Txs.length == TxNum) {
            this.getProof()
            this.Txs = []
        }

        return true
    }

    update(a, idx) {
        if (idx < 0 || idx >= this.ptr || this.del_set.has(idx)) return false

        let preRoot = this.tree[0][0]
        let neRoot
        let directionSelector = []
        let path = []
        let origin
        let changed = a

        origin = this.tree[depth - 1][idx]
        this.tree[depth - 1][idx] = a
        directionSelector.push(this.getDirectionSelector(idx))
        if (this.getDirectionSelector(idx)) {
            path.push(this.tree[depth - 1][idx - 1])
        } else {
            path.push(this.tree[depth-1][idx + 1])
        }
        idx = this.updateIdx(idx)

        for (let i = depth - 2; i >= 0; i--) {
            this.tree[i][idx] = this.pedersen(this.tree[i + 1][2 * idx], this.tree[i + 1][2 * idx + 1])
            if (i != 0) {
                directionSelector.push(this.getDirectionSelector(idx))
                if (this.getDirectionSelector(idx)) {
                    path.push(this.tree[i][idx - 1])
                } else {
                    path.push(this.tree[i][idx + 1])
                }
            }
            idx = this.updateIdx(idx)
        }

        neRoot = this.tree[0][0]
        this.Txs.push(new Witness(preRoot, neRoot, directionSelector, path, origin, changed))
        if (this.Txs.length == TxNum) {
            this.getProof()
            this.Txs = []
        }

        return true
    }

    delete(idx) {
        if (idx < 0 || idx >= this.ptr || this.del_set.has(idx)) return false

        let preRoot = this.tree[0][0]
        let neRoot
        let directionSelector = []
        let path = []
        let origin = this.tree[0][0]
        let changed

        origin = this.tree[depth - 1][idx]
        this.tree[depth - 1][idx] = new Array(8).fill(0)
        changed = this.tree[depth - 1][idx]
        this.del_set.add(idx)
        this.leafNum --
        if (this.getDirectionSelector(idx)) {
            path.push(this.tree[depth - 1][idx - 1])
        } else {
            path.push(this.tree[depth-1][idx + 1])
        }
        idx = this.updateIdx(idx)

        for (let i = depth - 2; i >= 0; i--) {
            this.tree[i][idx] = this.pedersen(this.tree[i + 1][2 * idx], this.tree[i + 1][2 * idx + 1])
            if (i != 0) {
                directionSelector.push(this.getDirectionSelector(idx))
                if (this.getDirectionSelector(idx)) {
                    path.push(this.tree[i][idx - 1])
                } else {
                    path.push(this.tree[i][idx + 1])
                }
            }
            idx = this.updateIdx(idx)
        }

        neRoot = this.tree[0][0]

        this.Txs.push(new Witness(preRoot, neRoot, directionSelector, path, origin, changed))
        if (this.Txs.length == TxNum) {
            this.getProof()
            this.Txs = []
        }

        return true
    }

    printTree() {
        for (let i = 0; i < depth; i++) {
            let str = ""
            for (let j = 0; j < 2 ** i; j++) {
                str = str + JSON.stringify(this.tree[i][j]) + " "
            }
            console.log(str)
        }
    }

    printTxs() {
        for (let i = 0; i < this.Txs.length; i ++) {
            console.log(JSON.stringify(this.Txs[i]))
        }
    }

    getProof() {
        let res = []

        for (let i = 0; i < this.Txs.length; i ++) {
            for (let j = 0; j < 8; j++) {
                res.push(this.Txs[i].preRoot[j])
            }
        }
        for (let j = 0; j < 8; j++) {
            res.push(this.Txs[this.Txs.length - 1].neRoot[j])
        }

        for (let i = 0; i < this.Txs.length; i ++) {
            let Tx = this.Txs[i]
            for (let j = 0; j < Tx.directionSelector.length; j ++) {
                if (Tx.directionSelector[j]) {
                    res.push(1)
                } else {
                    res.push(0)
                }
            }
        }

        for (let i = 0; i < this.Txs.length; i ++) {
            let Tx = this.Txs[i]
            for (let j = 0; j < Tx.path.length; j ++) {
                for (let k = 0; k < 8; k ++) {
                    res.push(Tx.path[j][k])
                }
            }
        }

        for (let i = 0; i < this.Txs.length; i ++) {
            for (let j = 0; j < 8; j++) {
                res.push(this.Txs[i].origin[j])
            }
        }

        for (let i = 0; i < this.Txs.length; i ++) {
            for (let j = 0; j < 8; j++) {
                res.push(this.Txs[i].changed[j])
            }
        }

        let str = ''
        for (let i = 0; i < res.length; i ++) {
            str = str + res[i] + ' '
        }

        return str
    }
}

tree = new MerkleTree()
tree.insert([1,1,1,1,1,1,1,1])
tree.insert([2,2,2,2,2,2,2,2])
// tree.update([2,2,2,2,2,2,2,2], 0)
// tree.delete(0)


// tree.printTree()
tree.printTxs()
console.log(tree.getProof())

