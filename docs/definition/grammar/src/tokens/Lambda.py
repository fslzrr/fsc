from railroad import Sequence, Terminal


def grammar():
    return Sequence(Terminal("("),
                    Terminal("<Args>"),
                    Terminal(")"),
                    Terminal("=>"),
                    Terminal("<Expr>"))
