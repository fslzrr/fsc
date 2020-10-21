from railroad import Sequence, Optional, ZeroOrMore, Terminal


def grammar():
    return Optional(Sequence(Terminal("<DataProp>"),
                             ZeroOrMore(Sequence(Terminal(","),
                                                 Terminal("<DataProp>")))))
