from railroad import Choice, Sequence, Terminal


def grammar():
    return Choice(1,
                  Sequence(Terminal("<Expr>"),
                           Terminal("<BinaryOpr>"),
                           Terminal("<Expr>")),
                  Sequence(Terminal("("),
                           Terminal("<Expr>"),
                           Terminal("<BinaryOpr>"),
                           Terminal("<Expr>"),
                           Terminal(")")))
