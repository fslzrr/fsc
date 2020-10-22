from railroad import Sequence, Terminal, Optional, ZeroOrMore


def grammar():
    return Sequence(Terminal("{"),
                    Terminal("<DataProps>"),
                    Terminal("}"))
