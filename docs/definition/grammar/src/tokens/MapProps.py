from railroad import Sequence, Optional, ZeroOrMore, Terminal


def grammar():
    return Optional(Sequence(Terminal("<MapProp>"),
                             ZeroOrMore(Sequence(Terminal(","),
                                                 Terminal("<MapProp>")))))
