var Election = artifacts.require("../contracts/Election.sol");
const { time } = require('@openzeppelin/test-helpers');


contract("Election", function(accounts) {
  var electionInstance;
  var candidatesCount = 0;

  it("registers elector as Candidate 1", function(){
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.registerCandidate("Alex", "", { from: accounts[0] })
    }).then(function(receipt){
      candidatesCount ++;
      return electionInstance.candidates(candidatesCount);
    }).then(function(receipt) {
      assert.equal(candidatesCount,1,"2 Candidates");
      assert.equal(receipt.id,candidatesCount,"contains the correct id");
      assert.equal(receipt.name, "Alex","contains the correct name");
      assert.equal(receipt.approved, false,"not yet approved");
      assert.equal(receipt.voteCount, 0,"0 Votes");
    });
  });

  it("Re-registering elector as Candidate 1 throws Error", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.registerCandidate("Zaplin", "", { from: accounts[0] })
    }).then(assert.fail)
    .catch(function(error) {
      assert.equal(error.reason, "Already Registered");
    })
  });

  it("approving Candidate 1 by admin", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.approve(candidatesCount, {from: accounts[0]})
    }).then(function(receipt){
      return electionInstance.candidates(candidatesCount);
    }).then(function(receipt) {
      assert.equal(receipt.id,candidatesCount,"contains the correct id");
      assert.equal(receipt.approved, true,"Approved by Admin");
      assert.equal(receipt.name, "Alex","contains the correct name");
      assert.equal(receipt.voteCount, 0,"0 Votes");
    });
  });

  it("registers elector as Candidate 2", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.registerCandidate("Harpan", "", { from: accounts[1] })
    }).then(function(receipt){
      candidatesCount ++;
      return electionInstance.candidates(candidatesCount);
    }).then(function(receipt) {
      assert.equal(candidatesCount,2,"2 Candidates");
      assert.equal(receipt.id,candidatesCount,"contains the correct id");
      assert.equal(receipt.name, "Harpan","contains the correct name");
      assert.equal(receipt.approved, false,"not yet approved");
      assert.equal(receipt.voteCount, 0,"0 Votes");
    });
  });

  it("approving Candidate 2 by admin", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.approve(candidatesCount, {from: accounts[0]})
    }).then(function(receipt){
      return electionInstance.candidates(candidatesCount);
    }).then(function(receipt) {
      assert.equal(receipt.id,candidatesCount,"contains the correct id");
      assert.equal(receipt.approved, true,"Approved by Admin");
      assert.equal(receipt.name, "Harpan","contains the correct name");
      assert.equal(receipt.voteCount, 0,"0 Votes");
    });
  });

  //add test fail for approving invalidate candidates. and re approving again
  //add test fail for invalid value @startVoting

  it("fails when admin starts voting process with time <= 0 ", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.startVote(0,{ from: accounts[0] })
    })
    .then(assert.fail)
    .catch(function(error) {
      assert.equal(error.reason, "Voting in Progress");
    })
  });

  it("throws error when admin stops voting process before start ", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.stopVote({ from: accounts[0] })
    })
    .then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
        return electionInstance.votingProcess();
      })
    .then(function(votingProcess) {
      assert.equal(votingProcess,false,"election not in progress");
    })
  });

  it("admin starts voting process ", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.startVote(1,{ from: accounts[0] })
    }).then(function(receipt) {
      return electionInstance.votingProcess();
    }).then(function(votingProcess) {
      assert.equal(votingProcess,true,"election in progress");
    })
  });

  it("admin starts voting process again before end of time period", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.startVote(1,{ from: accounts[0] })
    }).then(function(receipt) {
      return electionInstance.votingProcess();
    }).then(assert.fail)
    .catch(function(error) {
      assert.equal(error.reason, "Voting in Progress");
    })
  });



  it("allows a voter to cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.vote(candidateId, { from: accounts[0] })
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      assert.equal(candidate.voteCount, 1, "increments the candidate's vote count");
    })
  });


  it("throws an exception for invalid candiates", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidate_id = 99;
      return electionInstance.vote(candidate_id, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(candidate_id); //from unapproved account
    })
    .then(function(candidate) {
      assert.equal(candidate.approved, false, "candidate 99 is not approved");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      assert.equal(candidate1.voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      assert.equal(candidate2.voteCount, 0, "candidate 2 did not receive any votes");
    });
  });


  it("throws an exception for double voting", function() {
  return Election.deployed().then(function(instance) {
    electionInstance = instance;
    candidateId = 2;
    return electionInstance.vote(candidateId, { from: accounts[1] });
  }).then(function(instance){
    return electionInstance.candidates(candidateId);
  }).then(function(candidate) {
    assert.equal(candidate.voteCount, 1, "accepts first vote");
    // Try to vote again
    return electionInstance.vote(candidateId, { from: accounts[1] });
  }).then(assert.fail).catch(function(error) {
    assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
    return electionInstance.candidates(1);
  }).then(function(candidate1) {
    assert.equal(candidate1.voteCount, 1, "candidate 1 did not receive any votes");
    return electionInstance.candidates(2);
  }).then(function(candidate2) {
    assert.equal(candidate2.voteCount, 1, "candidate 2 did not receive any votes");
  });
});


