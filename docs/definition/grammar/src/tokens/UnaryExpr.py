from railroad import Sequence, Terminal, Choice


def grammar():
    return Sequence(Terminal("<UnaryOpr>"),
                    Choice(1,
                           Terminal("<Expr>"),
                           Sequence(Terminal('('),
                                    Terminal("<Expr>"),
                                    Terminal(")"))))
