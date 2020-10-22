from railroad import Choice, Terminal


def grammar():
    return Choice(3,
                  Terminal("<Id>"),
                  Terminal("<Literal>"),
                  Terminal("<UnaryExpr>"),
                  Terminal("<BinaryExpr>"),
                  Terminal("<TernaryExpr>"),
                  Terminal("<FnExpr>"),)
