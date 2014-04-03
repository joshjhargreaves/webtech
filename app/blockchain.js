var bitcore           = require('bitcore');
var networks          = bitcore.networks;
var coinUtil          = bitcore.util;
var Block             = bitcore.Block;
var Address           = bitcore.Address;
var Script            = bitcore.Script;
var Peer              = bitcore.Peer;
var Transaction       = bitcore.Transaction
var TransactionIn     = Transaction.In;
var TransactionOut    = Transaction.Out;

var network = networks.maxcoin;

var PeerManager = require('soop').load('bitcore/PeerManager', {
  network: network
});

// get an address from scriptPubKey
var getAddrStr = function(s) {
  var addrStrs = [];
  var type = s.classify();
  var addr;

  switch (type) {
    case Script.TX_PUBKEY:
      var chunk = s.captureOne();
      addr = new Address(network.addressPubkey, coinUtil.namedHash(network.addressHash, chunk));
      addrStrs.push(addr.toString());
      break;
    case Script.TX_PUBKEYHASH:
      addr = new Address(network.addressPubkey, s.captureOne());
      addrStrs.push(addr.toString());
      break;
    case Script.TX_SCRIPTHASH:
      addr = new Address(network.addressScript, s.captureOne());
      addrStrs.push(addr.toString());
      break;
    case Script.TX_MULTISIG:
      var chunks = s.capture();
      chunks.forEach(function(chunk) {
        var a = new Address(network.addressPubkey, coinUtil.namedHash(network.addressHash, chunk));
        addrStrs.push(a.toString());
      });
      break;
    case Script.TX_UNKNOWN:
      console.log('tx type unknown');
      break;
  }
  return addrStrs;
};

// convert a value string to readable form
var readableValue = function(value) {
  return value / 100000000;
}

// callback function for when a p2p connection is established
var handleConnect = function(data) {
  var peerman = data.pm;
  console.log('[Connection] connected to ' + peerman.peers.length + ' peer' + (peerman.peers.length !== 1 ? 's': ''));
};

// callback function when a new block is received
var handleBlock = function(info) {
  var blk = new Block(info.message.block);

  // block hash
  var blkHash = coinUtil.formatHashFull(blk.calcHash())
  console.log('[Connection] received block: %s', blkHash);

  // extract hashes from txs
  var txHashes = blk.txs.map(function(tx) {
    return coinUtil.formatHashFull(tx.hash);
  });

  // extract addresses from txs
  for (var i in blk.txs) {
    var tx = blk.txs[i];
    var txStandarized = tx.getStandardizedObject();
    //console.log(txStandarized);

    // TODO - verify transaction
    // for now we only connect to a local daemon
    // and assume it's trustworthy.

    // set flags
    var knownInputAddr = false;
    var knownOutputAddr = false;

    // set the date variable
    var date = new Date();

    // address stacks
    var inputAddresses = [];
    var outputAddresses = [];

    // other stacks
    var outputValues = [];
    var outputScripts = [];

    // TODO - if we don't know about this tx
    // add it to the database
    var txQuery = {
      tid: 'TODO - unique primary key', // TODO - get this from ORM
      txid: txHashes[i],
      confirmations: 1,
      timestamp: date.getTime(),
      block: blkHash,
    };

    var tid = 'RESULT OF QUERY FOR EXISTING TRANSACTION OR NEW TID';
    
    // inputs
    for (var j in tx.ins) {
      var intx = new TransactionIn(tx.ins[j]);
      //console.log('intx', intx);

      // regular transaction?
      // coinbase transactions don't have inputs
      if (!intx.isCoinBase()) {
        // extract the scriptSig
        // <sig> <pubkey>
        var scriptSig = txStandarized.in[j].scriptSig;

        // TODO - if there are loads of inputs, this can screw up.
        console.log(scriptSig);

        // extract the input address
        var pubkey = new Buffer(scriptSig.split(' ')[1].slice(2), 'hex');
        var inputAddr = new Address(network.addressPubkey, coinUtil.namedHash(network.hashes.addrHash, pubkey));
        //console.log('input address',inputAddr.toString());

        // store input information
        inputAddresses.push(inputAddr.toString());

        // extract output tx
        var prevOut = txStandarized.in[j].prev_out;
        //console.log('input txid',prevOut.hash);

        console.log('input address from previous tx',prevOut.hash,'is',inputAddr.toString());

        // TODO - CHECK WHETHER INPUT ADDRESS IS IN DB

        // 1) search for txid
        //  - update confirmations
        // 2) check for malleability
        //  - check to see if the amount is the same
        //  - and the recipient
        //  - if the time is close, we assume it is due to malleability
        //    - record the fact
        //    - update confirmations of original
        //  - if the time is distant, we assume this is a new tx
        //    - add a new tx to database

        // create a sample query
        var txInputQuery = {
          tid: 'TODO - transaction id',
          address: inputAddr.toString(),
          txid: prevOut,
        };
      }
    }

    // outputs
    for (var j in tx.outs) {
      var outtx = new TransactionOut(tx.outs[j]);
      //console.log('outtx', outtx);

      // extract the address
      var scriptPubKey = outtx.getScript();
      var addrs = getAddrStr(scriptPubKey);

      // ensure transaction type is supported
      // TODO - improve this for multisig txs
      if (addrs.length > 1) {
        console.log('[Connection] cannot handle multiple addresses','tx',txHashes[i],'output index',j);
        throw new Error("Could not handle transaction ouputs with multiple addresses");
      }

      console.log('send',readableValue(outtx.getValue()),'MAX','to',addrs[0]);

      // TODO - IF addrs[0] IS IN OUR DATABASE
      var type = (tx.isCoinBase()) ? 'mining' : 'receive';
      var uid = 'SELECT * FROM user, address WHERE user.uid = address.uid AND address.address = ' + addrs[0];

      var txUserQuery = {
        uid: 'TODO - user id foreign key', // uid
        tid: 'TODO - transaction id',
        type: type,
      };

      var txOutputQuery = {
        tid: 'TODO - transaction id',
        address: addrs[0],
        value: outtx.getValue(),
        script: txStandarized.out[j].scriptPubKey,
      };
    }
  }
};

