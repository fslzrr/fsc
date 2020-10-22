from railroad import Sequence, Optional, ZeroOrMore, Terminal


def grammar():
    return Optional(Sequence(Terminal("<Id>"),
                             ZeroOrMore(Sequence(Terminal(","),
                                                 Terminal("<Id>")))))
