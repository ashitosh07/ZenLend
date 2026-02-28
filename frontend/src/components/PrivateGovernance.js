import React, { useState } from 'react'
import { usePrivateGovernance } from '../hooks/usePrivateGovernance'
import './PrivateGovernance.css'

const PrivateGovernance = () => {
  const {
    proposals,
    userTokenBalance,
    isVoting,
    submitPrivateVote,
    getVotingPower,
    canVote,
    getProposalStatus,
    getTimeRemaining,
  } = usePrivateGovernance()

  const [selectedProposal, setSelectedProposal] = useState(null)
  const [voteChoice, setVoteChoice] = useState('')
  const [voteAmount, setVoteAmount] = useState('')

  const handleVoteSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProposal || !voteChoice || !voteAmount) return

    try {
      const result = await submitPrivateVote(
        selectedProposal.id,
        voteChoice,
        parseInt(voteAmount),
      )

      console.log('Vote submitted successfully:', result)
      setSelectedProposal(null)
      setVoteChoice('')
      setVoteAmount('')
    } catch (error) {
      console.error('Failed to submit vote:', error)
    }
  }

  const openVoteModal = (proposal) => {
    if (canVote(proposal)) {
      setSelectedProposal(proposal)
      setVoteAmount(Math.min(100, userTokenBalance).toString()) // Default to 100 or max balance
    }
  }

  const closeVoteModal = () => {
    setSelectedProposal(null)
    setVoteChoice('')
    setVoteAmount('')
  }

  return (
    <div className='governance-section'>
      <div className='governance-header'>
        <h2>🗳️ Private Governance</h2>
        <p>
          Vote on protocol changes with complete privacy using zero-knowledge
          proofs
        </p>
        <div className='voting-power'>
          <span>Your Voting Power: </span>
          <strong>{getVotingPower().toLocaleString()} ZENLEND</strong>
        </div>
      </div>

      <div className='privacy-notice'>
        <div className='privacy-icon'>🔒</div>
        <div className='privacy-text'>
          <strong>Privacy Guaranteed:</strong>
          <span>
            Your vote choices and amounts are cryptographically hidden using
            Pedersen commitments. Only vote totals are visible.
          </span>
        </div>
      </div>

      <div className='proposals-list'>
        {proposals.map((proposal) => (
          <div key={proposal.id} className={`proposal-card ${proposal.status}`}>
            <div className='proposal-header'>
              <div className='proposal-info'>
                <h3>{proposal.title}</h3>
                <div className='proposal-meta'>
                  <span className={`status-badge ${proposal.status}`}>
                    {getProposalStatus(proposal)}
                  </span>
                  <span className='time-remaining'>
                    {getTimeRemaining(proposal.endDate)}
                  </span>
                </div>
              </div>

              {canVote(proposal) && (
                <button
                  className='btn btn-primary vote-btn'
                  onClick={() => openVoteModal(proposal)}
                >
                  Cast Private Vote
                </button>
              )}

              {proposal.hasVoted && (
                <div className='voted-indicator'>
                  ✓ Voted ({proposal.userVote})
                </div>
              )}
            </div>

            <p className='proposal-description'>{proposal.description}</p>

            <div className='proposal-stats'>
              <div className='stat'>
                <span className='stat-label'>Total Votes:</span>
                <span className='stat-value'>
                  {proposal.totalVotes.toLocaleString()}
                </span>
              </div>
              <div className='stat'>
                <span className='stat-label'>Quorum:</span>
                <span className='stat-value'>
                  {proposal.quorum.toLocaleString()}
                </span>
              </div>
              <div className='stat'>
                <span className='stat-label'>Results:</span>
                <span className='stat-value privacy-hidden'>
                  🔒 Private until ended
                </span>
              </div>
            </div>

            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{
                  width: `${Math.min((proposal.totalVotes / proposal.quorum) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Vote Modal */}
      {selectedProposal && (
        <div className='vote-modal-overlay' onClick={closeVoteModal}>
          <div className='vote-modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>Private Vote</h3>
              <button className='close-btn' onClick={closeVoteModal}>
                ×
              </button>
            </div>

            <div className='modal-content'>
              <div className='proposal-summary'>
                <h4>{selectedProposal.title}</h4>
                <p>{selectedProposal.description}</p>
              </div>

              <form onSubmit={handleVoteSubmit}>
                <div className='form-group'>
                  <label>Vote Choice:</label>
                  <div className='vote-options'>
                    <label className='vote-option'>
                      <input
                        type='radio'
                        name='vote'
                        value='for'
                        checked={voteChoice === 'for'}
                        onChange={(e) => setVoteChoice(e.target.value)}
                      />
                      <span>✅ For</span>
                    </label>
                    <label className='vote-option'>
                      <input
                        type='radio'
                        name='vote'
                        value='against'
                        checked={voteChoice === 'against'}
                        onChange={(e) => setVoteChoice(e.target.value)}
                      />
                      <span>❌ Against</span>
                    </label>
                    <label className='vote-option'>
                      <input
                        type='radio'
                        name='vote'
                        value='abstain'
                        checked={voteChoice === 'abstain'}
                        onChange={(e) => setVoteChoice(e.target.value)}
                      />
                      <span>⚪ Abstain</span>
                    </label>
                  </div>
                </div>

                <div className='form-group'>
                  <label>Vote Weight (ZENLEND tokens):</label>
                  <input
                    type='number'
                    min='1'
                    max={userTokenBalance}
                    value={voteAmount}
                    onChange={(e) => setVoteAmount(e.target.value)}
                    placeholder='Enter token amount'
                    required
                  />
                  <small>
                    Available: {userTokenBalance.toLocaleString()} ZENLEND
                  </small>
                </div>

                <div className='privacy-guarantee'>
                  <div className='zk-proof-info'>
                    <h4>🔬 Zero-Knowledge Privacy</h4>
                    <ul>
                      <li>Your vote choice will be cryptographically hidden</li>
                      <li>Vote weight commitment prevents revelation</li>
                      <li>Nullifier prevents double voting</li>
                      <li>Only vote totals are publicly visible</li>
                    </ul>
                  </div>
                </div>

                <div className='modal-actions'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={closeVoteModal}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={!voteChoice || !voteAmount || isVoting}
                  >
                    {isVoting
                      ? 'Generating ZK Proof...'
                      : 'Submit Private Vote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrivateGovernance
