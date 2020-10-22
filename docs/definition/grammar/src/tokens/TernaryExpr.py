from railroad import Sequence, Terminal


def grammar():
    return Sequence(Terminal("<Expr>"),
                    Terminal("?"),
                    Terminal("<Expr>"),
                    Terminal(":"),
                    Terminal("<Expr>"))
