from railroad import Sequence, ZeroOrMore, Terminal


def grammar():
    return Sequence(Terminal('"'),
                    ZeroOrMore(Terminal("<Char>")),
                    Terminal('"'))
