from railroad import Sequence, Optional, ZeroOrMore, Terminal


def grammar():
    return Optional(Sequence(Terminal("<TypedArg>"),
                             ZeroOrMore(Sequence(Terminal(","),
                                                 Terminal("<TypedArg>")))))
