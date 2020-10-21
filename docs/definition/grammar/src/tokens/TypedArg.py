from railroad import Sequence, Terminal
from tokens import Id, TypeId


def grammar():
    return Sequence(Id.grammar(), Terminal(":"), TypeId.grammar())
