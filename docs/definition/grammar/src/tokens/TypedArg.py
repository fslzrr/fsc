from railroad import Sequence, Terminal


def grammar():
    return Sequence(Terminal("<Id>"),
                    Terminal(":"),
                    Terminal("<TypeId>"))
