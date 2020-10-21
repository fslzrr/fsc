from railroad import Sequence, Terminal
from tokens import Id


def grammar():
    return Sequence(Id.grammar(), Terminal(":"), Terminal("<Value>"))