// callback function when a new transaction is received
var handleTx = function(info) {
  var tx = info.message.tx.getStandardizedObject();
  //console.log('[Connection] received tx: %s', tx.hash);
}

// callback function for when a new inventory
// message is received
var handleInv = function(info) {
  // handle message by referring to other callbacks
  var invs = info.message.invs;
  info.conn.sendGetData(invs);
};

// callback function for when a submitted tx is
// rejected by a peer
var handleReject = function(info) {
  console.log('Transaction Rejected');
}

// send a tx to peers
var sendTx = function(tx) {
  var conn = peerman.getActiveConnection();
  if (conn) {
    conn.sendTx(tx);
  }
}


var createTx = function(value) {
  // INPUT TX OF COINS TO SPEND
  var TXIN = 'd05f35e0bbc495f6dcab03e599c8f5e32a07cdb4bc76964de201d06a2a7d8265';
  // NUMBER OF TX INPUTS????????????????????????????????????
  var TXIN_N = 0;
  // ADDRESS TO SEND TO
  var ADDR = 'mPQERLaEVcj1cMSMX5tyCcCdBeZCkm6GEK';
  // VALUE OF TRANSACTION
  var VAL = '0.001';

  // set up object to populate
  var txobj = {
    version: 1,
    lock_time: 0,
    ins: [],
    outs: []
  };

  // add inputs
  var txin = {
    s: coinUtil.EMPTY_BUFFER, // TODO - SIGNATURE HERE
    q: 0xffffffff
  };

  var hash = new Buffer(TXIN.split('').reverse(), 'hex');
  var vout = parseInt(TXIN_N);
  var voutBuf = new Buffer(4);

  voutBuf.writeUInt32LE(vout, 0);
  txin.o = Buffer.concat([hash, voutBuf]);
  txobj.ins.push(txin);

  var addr = new Address(ADDR);
  var script = Script.createPubKeyHashOut(addr.payload());
  var valueNum = coinUtil.parseValue(VAL);
  var value = coinUtil.bigIntToValue(valueNum);

  var txout = {
    v: value,
    s: script.getBuffer(),
  };
  txobj.outs.push(txout);

  return new Transaction(txobj);
}

// set up the p2p connection to the network
var peerman = new PeerManager();
//peerman.addPeer(new Peer('127.0.0.1', 8333)); // BITCOIN
peerman.addPeer(new Peer('127.0.0.1', 8668)); // MAXCOIN

// set up callback functions
// ref: https://en.bitcoin.it/wiki/Protocol_specification
peerman.on('connect', handleConnect);
peerman.on('connection', function(conn) {
  conn.on('inv', handleInv); // inventory message
  conn.on('block', handleBlock); // new block
  conn.on('tx', handleTx); // transaction received
  conn.on('reject', handleReject); // transaction rejected
});

peerman.start();
