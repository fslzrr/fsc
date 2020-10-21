from railroad import Sequence, Terminal, Optional, ZeroOrMore
from tokens import Id


def grammar():
    return Sequence(Terminal("{"),
                    Terminal("<DataProps>"),
                    Terminal("}"))
