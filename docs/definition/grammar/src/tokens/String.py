from railroad import Sequence, ZeroOrMore, Terminal
from tokens import Char


def grammar():
    return Sequence(Terminal('"'), ZeroOrMore(Char.grammar()), Terminal('"'))
