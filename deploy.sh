#!/bin/bash
# ZenLend Deployment Script for Starknet Sepolia Testnet
# This script automates the deployment of the Private BTC Lending platform

set -e

echo "🚀 ZenLend Deployment Script"
echo "=========================="

# Configuration
NETWORK="sepolia"
RPC_URL="https://starknet-sepolia.public.blastapi.io"
ACCOUNT_FILE="$HOME/.starkli-wallets/deployer/keystore.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v scarb &> /dev/null; then
        log_error "Scarb not found. Install from: https://docs.swmansion.com/scarb/install.sh"
        exit 1
    fi
    
    if ! command -v starkli &> /dev/null; then
        log_error "Starkli not found. Install with: curl https://get.starkli.sh | sh"
        exit 1
    fi
    
    if [ ! -f "$ACCOUNT_FILE" ]; then
        log_error "Account keystore not found at $ACCOUNT_FILE"
        log_info "Create with: starkli account oz init --keystore $ACCOUNT_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Compile contracts
compile_contracts() {
    log_info "Compiling contracts..."
    
    scarb clean
    scarb build
    
    if [ ! -f "target/dev/zenlend_private_btc_lending_private_usd.sierra.json" ]; then
        log_error "PUSD contract compilation failed"
        exit 1
    fi
    
    if [ ! -f "target/dev/zenlend_private_btc_lending_private_btc_lending.sierra.json" ]; then
        log_error "Lending contract compilation failed"
        exit 1
    fi
    
    log_success "Contracts compiled successfully"
}

# Deploy Private USD token
deploy_pusd() {
    log_info "Deploying Private USD token..."
    
    # Declare PUSD contract
    PUSD_CLASS_HASH=$(starkli declare target/dev/zenlend_private_btc_lending_private_usd.sierra.json \
        --account $ACCOUNT_FILE \
        --rpc $RPC_URL \
        --compiler-version 2.4.0 | grep "Class hash declared" | awk '{print $4}')
    
    if [ -z "$PUSD_CLASS_HASH" ]; then
        log_error "Failed to declare PUSD contract"
        exit 1
    fi
    
    log_success "PUSD class hash: $PUSD_CLASS_HASH"
    
    # Deploy PUSD instance (owner is deployer account)
    DEPLOYER_ADDRESS=$(starkli account address --account $ACCOUNT_FILE)
    PUSD_ADDRESS=$(starkli deploy $PUSD_CLASS_HASH \
        $DEPLOYER_ADDRESS \
        --account $ACCOUNT_FILE \
        --rpc $RPC_URL | grep "Contract deployed" | awk '{print $3}')
    
    if [ -z "$PUSD_ADDRESS" ]; then
        log_error "Failed to deploy PUSD contract"
        exit 1
    fi
    
    log_success "PUSD deployed at: $PUSD_ADDRESS"
    echo $PUSD_ADDRESS > .pusd_address
}

# Deploy main lending contract
deploy_lending() {
    log_info "Deploying main lending contract..."
    
    if [ ! -f ".pusd_address" ]; then
        log_error "PUSD address not found. Deploy PUSD first."
        exit 1
    fi
    
    PUSD_ADDRESS=$(cat .pusd_address)
    
    # Use testnet WBTC address (mock for demo)
    WBTC_ADDRESS="0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac"
    
    # Declare lending contract
    LENDING_CLASS_HASH=$(starkli declare target/dev/zenlend_private_btc_lending_private_btc_lending.sierra.json \
        --account $ACCOUNT_FILE \
        --rpc $RPC_URL \
        --compiler-version 2.4.0 | grep "Class hash declared" | awk '{print $4}')
    
    if [ -z "$LENDING_CLASS_HASH" ]; then
        log_error "Failed to declare lending contract"
        exit 1
    fi
    
    log_success "Lending class hash: $LENDING_CLASS_HASH"
    
    # Deploy lending instance
    LENDING_ADDRESS=$(starkli deploy $LENDING_CLASS_HASH \
        $PUSD_ADDRESS \
        $WBTC_ADDRESS \
        --account $ACCOUNT_FILE \
        --rpc $RPC_URL | grep "Contract deployed" | awk '{print $3}')
    
    if [ -z "$LENDING_ADDRESS" ]; then
        log_error "Failed to deploy lending contract"
        exit 1
    fi
    
    log_success "Lending contract deployed at: $LENDING_ADDRESS"
    echo $LENDING_ADDRESS > .lending_address
}

# Configure contracts
configure_contracts() {
    log_info "Configuring contract permissions..."
    
    PUSD_ADDRESS=$(cat .pusd_address)
    LENDING_ADDRESS=$(cat .lending_address)
    
    # Set lending contract as authorized minter for PUSD
    starkli invoke $PUSD_ADDRESS \
        set_lending_contract $LENDING_ADDRESS \
        --account $ACCOUNT_FILE \
        --rpc $RPC_URL
    
    log_success "Contract configuration completed"
}

# Generate deployment summary
generate_summary() {
    log_info "Generating deployment summary..."
    
    PUSD_ADDRESS=$(cat .pusd_address)
    LENDING_ADDRESS=$(cat .lending_address)
    DEPLOYER_ADDRESS=$(starkli account address --account $ACCOUNT_FILE)
    
    cat > DEPLOYMENT_SUMMARY.md << EOF
# ZenLend Deployment Summary

**Network:** Starknet Sepolia Testnet
**Deployed at:** $(date)

## Contract Addresses

| Contract | Address |
|----------|---------|
| Private USD (PUSD) | \`$PUSD_ADDRESS\` |
| ZenLend Lending | \`$LENDING_ADDRESS\` |
| Deployer Account | \`$DEPLOYER_ADDRESS\` |

## Verification Links

- **PUSD Token:** https://sepolia.starkscan.co/contract/$PUSD_ADDRESS
- **Lending Contract:** https://sepolia.starkscan.co/contract/$LENDING_ADDRESS

## Frontend Configuration

Update \`frontend/zenlend.html\` with these addresses:

\`\`\`javascript
const CONTRACTS = {
    LENDING: "$LENDING_ADDRESS",
    PUSD: "$PUSD_ADDRESS",
    WBTC: "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac"
};
\`\`\`

## Test Commands

\`\`\`bash
# Check protocol stats
starkli call $LENDING_ADDRESS get_protocol_stats --rpc $RPC_URL

# Check PUSD token info
starkli call $PUSD_ADDRESS name --rpc $RPC_URL
starkli call $PUSD_ADDRESS symbol --rpc $RPC_URL
\`\`\`

## Next Steps

1. Update frontend with contract addresses
2. Test deposit/mint flow through UI
3. Verify commitment generation
4. Test liquidation functionality
5. Create demo video

---
Generated by ZenLend deployment script
EOF
    
    log_success "Deployment summary saved to DEPLOYMENT_SUMMARY.md"
}

# Main deployment flow
main() {
    echo
    log_info "Starting ZenLend deployment process..."
    echo
    
    check_prerequisites
    compile_contracts
    deploy_pusd
    deploy_lending
    configure_contracts
    generate_summary
    
    echo
    log_success "🎉 ZenLend deployment completed successfully!"
    echo
    log_info "Next steps:"
    echo "  1. Review DEPLOYMENT_SUMMARY.md"
    echo "  2. Update frontend contract addresses"
    echo "  3. Test the application end-to-end"
    echo "  4. Create demo video for submission"
    echo
    log_warning "Remember to save your contract addresses for the hackathon submission!"
}

# Run main function
main "$@"