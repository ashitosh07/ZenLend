"""
ZenLend Commitment System

Private BTC lending with Pedersen commitments and zero-knowledge proofs
"""

from .pedersen import (
    PedersenCommitmentSystem,
    Commitment,
    pedersen_commit,
    btc_to_satoshis,
    satoshis_to_btc
)
from .integration import (
    ZenLendIntegration, 
    format_cairo_calldata,
    parse_cairo_event
)

__version__ = "0.1.0"
__all__ = [
    "PedersenCommitmentSystem",
    "Commitment", 
    "pedersen_commit",
    "btc_to_satoshis",
    "satoshis_to_btc",
    "ZenLendIntegration",
    "format_cairo_calldata",
    "parse_cairo_event"
]