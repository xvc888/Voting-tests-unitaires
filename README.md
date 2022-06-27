# Voting Contrat Tests

## Les tests sont groupés tels que suit:

- OWNER privilèges
- SETTERS et VOTES
- GETTERS
- STATUS CHANGE
- REQUIRES 
- EVENTS

## Testing des Privilèges OWNER 
- Should addvoter only if owner (51ms, 24502 gas)
- Should StartProposalRegistering only if owner (51ms, 23804 gas)
- Should endProposalRegistering only if owner (40ms, 23826 gas)
- Should startVotingSession only if owner (43ms, 23781 gas)
- Should endVotingSession only if owner (39ms, 23760 gas)
- Should tallyVotes only if owner (40ms, 23805 gas)

## Testing des VOTER Privilèges
- Should getVoter only if voter (23ms)
- Should getOneProposal only if voter (52ms)
- Should addProposal only if voter (52ms, 25087 gas)
- Should setVote only if voter (41ms, 24157 gas)

# Testing SETTERS
- Should add a proposal (149ms, 174481 gas)
- Should set vote if wf status is votingSession started (311ms, 293615 gas)

# Testing des GETTERS
- Should get winningId Proposal, tally votes (392ms, 361973 gas)
- Should change Voter status to true in Voter Struct (56ms, 50196 gas)
- Should revert if voter is not registered when getVoter is called (15ms)
- Should return voter when getVoter is called (63ms, 50196 gas)
- Should return a proposal id when getOneProposal is called (309ms, 233869 gas)

#  STATUS Change
- Vérifie que le wf status est bien ProposalsResgistrationStarted (53ms, 47653 gas)
- Vérifie le require de startProposalsRegistering (37ms, 23804 gas)
- Vérifie le require de endProposalsRegistering (74ms, 49881 gas)
- Vérifie le require de startVotingSession (67ms, 49791 gas)
- Vérifie le require de endVotingSession (70ms, 49749 gas)
- Vérifie le require de tallyVotes (52ms, 49839 gas)

#  REQUIRES
- Should add voters only if RegisteringVoters has started (46ms, 74384 gas)
- Should register voter only once (52ms, 79176 gas)
- Should add proposal only ProposalsRegistration is started (64ms, 77494 gas)
- Should not be able to add an empty proposal (86ms, 125824 gas)
- Should set vote only if VotingSession has started (48ms, 76582 gas)
- A voter should only be able to vote once (193ms, 320359 gas)
- Should only vote for an existing proposal (161ms, 216596 gas)

#  Tests des EVENTS
- Should add voter, get event VoterRegistered (28ms, 50196 gas)
- Should add proposal, get event ProposalRegistered (139ms, 174481 gas)
- Should set vote, get event Voted (155ms, 293615 gas)
- Should change wfs to ProposalsRegistrationStarted, get workflowStatusChange event  (84ms, 47653 gas)
- Should change wfs to ProposalsRegistrationEnded, get workflowStatusChange event (49ms, 78228 gas)
- Should change wfs to VotingSessionStarted, get workflowStatusChange event(70ms, 108758 gas)
- Should change wfs to VotingSessionEnded, get workflowStatusChange event (100ms, 139267 gas)
- Should change wfs to Votes Tallied, get workflowStatusChange event (131ms, 174188 gas)