it("admin stops voting process ", async() => {
  return Election.deployed().then(function(instance) {
    electionInstance = instance;
    time.increase(time.duration. minutes(2));
  }).then (function() {
    return electionInstance.stopVote({ from: accounts[0] });
  }).then(function(receipt) {
    return electionInstance.votingProcess();
  }).then(function(votingProcess) {
    assert.equal(votingProcess,false,"Election Ended");
    return electionInstance.candidates(1);
  }).then(function(candidate){
    assert.equal(candidate.id, 0, "id emptied");
    assert.equal(candidate.candidate_address, '0x0000000000000000000000000000000000000000', "address empty");
    assert.equal(candidate.name, '', "name emptied");
    assert.equal(candidate.voteCount, 0, "vote count emptied");
    assert.equal(candidate.approved, false, "approved falsified");
    assert.equal(candidate.image_addr, '', "image_addr emptied");
    return electionInstance.candidates(2);
  }).then(function(candidate){
    assert.equal(candidate.id, 0, "id emptied");
    assert.equal(candidate.candidate_address, '0x0000000000000000000000000000000000000000', "address empty");
    assert.equal(candidate.name, '', "name emptied");
    assert.equal(candidate.voteCount, 0, "vote count emptied");
    assert.equal(candidate.approved, false, "approved falsified");
    assert.equal(candidate.image_addr, '', "image_addr emptied");
  })
  .then(function(receipt) {
    return electionInstance.gift_claimed();
  }).then(function(gift_claimed) {
    assert.equal(gift_claimed,false,"gift_claimed false");
    return electionInstance.startTime();
  }).then(function(startTime) {
    assert.equal(startTime,0,"start time reset");
    return electionInstance.endTime();
  }).then(function(endTime) {
    assert.equal(endTime,0,"endTime reset");
    return electionInstance.candidatesCount();
  }).then(function(candidatesCount) {
    assert.equal(candidatesCount,0,"candidatesCount 0");
    return electionInstance.candidates(1);
  }).then(function(candidate1) {
    return electionInstance.addressmap(candidate1.candidate_address);
  }).then(function(candidate_id) {
    //emptying addressmap for candidate1
    assert.equal(candidate_id,0,"candidate_id 0");
    return electionInstance.candidates(2);
  }).then(function(candidate1) {
    return electionInstance.addressmap(candidate1.candidate_address);
  }).then(function(candidate_id) {
    //emptying addressmap for candidate1
    assert.equal(candidate_id,0,"candidate_id 0");
  })
});



});
