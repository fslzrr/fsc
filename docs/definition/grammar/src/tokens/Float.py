from railroad import Sequence, ZeroOrMore, Terminal, OneOrMore


def grammar():
    return Sequence(ZeroOrMore(Terminal("<Digit>")),
                    Terminal('.'),
                    OneOrMore(Terminal("<Digit>")))
