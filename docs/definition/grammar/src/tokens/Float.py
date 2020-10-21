from railroad import Sequence, ZeroOrMore, Terminal, OneOrMore
from tokens import Digit


def grammar():
    return Sequence(ZeroOrMore(Digit.grammar()), Terminal('.'), OneOrMore(Digit.grammar()))
