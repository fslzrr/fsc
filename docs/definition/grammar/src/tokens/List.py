from railroad import Sequence, Terminal, ZeroOrMore


def grammar():
    return Sequence(Terminal("["),
                    ZeroOrMore(Terminal("<Value>")),
                    Terminal("]"))