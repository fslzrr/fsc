from railroad import Diagram, OneOrMore
from tokens import Digit


def grammar():
    return OneOrMore(Digit.grammar())
