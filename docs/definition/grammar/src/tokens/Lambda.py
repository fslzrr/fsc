from railroad import Sequence, Terminal


def grammar():
    return Sequence(Terminal("("),
                    Terminal("<TypedArgs>"),
                    Terminal(")"),
                    Terminal("=>"),
                    Terminal("<Expression>"))
